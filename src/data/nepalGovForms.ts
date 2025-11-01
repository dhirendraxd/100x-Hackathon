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
  nextSteps?: string[];
}

export const nepalGovForms: GovForm[] = [
  {
    id: 'national-id',
    name: 'National ID (NID)',
    nameNepali: 'राष्ट्रिय परिचय पत्र',
    description: 'Apply for your National Identity Card (NID) in Nepal.',
    department: 'Department of National ID and Civil Registration (DoNIDCR)',
    estimatedTime: '7-21 days',
    keywords: ['nid', 'national id', 'identity', 'parichaya', 'parichaya patra', 'citizen id'],
    formUrl: 'https://donidcr.gov.np/',
    fees: 'Usually free (may vary by service center)',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Birth Certificate (if available)',
      'Recent Passport Size Photo (as required)',
    ],
    nextSteps: [
      'Visit your Ward Office or designated NID center for biometric enrollment (photo, fingerprints, signature).',
      'Carry original documents for on-site verification by officials.',
      'Submit the form and receive an acknowledgment or tracking number.',
      'Track your application status online via the DoNIDCR portal.',
      'Collect your NID card when notified or download the digital copy if available.'
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Department of National ID & Civil Registration, Singha Durbar',
        contact: '01-4211802',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'District Administration Office, Pokhara',
        contact: '061-520111',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      }
    ]
  },
  {
    id: 'passport-application',
    name: 'Passport Application',
    nameNepali: 'राहदानी आवेदन',
    description: 'Apply for a new Nepali passport or renew an existing one.',
    department: 'Department of Passport',
    estimatedTime: '15–30 days',
    keywords: ['passport', 'rahadani', 'travel', 'mrp', 'visa', 'renew'],
    formUrl: 'https://nepalpassport.gov.np/',
    fees: 'NPR 5,000 (Normal) / NPR 10,000 (Fast Track)',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Passport Size Photo (as per spec)',
      'Previous Passport (for renewal)',
    ],
    nextSteps: [
      'Book an appointment slot from the Department of Passport portal (if required).',
      'Pay the applicable fee (Normal or Fast Track) and keep the receipt.',
      'Visit the passport office/center for biometrics and photograph.',
      'Application will be verified; keep your acknowledgment for tracking.',
      'Collect your passport when notified or opt for delivery if available.'
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Department of Passport, Tripureshwor',
        contact: '01-4115300',
        timings: 'Sunday–Friday: 10:00 AM – 3:00 PM'
      },
      {
        province: 'Gandaki Province',
        district: 'Kaski',
        city: 'Pokhara',
        address: 'Passport Service Center, Prithvi Chowk',
        contact: '061-531678',
        timings: 'Sunday–Friday: 10:00 AM – 3:00 PM'
      }
    ]
  },
  {
    id: 'citizenship-certificate',
    name: 'Citizenship Certificate',
    nameNepali: 'नागरिकता प्रमाणपत्र',
    description: 'Apply for your Nepali citizenship certificate.',
    department: 'District Administration Office (DAO)',
    estimatedTime: '7–15 days',
    keywords: ['citizenship', 'nagarikta', 'certificate', 'identity'],
    formUrl: 'https://www.nepal.gov.np/',
    fees: 'Approx. NPR 100',
    requiredDocuments: [
      'Birth Certificate',
      'Parents’ Citizenship (Original + Copy)',
      'Ward Office Recommendation',
      'Recent Photos',
    ],
    nextSteps: [
      'Obtain a recommendation letter from your local Ward Office.',
      'Submit documents to the District Administration Office (DAO).',
      'Attend any verification/interview if called (police verification may apply).',
      'Wait for the CDO decision and issuance process.',
      'Collect your Citizenship Certificate from the DAO.'
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'District Administration Office, Babarmahal',
        contact: '01-4262106',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      },
      {
        province: 'Province 1',
        district: 'Morang',
        city: 'Biratnagar',
        address: 'District Administration Office, Biratnagar',
        contact: '021-520111',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      }
    ]
  },
  {
    id: 'voter-card',
    name: 'Voter Card (Voter ID)',
    nameNepali: 'मतदाता परिचयपत्र',
    description: 'Register for your voter ID card to participate in elections.',
    department: 'Election Commission Nepal',
    estimatedTime: '3–10 days',
    keywords: ['voter', 'matdata', 'voter id', 'election', 'card'],
    formUrl: 'https://election.gov.np/',
    fees: 'Free',
    requiredDocuments: [
      'Citizenship Certificate (Original + Copy)',
      'Recent Passport Size Photo',
    ],
    nextSteps: [
      'Visit the District Election Office or designated enrollment camp.',
      'Provide biometrics (photo, fingerprints) and verify your details.',
      'Confirm your polling station assignment.',
      'Collect your printed Voter ID when notified.'
    ],
    offices: [
      {
        province: 'Bagmati Province',
        district: 'Kathmandu',
        city: 'Kathmandu',
        address: 'Election Commission Nepal, Kantipath',
        contact: '01-4228663',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      },
      {
        province: 'Lumbini Province',
        district: 'Rupandehi',
        city: 'Butwal',
        address: 'District Election Office, Butwal',
        contact: '071-540222',
        timings: 'Sunday–Friday: 10:00 AM – 4:00 PM'
      }
    ]
  }
];
