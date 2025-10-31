/**
 * Firestore Helper Utilities
 * Provides type-safe wrappers and utilities for Firestore operations
 */

import { Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Type-safe timestamp conversion utilities
 */
export const timestampHelpers = {
  /**
   * Convert any timestamp-like value to a JavaScript Date
   */
  toDate(value: unknown): Date {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object') {
      const maybe = value as { toDate?: () => Date; seconds?: number };
      if (typeof maybe.toDate === 'function') {
        try {
          return maybe.toDate();
        } catch (e) {
          console.warn('Failed to convert Timestamp to Date:', e);
        }
      }
      // Handle plain {seconds, nanoseconds} object from Firestore
      if (typeof maybe.seconds === 'number') {
        return new Date(maybe.seconds * 1000);
      }
    }
    // Try parsing as string/number
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Fallback to current date
    console.warn('Could not parse timestamp, using current date:', value);
    return new Date();
  },

  /**
   * Convert Date to Firestore Timestamp for storage
   */
  toTimestamp(date: Date | string | number): Timestamp {
    if (date instanceof Date) {
      return Timestamp.fromDate(date);
    }
    return Timestamp.fromDate(new Date(date));
  },

  /**
   * Get server timestamp for creation/update times
   */
  serverTimestamp() {
    return serverTimestamp();
  },

  /**
   * Create a Firestore Timestamp from now
   */
  now(): Timestamp {
    return Timestamp.now();
  },
};

/**
 * Check if Firestore is available and connected
 */
export const isFirestoreAvailable = (): boolean => {
  try {
    // Check if db is properly initialized
    return db !== null && db !== undefined;
  } catch {
    return false;
  }
};

/**
 * Safe Firestore operation wrapper with error handling
 */
export async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  fallback?: T,
  operationName?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  if (!isFirestoreAvailable()) {
    return {
      success: false,
      data: fallback,
      error: 'Firestore not available',
    };
  }

  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Firestore operation failed${operationName ? ` (${operationName})` : ''}:`, errorMessage);
    
    return {
      success: false,
      data: fallback,
      error: errorMessage,
    };
  }
}

/**
 * Validate form data before Firestore write
 */
export const validateFormData = (data: Record<string, unknown>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Form name is required');
  }

  if (!data.department || typeof data.department !== 'string') {
    errors.push('Department is required');
  }

  if (!data.documentType || typeof data.documentType !== 'string') {
    errors.push('Document type is required');
  }

  // Validate arrays
  if (data.originalFields && !Array.isArray(data.originalFields)) {
    errors.push('originalFields must be an array');
  }

  if (data.sections && !Array.isArray(data.sections)) {
    errors.push('sections must be an array');
  }

  if (data.requiredDocuments && !Array.isArray(data.requiredDocuments)) {
    errors.push('requiredDocuments must be an array');
  }

  if (data.annotations && !Array.isArray(data.annotations)) {
    errors.push('annotations must be an array');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('tags must be an array');
  }

  if (data.keywords && !Array.isArray(data.keywords)) {
    errors.push('keywords must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize data for Firestore storage
 * Removes undefined values and converts dates to Timestamps
 */
export const sanitizeForFirestore = (data: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined values (Firestore doesn't support them)
    if (value === undefined) continue;

    // Convert Date objects to Timestamps
    if (value instanceof Date) {
      sanitized[key] = timestampHelpers.toTimestamp(value);
    }
    // Recursively sanitize nested objects
    else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeForFirestore(value as Record<string, unknown>);
    }
    // Recursively sanitize arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        item !== null && typeof item === 'object' && !Array.isArray(item)
          ? sanitizeForFirestore(item as Record<string, unknown>)
          : item instanceof Date
          ? timestampHelpers.toTimestamp(item)
          : item
      );
    }
    // Keep primitive values as-is
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Log database operations for debugging
 */
export const dbLogger = {
  write: (collection: string, id: string, operation: 'create' | 'update' | 'delete') => {
    if (import.meta.env.DEV) {
      console.log(`[DB ${operation.toUpperCase()}] ${collection}/${id}`);
    }
  },
  read: (collection: string, id?: string) => {
    if (import.meta.env.DEV) {
      console.log(`[DB READ] ${collection}${id ? `/${id}` : ''}`);
    }
  },
  error: (operation: string, error: unknown) => {
    console.error(`[DB ERROR] ${operation}:`, error);
  },
};
