export interface GovOffice {
  district: string;
  city: string;
  address: string;
  province: string;
  contact?: string;
  timings?: string;
}

export interface GovForm {
  id: string;
  name: string;
  nameNepali: string;
  description: string;
  department: string;
  estimatedTime: string;
  keywords: string[];
  formUrl: string;
  offices: GovOffice[];
  requiredDocuments: string[];
  fees?: string;
}

export const nepalGovForms: GovForm[] = [
  {
    id: 'passport-application',
    name: 'Passport Application',
    nameNepali: 'राहदानी आवेदन',
    description: 'Apply for a new Nepali passport (Machine Readable Passport - MRP)',
    department: 'Department of Passport',
    estimatedTime: '15-30 days',
    keywords: ['passport', 'rahadani', 'travel', 'abroad', 'mrp', 'visa'],
    formUrl: 'https://nepalpassport.gov.np/',
    fees: 'NPR 5,000 (Normal) / NPR 10,000 (Fast Track)',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Recent Passport Size Photo (2 copies)',
      'Birth Certificate',
      'Previous Passport (if renewal)',
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Department of Passport, Tripureshwor, Kathmandu',
        contact: '01-4115300',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'Passport Office, Prithvi Chowk, Pokhara',
        contact: '061-531678',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'Passport Office, Main Road, Biratnagar',
        contact: '021-523456',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Lumbini Province',
        district: 'Rupandehi',
        city: 'Butwal',
        address: 'Passport Office, Traffic Chowk, Butwal',
        contact: '071-540123',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Sudurpashchim Province',
        district: 'Kailali',
        city: 'Dhangadhi',
        address: 'Passport Office, Attariya Road, Dhangadhi',
        contact: '091-523456',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      }
    ]
  },
  {
    id: 'citizenship-certificate',
    name: 'Citizenship Certificate',
    nameNepali: 'नागरिकता प्रमाणपत्र',
    description: 'Apply for Nepali citizenship certificate',
    department: 'District Administration Office',
    estimatedTime: '7-15 days',
    keywords: ['citizenship', 'nagarikta', 'certificate', 'id', 'identity'],
    formUrl: 'https://www.nepal.gov.np/',
    fees: 'NPR 100',
    requiredDocuments: [
      'Birth Certificate',
      'Parents Citizenship (Original + Copy)',
      'Recommendation Letter from Ward Office',
      'Recent Passport Size Photo (2 copies)',
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'District Administration Office, Kathmandu, Babarmahal',
        contact: '01-4200000',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'District Administration Office, Pokhara',
        contact: '061-520111',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'District Administration Office, Biratnagar',
        contact: '021-520111',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      }
    ]
  },
  {
    id: 'driving-license',
    name: 'Driving License',
    nameNepali: 'सवारी चालक अनुमतिपत्र',
    description: 'Apply for new driving license or renew existing license',
    department: 'Department of Transport Management',
    estimatedTime: '30-45 days',
    keywords: ['driving', 'license', 'sawari', 'chalak', 'vehicle', 'motorcycle', 'car'],
    formUrl: 'https://dotm.gov.np/',
    fees: 'NPR 1,000 (Trial) + NPR 2,000 (License)',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Recent Passport Size Photo (4 copies)',
      'Blood Group Certificate',
      'Medical Certificate',
      'Trial Card',
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Department of Transport Management, Minbhawan, Kathmandu',
        contact: '01-4162906',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'Transport Management Office, Pokhara',
        contact: '061-520222',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'Transport Management Office, Biratnagar',
        contact: '021-520222',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      },
      {
        province: 'Lumbini Province',
        district: 'Rupandehi',
        city: 'Butwal',
        address: 'Transport Management Office, Butwal',
        contact: '071-540222',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      }
    ]
  },
  {
    id: 'pan-card',
    name: 'PAN Card',
    nameNepali: 'स्थायी लेखा नम्बर',
    description: 'Apply for Permanent Account Number (PAN) for tax purposes',
    department: 'Inland Revenue Department',
    estimatedTime: '7-15 days',
    keywords: ['pan', 'tax', 'vat', 'permanent account', 'revenue', 'kar'],
    formUrl: 'https://ird.gov.np/',
    fees: 'NPR 1,000',
    requiredDocuments: [
      'Citizenship Certificate (Copy)',
      'Recent Passport Size Photo (2 copies)',
      'Business Registration (if business)',
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Inland Revenue Office, Lazimpat, Kathmandu',
        contact: '01-4410798',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'Inland Revenue Office, Pokhara',
        contact: '061-520333',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'Inland Revenue Office, Biratnagar',
        contact: '021-520333',
        timings: 'Sunday-Friday: 10:00 AM - 4:00 PM'
      }
    ]
  },
  {
    id: 'birth-certificate',
    name: 'Birth Certificate',
    nameNepali: 'जन्म दर्ता प्रमाणपत्र',
    description: 'Register birth and obtain birth certificate',
    department: 'Local Ward Office',
    estimatedTime: '1-7 days',
    keywords: ['birth', 'janma', 'certificate', 'registration', 'baby', 'child'],
    formUrl: 'https://www.nepal.gov.np/',
    fees: 'NPR 50 (within 35 days) / NPR 500 (after 35 days)',
    requiredDocuments: [
      'Hospital Discharge Certificate',
      'Parents Citizenship (Copy)',
      'Parents Marriage Certificate',
      'Recent Photo of Baby',
    ],
    offices: [
      {
        province: 'All Provinces',
        district: 'All Districts',
        city: 'Nearest Ward Office',
        address: 'Visit your local Ward Office (Wada Karyalaya)',
        contact: 'Contact local ward office',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      }
    ]
  },
  {
    id: 'marriage-certificate',
    name: 'Marriage Registration',
    nameNepali: 'विवाह दर्ता',
    description: 'Register marriage and obtain marriage certificate',
    department: 'Ward Office',
    estimatedTime: '1-3 days',
    keywords: ['marriage', 'bibaha', 'wedding', 'registration', 'certificate'],
    formUrl: 'https://www.nepal.gov.np/',
    fees: 'NPR 100',
    requiredDocuments: [
      'Both parties Citizenship Certificate',
      'Recent Passport Size Photo (both parties)',
      'Two witnesses with citizenship',
      'Divorce decree (if previously married)',
    ],
    offices: [
      {
        province: 'All Provinces',
        district: 'All Districts',
        city: 'Nearest Ward Office',
        address: 'Visit your local Ward Office (Wada Karyalaya)',
        contact: 'Contact local ward office',
        timings: 'Sunday-Friday: 10:00 AM - 5:00 PM'
      }
    ]
  },
  {
    id: 'police-clearance',
    name: 'Police Clearance Certificate',
    nameNepali: 'प्रहरी निकासा प्रमाणपत्र',
    description: 'Obtain police clearance certificate for foreign employment',
    department: 'Nepal Police',
    estimatedTime: '7-15 days',
    keywords: ['police', 'clearance', 'character', 'certificate', 'foreign', 'employment'],
    formUrl: 'https://www.nepalpolice.gov.np/',
    fees: 'NPR 500',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Recent Passport Size Photo (2 copies)',
      'Passport Copy',
      'Visa/Job Offer Letter',
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Police Headquarters, Naxal, Kathmandu',
        contact: '01-4412780',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'District Police Office, Pokhara',
        contact: '061-520444',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'District Police Office, Biratnagar',
        contact: '021-520444',
        timings: 'Sunday-Friday: 10:00 AM - 3:00 PM'
      }
    ]
  }
];
