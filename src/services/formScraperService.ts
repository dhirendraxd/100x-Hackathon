/**
 * Real AI-powered Form Scraper Service
 * Uses Hugging Face models for OCR and field extraction
 */

import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  GovernmentForm, 
  OriginalFormField, 
  FormSection, 
  FieldType, 
  FormDifficulty,
  RequiredDocument,
  GovernmentDepartment,
  DocumentType 
} from '@/types/governmentForms';
import { 
  detectFormLayout, 
  generateFormStructure,
  isHuggingFaceConfigured 
} from './huggingface';
import { extractTextSmartFromBase64, ExtractionResult } from './textExtraction';

/**
 * Remove undefined fields from an object recursively (for Firestore compatibility)
 */
function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item)) as T;
  }
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = removeUndefinedFields(value);
    }
  }
  return result as T;
}

/**
 * Manual text parsing helper - extracts form fields from OCR text WITHOUT AI
 */
function parseTextToFields(text: string, documentType: string): Array<{
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}> {
  const fields: Array<{ label: string; type: string; required: boolean; options?: string[] }> = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  console.log(`[Parser] Processing ${lines.length} lines of text`);
  console.log('[Parser] First 10 lines:', lines.slice(0, 10));
  
  // Common field patterns for passport/government forms
  const knownFields = [
    'LAST NAME', 'FIRST NAME', 'MIDDLE NAME', 'SURNAME', 'GIVEN NAME',
    'DATE OF BIRTH', 'PLACE OF BIRTH', 'GENDER', 'SEX',
    'ADDRESS', 'MAILING ADDRESS', 'COMPLETE MAILING ADDRESS', 'RESIDENTIAL ADDRESS',
    'OCCUPATION', 'PRESENT OCCUPATION', 'WORK ADDRESS',
    'EMAIL', 'EMAIL ADD', 'E-MAIL', 'MOBILE', 'MOBILE NO', 'TEL NO', 'TELEPHONE',
    'FATHER', 'MOTHER', 'SPOUSE', 'WIFE', 'HUSBAND',
    'CITIZENSHIP', 'NATIONALITY', 'CIVIL STATUS', 'MARITAL STATUS',
    'PASSPORT', 'ID', 'OR NO', 'SRV NO',
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Pattern 1: Lines with underscores "Name: _____" or "Name _____"
    if (line.includes('___') || line.includes('__') || line.includes('_')) {
      const beforeUnderscore = line.split(/[_]+/)[0].trim();
      if (beforeUnderscore.length > 2 && beforeUnderscore.length < 100) {
        const label = beforeUnderscore
          .replace(/:\s*$/, '')
          .replace(/\s+$/, '')
          .trim();
        
        if (label.length > 2 && !/^[_\-:\s]+$/.test(label)) {
          console.log(`[Parser] Found underscore field: "${label}"`);
          fields.push({
            label,
            type: detectFieldType(label),
            required: isRequiredField(label, line),
          });
        }
      }
      continue;
    }
    
    // Pattern 2: Known field labels (case-insensitive match)
    for (const knownField of knownFields) {
      if (upperLine.includes(knownField)) {
        // Check if this line looks like a field label
        // Avoid headers and instructions
        if (line.length < 150 && !upperLine.includes('PLEASE') && !upperLine.includes('PROVIDE')) {
          // Extract the actual label from the line
          let label = line;
          
          // If line has "/" separator (like "LAST NAME / APELYIDO"), take the first part
          if (line.includes('/')) {
            const parts = line.split('/');
            label = parts[0].trim();
          }
          
          // Remove trailing colons
          label = label.replace(/:\s*$/, '').trim();
          
          if (label.length > 2 && label.length < 100) {
            // Check if we already added this field
            const isDuplicate = fields.some(f => 
              f.label.toUpperCase() === label.toUpperCase()
            );
            
            if (!isDuplicate) {
              console.log(`[Parser] Found known field: "${label}"`);
              fields.push({
                label,
                type: detectFieldType(label),
                required: isRequiredField(label, line),
              });
              break; // Move to next line
            }
          }
        }
      }
    }
    
    // Pattern 3: Lines with colon that might be field labels "Field Name:"
    if (line.includes(':') && !line.includes('http') && !line.includes('//')) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const afterColon = parts.slice(1).join(':').trim();
        
        // If nothing after colon or looks like a blank, it's likely a field
        if (label.length > 2 && label.length < 100 && afterColon.length < 50) {
          if (/^[A-Za-z\s/()]+$/.test(label)) {
            const isDuplicate = fields.some(f => 
              f.label.toUpperCase() === label.toUpperCase()
            );
            
            if (!isDuplicate) {
              console.log(`[Parser] Found colon field: "${label}"`);
              fields.push({
                label,
                type: detectFieldType(label),
                required: isRequiredField(label, line),
              });
            }
          }
        }
      }
      continue;
    }
    
    // Pattern 3: Checkbox patterns "[ ] Option" or "☐ Option"
    if (line.includes('[ ]') || line.includes('☐') || line.includes('□')) {
      const label = line.replace(/\[\s*\]/g, '').replace(/[☐□]/g, '').trim();
      if (label.length > 0 && label.length < 100) {
        fields.push({
          label,
          type: 'checkbox',
          required: false,
        });
      }
      continue;
    }
    
    // Pattern 4: Radio button patterns "( ) Option" or "○ Option"
    if (line.includes('( )') || line.includes('○') || line.includes('◯')) {
      const label = line.replace(/\(\s*\)/g, '').replace(/[○◯]/g, '').trim();
      if (label.length > 0 && label.length < 100) {
        // If next few lines also have radio patterns, collect as options
        const options: string[] = [label];
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.includes('( )') || nextLine.includes('○') || nextLine.includes('◯')) {
            const option = nextLine.replace(/\(\s*\)/g, '').replace(/[○◯]/g, '').trim();
            if (option.length > 0) options.push(option);
          } else {
            break;
          }
        }
        
        if (options.length > 1) {
          fields.push({
            label: `Select ${label}`,
            type: 'radio',
            required: false,
            options,
          });
          i += options.length - 1; // Skip processed lines
        } else {
          fields.push({
            label,
            type: 'checkbox',
            required: false,
          });
        }
      }
      continue;
    }
  }
  
  console.log(`[Parser] Total fields detected: ${fields.length}`);
  
  // If no fields found, create some fallback fields based on document type
  if (fields.length === 0) {
    console.warn('[Parser] No fields detected, using fallback');
    return generateFallbackFields(documentType, text);
  }
  
  return fields;
}

/**
 * Detect field type based on label keywords
 */
function detectFieldType(label: string): string {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('email')) return 'email';
  if (lowerLabel.includes('phone') || lowerLabel.includes('mobile') || lowerLabel.includes('contact')) return 'tel';
  if (lowerLabel.includes('date') || lowerLabel.includes('birth') || lowerLabel.includes('dob')) return 'date';
  if (lowerLabel.includes('address') || lowerLabel.includes('description') || lowerLabel.includes('details')) return 'textarea';
  if (lowerLabel.includes('gender') || lowerLabel.includes('category') || lowerLabel.includes('select')) return 'select';
  if (lowerLabel.includes('agree') || lowerLabel.includes('accept') || lowerLabel.includes('confirm')) return 'checkbox';
  if (lowerLabel.includes('number') || lowerLabel.includes('age') || lowerLabel.includes('pin') || lowerLabel.includes('code')) return 'number';
  
  return 'text'; // Default
}

/**
 * Check if field is required based on markers like *, (required), mandatory
 */
function isRequiredField(label: string, fullLine: string): boolean {
  const combined = (label + ' ' + fullLine).toLowerCase();
  return combined.includes('*') || 
         combined.includes('required') || 
         combined.includes('mandatory') ||
         combined.includes('(req)') ||
         combined.includes('必須'); // Japanese for required
}

/**
 * Scrape a government form using AI
 */
export const scrapeGovernmentForm = async (
  imageBase64: string,
  formTitle: string,
  documentType: string
): Promise<GovernmentForm> => {
  try {
    console.log('Starting form scraping (manual parsing - NO AI for field extraction)...');
    
    // Step 1: Smart text extraction from image/PDF/DOCX
    console.log('Step 1: Smart text extraction (image/PDF/DOCX)...');
    const extraction: ExtractionResult = await extractTextSmartFromBase64(imageBase64);
    const extractedText = extraction.fullText || '';
    console.log(`Extraction completed via ${extraction.method}. Extracted ${extractedText.length} characters across ${extraction.summary.pages} page(s).`);
    console.log('[DEBUG] First 500 chars of extracted text:', extractedText.substring(0, 500));
    console.log('[DEBUG] Text contains underscores?', extractedText.includes('_'));
    console.log('[DEBUG] Text contains colons?', extractedText.includes(':'));    // Step 2: Save extracted text to intermediate JSON (for AI input later)
    const formId = `form_${Date.now()}`;
    const intermediateData = {
      formId,
      formTitle,
      documentType,
      source: {
        mimeType: extraction.mimeType,
      },
      extraction: {
        method: extraction.method,
        summary: extraction.summary,
        pages: extraction.pages,
      },
      extractedText,
      extractedAt: new Date().toISOString(),
    };
    console.log('Step 2: Saving extracted text to JSON...');
    localStorage.setItem(`ocr_output_${formId}`, JSON.stringify(intermediateData, null, 2));
    console.log('Extracted text saved internally');
    
    // Step 3: Parse extracted text manually (NO AI) to create form fields
    console.log('Step 3: Parsing text manually to extract form fields (no AI)...');
    const parsedFields = parseTextToFields(extractedText, documentType);
    console.log(`Manually parsed ${parsedFields.length} fields from text`);
    
    // Step 4: Convert to OriginalFormField format
    const originalFields: OriginalFormField[] = parsedFields.map((field, index) => {
      const formField: OriginalFormField = {
        id: `field_${Date.now()}_${index}`,
        label: field.label,
        type: field.type as FieldType,
        section: 'main',
        position: {
          page: 1,
          x: 0,
          y: index * 50,
          width: 100,
          height: 40,
        },
        required: field.required,
      };
      
      // Only add optional fields if they have values
      if (field.options && field.options.length > 0) {
        formField.options = field.options;
      }
      
      if (field.required) {
        formField.validation = [{ type: 'required', message: `${field.label} is required` }];
      }
      
      return formField;
    });
    
    // Generate sections
    const sections = generateSections(originalFields);
    
    // Extract required documents from text
    const requiredDocuments = extractRequiredDocuments(extractedText);
    
    // Create form object
    const form: GovernmentForm = {
      id: formId,
      name: formTitle,
      department: 'other' as GovernmentDepartment,
      documentType: mapDocumentType(documentType),
      version: '1.0',
      difficulty: originalFields.length > 10 ? 'hard' : originalFields.length > 5 ? 'medium' : 'easy',
      requiredDocuments,
      sections,
      originalFields,
      annotations: [],
      
      aiAnalysis: {
        complexityScore: originalFields.length > 10 ? 0.8 : originalFields.length > 5 ? 0.5 : 0.3,
        estimatedCompletionMinutes: Math.max(5, Math.ceil(originalFields.length / 2)),
        legalTermsCount: 0,
      },
      
      isActive: true,
      isVerified: false,
      needsUpdate: false,
      tags: [documentType.toLowerCase(), 'manually-parsed'],
      keywords: [],
      
      // Timestamps will be set by Firestore serverTimestamp() when saved
      // Use null instead of empty objects to avoid Firestore errors
      createdAt: null as unknown as Timestamp,
      updatedAt: null as unknown as Timestamp,
      scrapedAt: null as unknown as Timestamp,
    };
    
    // Save to localStorage
    const existingForms = JSON.parse(localStorage.getItem('scraped_forms') || '[]');
    existingForms.push(form);
    localStorage.setItem('scraped_forms', JSON.stringify(existingForms));
    localStorage.setItem(`scraped_form_json_${formId}`, JSON.stringify(form, null, 2));
    
    console.log('Form scraping completed successfully');
    return form;
  } catch (error) {
    console.error('Form scraping error:', error);
    throw error;
  }
};

/**
 * Map document type string to DocumentType enum
 */
const mapDocumentType = (type: string): DocumentType => {
  const lower = type.toLowerCase();
  if (lower.includes('passport')) return 'passport';
  if (lower.includes('pan')) return 'pan-card';
  if (lower.includes('license') || lower.includes('driving')) return 'driving-license';
  if (lower.includes('voter')) return 'voter-id';
  if (lower.includes('citizenship')) return 'citizenship';
  if (lower.includes('business')) return 'business-registration';
  if (lower.includes('tax')) return 'tax-return';
  if (lower.includes('land')) return 'land-registration';
  return 'other';
};

/**
 * Generate fallback fields if AI parsing fails
 */
const generateFallbackFields = (documentType: string, extractedText: string): Array<{ label: string; type: string; required: boolean; options?: string[] }> => {
  const commonFields = [
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Date of Birth', type: 'date', required: true },
    { label: 'Email Address', type: 'email', required: true },
    { label: 'Phone Number', type: 'phone', required: true },
    { label: 'Address', type: 'address', required: true },
  ];
  
  // Try to extract field-like patterns from text
  const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
  const extractedFields = lines
    .filter(line => line.includes(':') || line.endsWith('?'))
    .map(line => {
      const label = line.replace(/[:?]/g, '').trim();
      return {
        label,
        type: guessFieldType(label),
        required: false,
      };
    })
    .slice(0, 10);
  
  if (extractedFields.length > 0) {
    return extractedFields;
  }
  
  return commonFields;
};

/**
 * Guess field type from label
 */
const guessFieldType = (label: string): string => {
  const lower = label.toLowerCase();
  if (lower.includes('email')) return 'email';
  if (lower.includes('phone') || lower.includes('mobile')) return 'phone';
  if (lower.includes('date') || lower.includes('dob')) return 'date';
  if (lower.includes('address')) return 'address';
  if (lower.includes('age') || lower.includes('number')) return 'number';
  if (lower.includes('gender') || lower.includes('select')) return 'select';
  return 'text';
};

/**
 * Extract required documents mentioned in the form text
 */
const extractRequiredDocuments = (text: string): RequiredDocument[] => {
  const documents: RequiredDocument[] = [];
  const lower = text.toLowerCase();
  
  // Common document patterns
  const documentPatterns = [
    { pattern: /passport/i, name: 'Passport', type: 'passport' as DocumentType, description: 'Valid passport document' },
    { pattern: /pan\s*card/i, name: 'PAN Card', type: 'pan-card' as DocumentType, description: 'Permanent Account Number card' },
    { pattern: /aadhaar|aadhar/i, name: 'Aadhaar Card', type: 'citizenship' as DocumentType, description: 'Aadhaar identification card' },
    { pattern: /voter\s*id/i, name: 'Voter ID', type: 'voter-id' as DocumentType, description: 'Voter identification card' },
    { pattern: /driving\s*license|licence/i, name: 'Driving License', type: 'driving-license' as DocumentType, description: 'Valid driving license' },
    { pattern: /birth\s*certificate/i, name: 'Birth Certificate', type: 'other' as DocumentType, description: 'Official birth certificate' },
    { pattern: /address\s*proof/i, name: 'Address Proof', type: 'other' as DocumentType, description: 'Document verifying residential address' },
    { pattern: /photo\s*id/i, name: 'Photo ID', type: 'other' as DocumentType, description: 'Government-issued photo identification' },
    { pattern: /income\s*certificate/i, name: 'Income Certificate', type: 'other' as DocumentType, description: 'Certificate of income' },
    { pattern: /bank\s*statement/i, name: 'Bank Statement', type: 'other' as DocumentType, description: 'Recent bank account statement' },
    { pattern: /utility\s*bill/i, name: 'Utility Bill', type: 'other' as DocumentType, description: 'Electricity/water bill for address proof' },
    { pattern: /passport\s*size\s*photo/i, name: 'Passport Size Photo', type: 'other' as DocumentType, description: 'Recent passport-sized photograph' },
  ];
  
  documentPatterns.forEach(({ pattern, name, type, description }, index) => {
    if (pattern.test(lower)) {
      documents.push({
        id: `doc_${index}`,
        name,
        type,
        description,
        required: true,
        acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
      });
    }
  });
  
  return documents;
};

/**
 * Generate sections from fields
 */
const generateSections = (fields: OriginalFormField[]): FormSection[] => {
  const sections: FormSection[] = [];
  const fieldsPerSection = 5;
  
  for (let i = 0; i < fields.length; i += fieldsPerSection) {
    const sectionFields = fields.slice(i, i + fieldsPerSection);
    const sectionNumber = Math.floor(i / fieldsPerSection);
    sections.push({
      id: `section_${sectionNumber}`,
      title: i === 0 ? 'Personal Information' : `Section ${sectionNumber + 1}`,
      order: sectionNumber,
      fields: sectionFields.map(f => f.id),
    });
  }
  
  return sections;
};

/**
 * Publish a scraped form to the library
 */
export const publishScrapedForm = async (
  form: GovernmentForm,
  userId: string,
  userName: string,
  userEmail: string
): Promise<void> => {
  try {
    const publishedForm: GovernmentForm = {
      ...form,
      published: true,
      publishedByUserId: userId,
      publishedByName: userName,
      publishedByEmail: userEmail,
      publishedAt: null as unknown as Timestamp, // Will be set by serverTimestamp in Firestore
    };
    
    // Save to Firestore (non-blocking)
    if (db) {
      const formRef = doc(db, 'government_forms', form.id!);
      
      // Remove undefined fields and temporary timestamp placeholders before saving
      const cleanForm = removeUndefinedFields({
        ...publishedForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      });
      
      await setDoc(formRef, cleanForm).catch(err => {
        console.warn('Failed to save to Firestore:', err);
      });
    }
    
    // Update in localStorage
    const existingForms = JSON.parse(localStorage.getItem('scraped_forms') || '[]');
    const formIndex = existingForms.findIndex((f: GovernmentForm) => f.id === form.id);
    if (formIndex >= 0) {
      existingForms[formIndex] = publishedForm;
    } else {
      existingForms.push(publishedForm);
    }
    localStorage.setItem('scraped_forms', JSON.stringify(existingForms));
    
    console.log('Form published successfully');
  } catch (error) {
    console.error('Error publishing form:', error);
    throw error;
  }
};
