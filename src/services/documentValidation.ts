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

// ============================================
// ENHANCED CLIENT-SIDE DOCUMENT VALIDATION
// ============================================

export interface EnhancedValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    size: number;
    type: string;
    brightness?: number;
    resolution?: { width: number; height: number };
    aspectRatio?: number;
  };
}

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Minimum brightness for images (0-255 scale)
const MIN_BRIGHTNESS = 50;
const MAX_BRIGHTNESS = 240;

// Minimum resolution for images
const MIN_WIDTH = 600;
const MIN_HEIGHT = 600;

/**
 * Analyze image brightness
 */
const analyzeImageBrightness = (imageData: ImageData): number => {
  const data = imageData.data;
  let totalBrightness = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Calculate perceived brightness using luminance formula
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
  }
  
  return totalBrightness / (data.length / 4);
};

/**
 * Load and analyze image file
 */
const analyzeImage = (file: File): Promise<Partial<EnhancedValidationResult['metadata']>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        resolve({});
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const brightness = analyzeImageBrightness(imageData);
      
      resolve({
        brightness,
        resolution: { width: img.width, height: img.height },
        aspectRatio: img.width / img.height,
      });
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate document file with enhanced checks
 */
export const validateDocumentEnhanced = async (file: File): Promise<EnhancedValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: EnhancedValidationResult['metadata'] = {
    size: file.size,
    type: file.type,
  };

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB`);
  }

  if (file.size < 10 * 1024) {
    warnings.push('File size is very small. Make sure the document is clear and readable.');
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not supported. Please upload PDF, JPG, PNG, or DOC files.`);
  }

  // For image files, perform additional checks
  if (file.type.startsWith('image/')) {
    try {
      const imageMetadata = await analyzeImage(file);
      Object.assign(metadata, imageMetadata);

      // Check brightness
      if (imageMetadata.brightness !== undefined) {
        if (imageMetadata.brightness < MIN_BRIGHTNESS) {
          errors.push('Image is too dark. Please use a brighter, well-lit photo.');
        } else if (imageMetadata.brightness > MAX_BRIGHTNESS) {
          errors.push('Image is overexposed. Please use a photo with better lighting.');
        } else if (imageMetadata.brightness < 80) {
          warnings.push('Image brightness is low. Consider using a brighter photo for better clarity.');
        } else if (imageMetadata.brightness > 200) {
          warnings.push('Image is quite bright. Ensure text/details are clearly visible.');
        }
      }

      // Check resolution
      if (imageMetadata.resolution) {
        if (
          imageMetadata.resolution.width < MIN_WIDTH ||
          imageMetadata.resolution.height < MIN_HEIGHT
        ) {
          errors.push(
            `Image resolution (${imageMetadata.resolution.width}x${imageMetadata.resolution.height}) is too low. Minimum required: ${MIN_WIDTH}x${MIN_HEIGHT}px`
          );
        }

        if (
          imageMetadata.resolution.width < 800 ||
          imageMetadata.resolution.height < 800
        ) {
          warnings.push('Image resolution is low. Higher resolution will ensure better document quality.');
        }
      }

      // Check aspect ratio
      if (imageMetadata.aspectRatio) {
        if (imageMetadata.aspectRatio < 0.5 || imageMetadata.aspectRatio > 2) {
          warnings.push('Unusual image aspect ratio. Make sure the document is properly framed.');
        }
      }
    } catch (error) {
      errors.push('Failed to analyze image. Please try another file.');
    }
  }

  // PDF specific checks
  if (file.type === 'application/pdf') {
    if (file.size > 5 * 1024 * 1024) {
      warnings.push('PDF file is large. Consider compressing it if upload is slow.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
