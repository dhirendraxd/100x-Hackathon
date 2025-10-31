import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DocumentValidation } from './documentValidation';
import type { FormData } from './formService';

// Get user's validation history
export const getUserValidations = async (userId: string): Promise<DocumentValidation[]> => {
  try {
    const q = query(
      collection(db, 'validations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const validations: DocumentValidation[] = [];
    
    querySnapshot.forEach((doc) => {
      validations.push({
        id: doc.id,
        ...doc.data(),
      } as DocumentValidation);
    });
    
    return validations;
  } catch (error) {
    console.error('Error getting validations:', error);
    return [];
  }
};

// Get user's forms
export const getUserForms = async (userId: string): Promise<FormData[]> => {
  try {
    const q = query(
      collection(db, 'forms'),
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const forms: FormData[] = [];
    
    querySnapshot.forEach((doc) => {
      forms.push({
        id: doc.id,
        ...doc.data(),
      } as FormData);
    });
    
    return forms;
  } catch (error) {
    console.error('Error getting forms:', error);
    return [];
  }
};
