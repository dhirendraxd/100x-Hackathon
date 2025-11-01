import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
  userId: string;
  personalInfo: {
    fullName: string;
    fullNameNepali?: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup?: string;
    fatherName?: string;
    motherName?: string;
    grandfatherName?: string;
    spouseName?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone?: string;
  };
  addressInfo: {
    permanentAddress: {
      province: string;
      district: string;
      municipality: string;
      ward: string;
      tole?: string;
    };
    temporaryAddress?: {
      province: string;
      district: string;
      municipality: string;
      ward: string;
      tole?: string;
    };
  };
  documents: {
    citizenshipNumber?: string;
    citizenshipIssueDate?: string;
    citizenshipIssueDistrict?: string;
    passportNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
    voterIdNumber?: string;
  };
  uploadedFiles: {
    [documentType: string]: {
      fileName: string;
      fileUrl: string;
      uploadDate: string;
      fileSize: number;
      aiVerification?: {
        quality: string;
        confidence: number;
        verifiedDate: string;
      };
    };
  };
  lastUpdated: string;
  createdAt: string;
}

// Save or update user profile
export const saveUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const existingProfile = await getDoc(userProfileRef);

    if (existingProfile.exists()) {
      // Update existing profile
      await updateDoc(userProfileRef, {
        ...profileData,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Create new profile
      await setDoc(userProfileRef, {
        userId,
        ...profileData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const profileDoc = await getDoc(userProfileRef);

    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update personal information
export const updatePersonalInfo = async (
  userId: string,
  personalInfo: Partial<UserProfile['personalInfo']>
): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      personalInfo,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating personal info:', error);
    throw error;
  }
};

// Update contact information
export const updateContactInfo = async (
  userId: string,
  contactInfo: Partial<UserProfile['contactInfo']>
): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      contactInfo,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
};

// Update address information
export const updateAddressInfo = async (
  userId: string,
  addressInfo: Partial<UserProfile['addressInfo']>
): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      addressInfo,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating address info:', error);
    throw error;
  }
};

// Update document information
export const updateDocumentInfo = async (
  userId: string,
  documents: Partial<UserProfile['documents']>
): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      documents,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating document info:', error);
    throw error;
  }
};

// Save uploaded file metadata
export const saveUploadedFile = async (
  userId: string,
  documentType: string,
  fileMetadata: UserProfile['uploadedFiles'][string]
): Promise<void> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const profile = await getDoc(userProfileRef);
    
    const uploadedFiles = profile.exists() 
      ? (profile.data().uploadedFiles || {})
      : {};
    
    uploadedFiles[documentType] = fileMetadata;

    await updateDoc(userProfileRef, {
      uploadedFiles,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw error;
  }
};

// Get autofill data for forms
export interface AutofillData {
  fullName: string;
  fullNameNepali: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  fatherName: string;
  motherName: string;
  grandfatherName: string;
  spouseName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  permanentProvince: string;
  permanentDistrict: string;
  permanentMunicipality: string;
  permanentWard: string;
  permanentTole: string;
  temporaryProvince: string;
  temporaryDistrict: string;
  temporaryMunicipality: string;
  temporaryWard: string;
  temporaryTole: string;
  citizenshipNumber: string;
  citizenshipIssueDate: string;
  citizenshipIssueDistrict: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  voterIdNumber: string;
}

export const getAutofillData = async (userId: string): Promise<AutofillData | null> => {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return null;
    }

    // Return commonly used fields for autofill
    return {
      // Personal Info
      fullName: profile.personalInfo?.fullName || '',
      fullNameNepali: profile.personalInfo?.fullNameNepali || '',
      dateOfBirth: profile.personalInfo?.dateOfBirth || '',
      gender: profile.personalInfo?.gender || '',
      bloodGroup: profile.personalInfo?.bloodGroup || '',
      fatherName: profile.personalInfo?.fatherName || '',
      motherName: profile.personalInfo?.motherName || '',
      grandfatherName: profile.personalInfo?.grandfatherName || '',
      spouseName: profile.personalInfo?.spouseName || '',
      
      // Contact Info
      email: profile.contactInfo?.email || '',
      phone: profile.contactInfo?.phone || '',
      alternatePhone: profile.contactInfo?.alternatePhone || '',
      
      // Address Info
      permanentProvince: profile.addressInfo?.permanentAddress?.province || '',
      permanentDistrict: profile.addressInfo?.permanentAddress?.district || '',
      permanentMunicipality: profile.addressInfo?.permanentAddress?.municipality || '',
      permanentWard: profile.addressInfo?.permanentAddress?.ward || '',
      permanentTole: profile.addressInfo?.permanentAddress?.tole || '',
      
      temporaryProvince: profile.addressInfo?.temporaryAddress?.province || '',
      temporaryDistrict: profile.addressInfo?.temporaryAddress?.district || '',
      temporaryMunicipality: profile.addressInfo?.temporaryAddress?.municipality || '',
      temporaryWard: profile.addressInfo?.temporaryAddress?.ward || '',
      temporaryTole: profile.addressInfo?.temporaryAddress?.tole || '',
      
      // Document Info
      citizenshipNumber: profile.documents?.citizenshipNumber || '',
      citizenshipIssueDate: profile.documents?.citizenshipIssueDate || '',
      citizenshipIssueDistrict: profile.documents?.citizenshipIssueDistrict || '',
      passportNumber: profile.documents?.passportNumber || '',
      passportIssueDate: profile.documents?.passportIssueDate || '',
      passportExpiryDate: profile.documents?.passportExpiryDate || '',
      voterIdNumber: profile.documents?.voterIdNumber || '',
    };
  } catch (error) {
    console.error('Error getting autofill data:', error);
    throw error;
  }
};
