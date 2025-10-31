import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}

export interface DocumentValidation {
  id?: string;
  userId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  results: ValidationResult[];
  timestamp: Timestamp;
  status: 'pending' | 'completed' | 'failed';
}

// Convert file to base64 (helper function)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data:image/xxx;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Save validation results to Firestore (without storing the image)
export const saveValidationResult = async (
  validation: Omit<DocumentValidation, 'id'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'validations'), validation);
    return docRef.id;
  } catch (error) {
    console.error('Error saving validation:', error);
    throw new Error('Failed to save validation result');
  }
};

// Get validation history for a user
export const getUserValidations = async (userId: string): Promise<DocumentValidation[]> => {
  try {
    const q = query(
      collection(db, 'validations'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const validations: DocumentValidation[] = [];
    
    querySnapshot.forEach((doc) => {
      validations.push({
        id: doc.id,
        ...doc.data(),
      } as DocumentValidation);
    });
    
    return validations.sort((a, b) => 
      b.timestamp.toMillis() - a.timestamp.toMillis()
    );
  } catch (error) {
    console.error('Error getting validations:', error);
    throw new Error('Failed to fetch validation history');
  }
};

// Note: Document validation is handled directly via Firebase callable function in DocumentChecker component
// This service only provides helper functions for file conversion and saving results
