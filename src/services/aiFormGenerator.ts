/**
 * Real AI-powered Form Guidance Generator
 * Uses Hugging Face LLM for intelligent field assistance
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GovernmentForm, OriginalFormField } from '@/types/governmentForms';
import { generateFieldGuidance, isHuggingFaceConfigured } from './huggingface';

export interface GuidedFormField extends OriginalFormField {
  aiPlaceholder?: string;
  aiHint?: string;
  aiExample?: string;
  showHint?: boolean;
}

export interface GuidedForm {
  formId: string;
  fields: GuidedFormField[];
  generatedAt: string;
}

/**
 * Generate AI-powered guidance for form fields
 * Strict non-hallucinatory approach - derives from field metadata only
 */
export const generateGuidedFormAssist = async (form: GovernmentForm): Promise<GuidedForm> => {
  console.log('Generating AI guidance for form:', form.id);
  
  const guidedFields: GuidedFormField[] = [];
  
  for (const field of form.originalFields) {
    let aiPlaceholder: string | undefined;
    let aiHint: string | undefined;
    let aiExample: string | undefined;
    
    // Try AI guidance if configured
    if (isHuggingFaceConfigured()) {
      try {
        const formContext = `${form.name} - ${form.documentType}`;
        const guidance = await generateFieldGuidance(field.label, field.type, formContext);
        aiPlaceholder = guidance.placeholder;
        aiHint = guidance.hint;
        aiExample = guidance.example;
        console.log(`Generated AI guidance for field: ${field.label}`);
      } catch (error) {
        console.warn(`Failed to generate AI guidance for ${field.label}, using fallback:`, error);
      }
    }
    
    // Fallback to metadata-based guidance
    if (!aiPlaceholder) {
      aiPlaceholder = generateFallbackPlaceholder(field);
    }
    if (!aiHint) {
      aiHint = generateFallbackHint(field);
    }
    
    guidedFields.push({
      ...field,
      aiPlaceholder,
      aiHint,
      aiExample,
      showHint: false, // Opt-in by default
    });
  }
  
  const guidedForm: GuidedForm = {
    formId: form.id!,
    fields: guidedFields,
    generatedAt: new Date().toISOString(),
  };
  
  // Save to storage
  await saveGuidedAssist(guidedForm);
  
  console.log('AI guidance generation completed');
  return guidedForm;
};

/**
 * Generate fallback placeholder from field metadata
 */
const generateFallbackPlaceholder = (field: OriginalFormField): string => {
  if (field.placeholder) return field.placeholder;
  
  switch (field.type) {
    case 'text':
      return `Enter ${field.label}`;
    case 'email':
      return 'example@email.com';
    case 'phone':
      return '10-digit mobile number';
    case 'date':
      return 'DD/MM/YYYY';
    case 'number':
      return `Enter ${field.label}`;
    case 'address':
      return 'Street, City, State, Pincode';
    case 'select':
    case 'radio':
      return `Select ${field.label}`;
    case 'checkbox':
      return 'Check if applicable';
    default:
      return `Enter ${field.label}`;
  }
};

/**
 * Generate fallback hint from field metadata
 */
const generateFallbackHint = (field: OriginalFormField): string => {
  // Use existing help text if available
  if (field.helpText) return field.helpText;
  
  // Generate from field type and label
  const baseHint = field.required 
    ? `This field is required. Please provide your ${field.label.toLowerCase()}.`
    : `Optional: Provide your ${field.label.toLowerCase()} if available.`;
  
  return baseHint;
};

/**
 * Save guided assistance to localStorage and Firestore
 */
export const saveGuidedAssist = async (guidedForm: GuidedForm): Promise<void> => {
  try {
    // Save to localStorage
    localStorage.setItem(`ai_guided_form_${guidedForm.formId}`, JSON.stringify(guidedForm));
    
    // Save to Firestore (non-blocking)
    if (db) {
      const guidanceRef = doc(db, 'ai_guidance', guidedForm.formId);
      await setDoc(guidanceRef, {
        ...guidedForm,
        createdAt: new Date().toISOString(),
      }).catch(err => {
        console.warn('Failed to save guidance to Firestore:', err);
      });
    }
    
    console.log('Guided assistance saved');
  } catch (error) {
    console.error('Error saving guided assistance:', error);
  }
};

/**
 * Load guided assistance from localStorage or Firestore
 */
export const loadGuidedAssist = async (formId: string): Promise<GuidedForm | null> => {
  try {
    // Try localStorage first
    const localData = localStorage.getItem(`ai_guided_form_${formId}`);
    if (localData) {
      return JSON.parse(localData);
    }
    
    // Fallback to Firestore
    if (db) {
      const guidanceRef = doc(db, 'ai_guidance', formId);
      const guidanceDoc = await getDoc(guidanceRef);
      if (guidanceDoc.exists()) {
        const data = guidanceDoc.data() as GuidedForm;
        // Cache to localStorage
        localStorage.setItem(`ai_guided_form_${formId}`, JSON.stringify(data));
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading guided assistance:', error);
    return null;
  }
};

/**
 * Check if AI guidance is available for a form
 */
export const hasGuidedAssist = (formId: string): boolean => {
  return localStorage.getItem(`ai_guided_form_${formId}`) !== null;
};
