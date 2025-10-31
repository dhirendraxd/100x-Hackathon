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
  getMockFormsByDepartment 
} from '@/data/mockForms';

/**
 * MOCK DATA MODE - Using local mock data instead of Firebase
 * To use Firebase, replace the implementations below with actual Firebase calls
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
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockForms.filter(form => form.documentType === documentType && form.isActive);
  } catch (error) {
    console.error('Error getting forms by document type:', error);
    return [];
  }
};

/**
 * Create a new form draft for user
 */
export const createFormDraft = async (
  userId: string,
  formId: string,
  formVersion: string,
  initialData: Record<string, unknown> = {}
): Promise<string> => {
  try {
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 300));
    const draftId = `draft_${Date.now()}`;
    console.log('Form draft created:', draftId);
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
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Form draft updated:', draftId);
  } catch (error) {
    console.error('Error updating form draft:', error);
    throw new Error('Failed to update form draft');
  }
};

/**
 * Get user's form drafts
 */
export const getUserFormDrafts = async (userId: string): Promise<UserFormDraft[]> => {
  try {
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
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
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 300));
    return null;
  } catch (error) {
    console.error('Error getting form draft by ID:', error);
    return null;
  }
};

/**
 * Get form templates for a specific form
 */
export const getFormTemplates = async (formId?: string): Promise<FormTemplate[]> => {
  try {
    // Mock implementation - would use Firebase in real app
    await new Promise(resolve => setTimeout(resolve, 300));
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
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation with Firebase:
    // 1. Update draft status to 'submitted'
    // 2. Create form_submissions record for analytics
    // 3. Track completion metrics
    
    // For now, just log the submission
    console.log('Form draft submitted:', draftId);
    
    // Store analytics in localStorage for demo purposes
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    submissions.push({
      draftId,
      submittedAt: new Date().toISOString(),
      status: 'completed',
    });
    localStorage.setItem('form_submissions', JSON.stringify(submissions));
    console.log('Form submission recorded for analytics');
  } catch (error) {
    console.error('Error submitting form draft:', error);
    throw new Error('Failed to submit form');
  }
};

/**
 * Increment form template usage count
 */
export const incrementTemplateUsage = async (templateId: string): Promise<void> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real implementation with Firebase:
    // Update template usage count in Firestore
    
    // For now, track in localStorage for demo
    const usageCounts = JSON.parse(localStorage.getItem('template_usage') || '{}');
    usageCounts[templateId] = (usageCounts[templateId] || 0) + 1;
    localStorage.setItem('template_usage', JSON.stringify(usageCounts));
    console.log(`Template ${templateId} usage count incremented`);
  } catch (error) {
    console.error('Error incrementing template usage:', error);
  }
};
