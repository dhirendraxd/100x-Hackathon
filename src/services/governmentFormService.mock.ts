import type { 
  GovernmentForm, 
  UserFormDraft, 
  FormTemplate,
  FormSearchIndex 
} from '@/types/governmentForms';
import { 
  mockForms, 
  getMockFormById, 
  getActiveMockForms, 
  getMockFormsByDepartment,
  getMockFormsByDocumentType
} from '@/data/mockForms';

/**
 * MOCK DATA MODE - Using local mock data instead of Firebase
 * To use Firebase, import from governmentFormService.ts instead
 */

/**
 * Get all active government forms
 */
export const getActiveGovernmentForms = async (): Promise<GovernmentForm[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getActiveMockForms();
  } catch (error) {
    console.error('Error getting active forms:', error);
    return [];
  }
};

/**
 * Get government form by ID
 */
export const getGovernmentFormById = async (formId: string): Promise<GovernmentForm | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return getMockFormById(formId) || null;
  } catch (error) {
    console.error('Error getting form by ID:', error);
    return null;
  }
};

/**
 * Search government forms by department
 */
export const getFormsByDepartment = async (department: string): Promise<GovernmentForm[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return getMockFormsByDepartment(department);
  } catch (error) {
    console.error('Error getting forms by department:', error);
    return [];
  }
};

/**
 * Search government forms by document type
 */
export const getFormsByDocumentType = async (documentType: string): Promise<GovernmentForm[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return getMockFormsByDocumentType(documentType);
  } catch (error) {
    console.error('Error getting forms by document type:', error);
    return [];
  }
};

/**
 * Create a new form draft (stored in localStorage for mock mode)
 */
export const createFormDraft = async (
  userId: string,
  formId: string,
  formVersion: string,
  initialData: Record<string, unknown> = {}
): Promise<string> => {
  try {
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const draft: UserFormDraft = {
      id: draftId,
      userId,
      formId,
      formVersion,
      data: initialData,
      completedFields: [],
      completionPercentage: 0,
      status: 'draft',
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };
    
    // Store in localStorage
    localStorage.setItem(`form_draft_${draftId}`, JSON.stringify(draft));
    
    return draftId;
  } catch (error) {
    console.error('Error creating form draft:', error);
    throw new Error('Failed to create form draft');
  }
};

/**
 * Update form draft with auto-save
 */
export const updateFormDraft = async (
  draftId: string,
  data: Record<string, unknown>,
  completedFields: string[],
  currentSection?: string
): Promise<void> => {
  try {
    const draftKey = `form_draft_${draftId}`;
    const existingDraft = localStorage.getItem(draftKey);
    
    if (!existingDraft) {
      throw new Error('Draft not found');
    }
    
    const draft: UserFormDraft = JSON.parse(existingDraft);
    const completionPercentage = calculateCompletionPercentage(completedFields, data);
    
    draft.data = data;
    draft.completedFields = completedFields;
    draft.completionPercentage = completionPercentage;
    draft.currentSection = currentSection;
    draft.lastModifiedAt = new Date();
    
    localStorage.setItem(draftKey, JSON.stringify(draft));
  } catch (error) {
    console.error('Error updating form draft:', error);
    throw new Error('Failed to update form draft');
  }
};

/**
 * Get user's form drafts (from localStorage for mock mode)
 */
export const getUserFormDrafts = async (userId: string): Promise<UserFormDraft[]> => {
  try {
    const drafts: UserFormDraft[] = [];
    
    // Search localStorage for draft keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('form_draft_')) {
        const draftStr = localStorage.getItem(key);
        if (draftStr) {
          const draft: UserFormDraft = JSON.parse(draftStr);
          if (draft.userId === userId) {
            drafts.push(draft);
          }
        }
      }
    }
    
    // Sort by last modified
    drafts.sort((a, b) => {
      const aDate = a.lastModifiedAt instanceof Date 
        ? a.lastModifiedAt 
        : (typeof a.lastModifiedAt === 'object' && 'toDate' in a.lastModifiedAt 
          ? a.lastModifiedAt.toDate() 
          : new Date(a.lastModifiedAt));
      const bDate = b.lastModifiedAt instanceof Date 
        ? b.lastModifiedAt 
        : (typeof b.lastModifiedAt === 'object' && 'toDate' in b.lastModifiedAt 
          ? b.lastModifiedAt.toDate() 
          : new Date(b.lastModifiedAt));
      return bDate.getTime() - aDate.getTime();
    });
    
    return drafts.slice(0, 20);
  } catch (error) {
    console.error('Error getting user form drafts:', error);
    return [];
  }
};

/**
 * Get form draft by ID
 */
export const getFormDraftById = async (draftId: string): Promise<UserFormDraft | null> => {
  try {
    const draftKey = `form_draft_${draftId}`;
    const draftStr = localStorage.getItem(draftKey);
    
    if (draftStr) {
      return JSON.parse(draftStr);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting form draft by ID:', error);
    return null;
  }
};

/**
 * Get form templates for a specific form (mock data)
 */
export const getFormTemplates = async (formId?: string): Promise<FormTemplate[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Return empty array for mock mode
    // In production, this would query Firebase
    return [];
  } catch (error) {
    console.error('Error getting form templates:', error);
    return [];
  }
};

/**
 * Calculate form completion percentage
 */
const calculateCompletionPercentage = (
  completedFields: string[],
  data: Record<string, unknown>
): number => {
  const totalFields = Object.keys(data).length;
  if (totalFields === 0) return 0;
  
  const filledFields = completedFields.filter(fieldId => {
    const value = data[fieldId];
    return value !== null && value !== undefined && value !== '';
  }).length;
  
  return Math.round((filledFields / totalFields) * 100);
};

/**
 * Submit form draft (mark as completed)
 */
export const submitFormDraft = async (draftId: string): Promise<void> => {
  try {
    const draftKey = `form_draft_${draftId}`;
    const draftStr = localStorage.getItem(draftKey);
    
    if (!draftStr) {
      throw new Error('Draft not found');
    }
    
    const draft: UserFormDraft = JSON.parse(draftStr);
    draft.status = 'submitted';
    draft.submittedAt = new Date();
    draft.lastModifiedAt = new Date();
    
    localStorage.setItem(draftKey, JSON.stringify(draft));
  } catch (error) {
    console.error('Error submitting form draft:', error);
    throw new Error('Failed to submit form');
  }
};

/**
 * Increment form template usage count (no-op in mock mode)
 */
export const incrementTemplateUsage = async (templateId: string): Promise<void> => {
  // No-op in mock mode
  console.log('Mock: Incrementing template usage', templateId);
};
