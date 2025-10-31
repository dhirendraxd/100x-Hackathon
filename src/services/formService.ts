import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FormData {
  id?: string;
  userId: string;
  formType: string;
  data: Record<string, unknown>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  timestamp: Timestamp;
  lastUpdated: Timestamp;
}

// Save form as draft
export const saveFormDraft = async (
  userId: string,
  formType: string,
  formData: Record<string, unknown>
): Promise<string> => {
  try {
    const form: Omit<FormData, 'id'> = {
      userId,
      formType,
      data: formData,
      status: 'draft',
      timestamp: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'forms'), form);
    return docRef.id;
  } catch (error) {
    console.error('Error saving form draft:', error);
    throw new Error('Failed to save form');
  }
};

// Update existing form
export const updateForm = async (
  formId: string,
  formData: Record<string, unknown>,
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'
): Promise<void> => {
  try {
    const formRef = doc(db, 'forms', formId);
    const updateData: {
      data: Record<string, unknown>;
      lastUpdated: Timestamp;
      status?: 'draft' | 'submitted' | 'approved' | 'rejected';
    } = {
      data: formData,
      lastUpdated: Timestamp.now(),
    };
    
    if (status) {
      updateData.status = status;
    }
    
    await updateDoc(formRef, updateData);
  } catch (error) {
    console.error('Error updating form:', error);
    throw new Error('Failed to update form');
  }
};

// Submit form
export const submitForm = async (
  formId: string,
  formData: Record<string, unknown>
): Promise<void> => {
  try {
    const formRef = doc(db, 'forms', formId);
    await updateDoc(formRef, {
      data: formData,
      status: 'submitted',
      lastUpdated: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    throw new Error('Failed to submit form');
  }
};

// Get user's forms
export const getUserForms = async (userId: string): Promise<FormData[]> => {
  try {
    const q = query(
      collection(db, 'forms'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const forms: FormData[] = [];
    
    querySnapshot.forEach((doc) => {
      forms.push({
        id: doc.id,
        ...doc.data(),
      } as FormData);
    });
    
    return forms.sort((a, b) => 
      b.lastUpdated.toMillis() - a.lastUpdated.toMillis()
    );
  } catch (error) {
    console.error('Error getting forms:', error);
    throw new Error('Failed to fetch forms');
  }
};

// Get form by ID
export const getFormById = async (formId: string): Promise<FormData | null> => {
  try {
    const formRef = doc(db, 'forms', formId);
    const formSnap = await getDocs(query(collection(db, 'forms')));
    
    const formData = formSnap.docs.find(d => d.id === formId);
    
    if (formData) {
      return {
        id: formData.id,
        ...formData.data(),
      } as FormData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting form:', error);
    throw new Error('Failed to fetch form');
  }
};
