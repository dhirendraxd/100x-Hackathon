/**
 * Smart Field Hint Service
 * Provides intelligent, contextual hints to guide users through form filling
 * Makes complex government forms simple and approachable
 */

import { generateFieldGuidance } from './huggingface';

export interface SmartHint {
  type: 'info' | 'warning' | 'example' | 'tip';
  text: string;
  icon?: string;
}

export interface FieldGuidance {
  label: string;
  placeholder: string;
  hint: string;
  example?: string;
  tips: SmartHint[];
  commonMistakes?: string[];
  helpfulLinks?: Array<{ text: string; url: string }>;
}

/**
 * Field-specific guidance rules based on common Nepali government forms
 */
const FIELD_GUIDANCE_RULES: Record<string, FieldGuidance> = {
  // Identification Fields
  fullName: {
    label: 'Full Name',
    placeholder: 'Enter your complete name as in citizenship',
    hint: 'Use your official name exactly as it appears on your citizenship certificate',
    example: 'Ram Bahadur Sharma',
    tips: [
      { type: 'tip', text: 'Include middle name if you have one' },
      { type: 'warning', text: 'Do not use nicknames or abbreviations' },
    ],
    commonMistakes: ['Using nicknames', 'Missing middle name', 'Wrong spelling'],
  },
  
  firstName: {
    label: 'First Name',
    placeholder: 'Your first name only',
    hint: 'Enter only your first name (given name)',
    example: 'Ram',
    tips: [
      { type: 'info', text: 'This is your given name, not family name' },
    ],
  },
  
  lastName: {
    label: 'Last Name / Surname',
    placeholder: 'Your family name',
    hint: 'Enter your family name or surname',
    example: 'Sharma',
    tips: [
      { type: 'info', text: 'This is your family name that you share with relatives' },
    ],
  },
  
  // Date Fields
  dateOfBirth: {
    label: 'Date of Birth',
    placeholder: 'DD/MM/YYYY or use date picker',
    hint: 'Enter your date of birth as shown in your citizenship',
    example: '15/08/1995',
    tips: [
      { type: 'tip', text: 'Use the date picker for accurate entry' },
      { type: 'info', text: 'AD (Christian calendar) date is usually required' },
      { type: 'warning', text: 'Double-check the year - common mistake area' },
    ],
    commonMistakes: ['Wrong format', 'BS instead of AD date', 'Transposed day/month'],
  },
  
  dobBS: {
    label: 'Date of Birth (B.S.)',
    placeholder: 'YYYY/MM/DD in Bikram Sambat',
    hint: 'Enter your date of birth in Nepali calendar (B.S.)',
    example: '2052/04/30',
    tips: [
      { type: 'info', text: 'B.S. = Bikram Sambat (Nepali calendar)' },
      { type: 'tip', text: 'Use online converter if you only know AD date' },
    ],
  },
  
  dobAD: {
    label: 'Date of Birth (A.D.)',
    placeholder: 'DD/MM/YYYY',
    hint: 'Enter your date of birth in English calendar',
    example: '15/08/1995',
    tips: [
      { type: 'info', text: 'A.D. = Anno Domini (English calendar)' },
    ],
  },
  
  // Contact Fields
  email: {
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    hint: 'Enter a valid email you check regularly',
    example: 'ramesh.sharma@gmail.com',
    tips: [
      { type: 'tip', text: 'Use an email you check often for updates' },
      { type: 'warning', text: 'Make sure there are no typos - you\'ll need this for communication' },
    ],
    commonMistakes: ['Typos in email', 'Using someone else\'s email', 'Old unused email'],
  },
  
  phone: {
    label: 'Mobile Number',
    placeholder: '98XXXXXXXX',
    hint: 'Enter your 10-digit mobile number',
    example: '9801234567',
    tips: [
      { type: 'tip', text: 'Use your active mobile number for SMS updates' },
      { type: 'info', text: 'Format: Start with 98/97/96 (10 digits total)' },
    ],
    commonMistakes: ['Including +977 or country code', 'Using landline number', 'Wrong digit count'],
  },
  
  // Address Fields
  address: {
    label: 'Address',
    placeholder: 'House/Tole, Municipality, District',
    hint: 'Enter your complete residential address',
    example: 'Thamel Marg, Kathmandu Metropolitan-16',
    tips: [
      { type: 'tip', text: 'Include ward number if applicable' },
      { type: 'info', text: 'Be specific - this helps with document delivery' },
    ],
  },
  
  permState: {
    label: 'Permanent Address - Province',
    placeholder: 'Select your province',
    hint: 'Choose the province of your permanent address',
    example: 'Bagmati Province',
    tips: [
      { type: 'info', text: 'Nepal has 7 provinces numbered 1-7 (or by name)' },
    ],
  },
  
  permDistrict: {
    label: 'Permanent Address - District',
    placeholder: 'Enter your district',
    hint: 'Enter the district of your permanent address',
    example: 'Kathmandu',
    tips: [
      { type: 'info', text: 'This should match your citizenship certificate' },
    ],
  },
  
  permMunicipality: {
    label: 'Municipality / Rural Municipality',
    placeholder: 'Name of your municipality',
    hint: 'Enter the full name of your municipality or rural municipality',
    example: 'Kathmandu Metropolitan City',
    tips: [
      { type: 'info', text: 'Check your citizenship for the exact name' },
      { type: 'tip', text: 'Include "Metropolitan City", "Sub-Metropolitan City", or "Municipality"' },
    ],
  },
  
  permWard: {
    label: 'Ward Number',
    placeholder: 'Ward number',
    hint: 'Enter your ward number (usually 1-32)',
    example: '16',
    tips: [
      { type: 'info', text: 'Ward numbers changed after local government restructuring in 2017' },
    ],
  },
  
  // Citizenship Fields
  citizenshipNo: {
    label: 'Citizenship Certificate Number',
    placeholder: 'As shown on your certificate',
    hint: 'Enter the number exactly as printed on your citizenship certificate',
    example: '12-01-65-12345',
    tips: [
      { type: 'warning', text: 'Double-check this - incorrect number causes delays' },
      { type: 'tip', text: 'Include dashes (-) if they appear on your certificate' },
    ],
    commonMistakes: ['Missing dashes', 'Wrong digits', 'Old certificate number'],
  },
  
  citizenshipIssueDate: {
    label: 'Citizenship Issue Date',
    placeholder: 'DD/MM/YYYY',
    hint: 'Date when your citizenship certificate was issued',
    example: '15/06/2015',
    tips: [
      { type: 'info', text: 'Find this date on your citizenship certificate' },
    ],
  },
  
  citizenshipIssueDistrict: {
    label: 'Citizenship Issue District',
    placeholder: 'District name',
    hint: 'The district where your citizenship was issued',
    example: 'Kathmandu',
    tips: [
      { type: 'info', text: 'This is shown on your citizenship certificate' },
    ],
  },
  
  // Family Fields
  fatherName: {
    label: "Father's Full Name",
    placeholder: 'Father\'s complete name',
    hint: 'Enter your father\'s full name as in documents',
    example: 'Hari Prasad Sharma',
    tips: [
      { type: 'tip', text: 'Use the name from your citizenship certificate' },
      { type: 'info', text: 'Include first, middle (if any), and last name' },
    ],
  },
  
  motherName: {
    label: "Mother's Full Name",
    placeholder: 'Mother\'s complete name',
    hint: 'Enter your mother\'s full name as in documents',
    example: 'Sita Devi Sharma',
    tips: [
      { type: 'tip', text: 'Use the name from your citizenship certificate' },
      { type: 'info', text: 'Include first, middle (if any), and last name' },
    ],
  },
  
  // Gender
  gender: {
    label: 'Gender',
    placeholder: 'Select your gender',
    hint: 'Choose your gender as per official documents',
    tips: [
      { type: 'info', text: 'Options: Male, Female, Other' },
    ],
  },
  
  maritalStatus: {
    label: 'Marital Status',
    placeholder: 'Select status',
    hint: 'Choose your current marital status',
    tips: [
      { type: 'info', text: 'Options: Single/Unmarried, Married, Widowed, Divorced, Separated' },
    ],
  },
  
  // Document-specific
  nin: {
    label: 'National Identity Number (NIN)',
    placeholder: 'Leave blank if first application',
    hint: 'Only fill if you already have a NIN from previous application',
    tips: [
      { type: 'info', text: 'First-time applicants leave this blank' },
      { type: 'tip', text: 'You\'ll receive your NIN after approval' },
    ],
  },
  
  religion: {
    label: 'Religion',
    placeholder: 'Your religion',
    hint: 'Enter your religion (optional in most forms)',
    example: 'Hindu, Buddhist, Muslim, Christian, etc.',
    tips: [
      { type: 'info', text: 'This field is optional in many government forms' },
    ],
  },
  
  profession: {
    label: 'Profession / Occupation',
    placeholder: 'Your occupation',
    hint: 'Enter your current profession or occupation',
    example: 'Teacher, Engineer, Business, Student, etc.',
    tips: [
      { type: 'tip', text: 'Be specific about your primary occupation' },
    ],
  },
  
  education: {
    label: 'Educational Qualification',
    placeholder: 'Highest education level',
    hint: 'Enter your highest completed education level',
    example: 'SLC, +2, Bachelor\'s, Master\'s, etc.',
    tips: [
      { type: 'info', text: 'Use common abbreviations: SLC, +2, Bachelor, Master, PhD' },
    ],
  },
};

/**
 * Get smart guidance for a field based on its ID or label
 */
export const getFieldGuidance = (fieldId: string, fieldLabel?: string): FieldGuidance => {
  // Try exact match first
  if (FIELD_GUIDANCE_RULES[fieldId]) {
    return FIELD_GUIDANCE_RULES[fieldId];
  }
  
  // Try partial match on field ID or label
  const searchTerm = (fieldId + ' ' + (fieldLabel || '')).toLowerCase();
  
  for (const [key, guidance] of Object.entries(FIELD_GUIDANCE_RULES)) {
    if (searchTerm.includes(key.toLowerCase()) || 
        searchTerm.includes(guidance.label.toLowerCase())) {
      return guidance;
    }
  }
  
  // Default fallback
  return {
    label: fieldLabel || 'Field',
    placeholder: `Enter ${fieldLabel || 'value'}`,
    hint: 'Please fill in this field accurately',
    tips: [
      { type: 'tip', text: 'Double-check your entry before submitting' },
    ],
  };
};

/**
 * Get contextual hint based on field value (progressive disclosure)
 */
export const getContextualHint = (
  fieldId: string, 
  fieldValue: string, 
  fieldType: string
): SmartHint | null => {
  // Email validation hint
  if (fieldType === 'email' && fieldValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fieldValue)) {
      return {
        type: 'warning',
        text: '⚠️ Email format appears incorrect. Example: name@example.com',
      };
    }
    return {
      type: 'info',
      text: '✓ Email format looks good!',
    };
  }
  
  // Phone number validation
  if ((fieldId.includes('phone') || fieldId.includes('mobile')) && fieldValue) {
    const phoneRegex = /^9[678]\d{8}$/;
    if (!phoneRegex.test(fieldValue.replace(/[-\s]/g, ''))) {
      return {
        type: 'warning',
        text: '⚠️ Nepali mobile numbers start with 98/97/96 and are 10 digits',
      };
    }
    return {
      type: 'info',
      text: '✓ Mobile number format is correct',
    };
  }
  
  // Citizenship number format
  if (fieldId.includes('citizenship') && fieldId.includes('No') && fieldValue) {
    if (fieldValue.length < 8) {
      return {
        type: 'warning',
        text: '⚠️ Citizenship number seems too short. Check your certificate',
      };
    }
  }
  
  // Name validation
  if ((fieldId.includes('name') || fieldId.includes('Name')) && fieldValue) {
    if (fieldValue.length < 2) {
      return {
        type: 'warning',
        text: '⚠️ Name seems too short. Enter full name',
      };
    }
    if (/\d/.test(fieldValue)) {
      return {
        type: 'warning',
        text: '⚠️ Names should not contain numbers',
      };
    }
  }
  
  return null;
};

/**
 * Enhanced AI-powered field guidance (if Hugging Face is configured)
 */
export const getAIFieldGuidance = async (
  fieldLabel: string,
  fieldType: string,
  formContext: string
): Promise<Partial<FieldGuidance>> => {
  try {
    const aiGuidance = await generateFieldGuidance(fieldLabel, fieldType, formContext);
    
    return {
      placeholder: aiGuidance.placeholder,
      hint: aiGuidance.hint,
      example: aiGuidance.example,
    };
  } catch (error) {
    console.warn('AI guidance generation failed, using fallback:', error);
    return {};
  }
};

/**
 * Get progress-based encouragement messages
 */
export const getProgressMessage = (progress: number): string => {
  if (progress < 25) {
    return '🎯 Great start! Take your time and fill each field carefully.';
  } else if (progress < 50) {
    return '💪 You\'re doing well! Keep going.';
  } else if (progress < 75) {
    return '🌟 More than halfway there! You\'re making good progress.';
  } else if (progress < 100) {
    return '🎉 Almost done! Just a few more fields to complete.';
  } else {
    return '✅ Excellent! Review your entries and submit when ready.';
  }
};

/**
 * Field-specific validation messages
 */
export const getValidationMessage = (fieldId: string, value: string): string | null => {
  if (!value || value.trim() === '') {
    return null;
  }
  
  const guidance = getFieldGuidance(fieldId);
  const contextualHint = getContextualHint(fieldId, value, 'text');
  
  if (contextualHint && contextualHint.type === 'warning') {
    return contextualHint.text;
  }
  
  return null;
};
