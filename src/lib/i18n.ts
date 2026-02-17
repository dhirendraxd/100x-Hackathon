import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal resources; extend as needed
const resources = {
  en: {
    common: {
      appName: 'Mitra Smart',
      nav: {
        home: 'Home',
        formLibrary: 'Form Library',
        myProgress: 'My Progress',
        joinNow: 'Join Now',
      },
      pages: {
        smart: {
          header: 'Government Forms',
          subheader: 'सरकारी फारमहरू',
          showingOfficesNear: 'Showing offices near',
          note: 'Note:',
          tempSave: 'Documents uploaded will only be saved temporarily.',
          savePermanently: 'to save your documents permanently.',
          requiredDocs: 'Required Documents:',
          uploadDocuments: 'Upload Documents',
          guestMode: 'Guest Mode',
          chooseFiles: 'Choose Files to Upload',
          uploadBelow: 'Upload required documents below:',
          chooseFile: 'Choose File (PDF/JPG/PNG)',
          uploadedFiles: 'Uploaded Files',
          analyzing: 'Analyzing...',
          aiAnalysis: 'AI Analysis:',
          verifyAll: 'Verify All Documents',
          savedToProfile: 'Saved to Profile ✓',
          saving: 'Saving...',
          saveToProfile: 'Save to Profile for Autofill',
          nextSteps: 'After you fill the form (Next steps):',
          nearestOffice: 'Nearest Office',
          openPortal: 'Open Official Portal',
          fillDemo: 'Fill a Demo Form',
        },
        library: {
          subtitle: 'Browse and explore digitized government forms',
          searchFilter: 'Search & Filter',
          searchPlaceholder: 'Search forms...',
          allDepartments: 'All Departments',
          allLevels: 'All Levels',
          showingCount: 'Showing {{count}} of {{total}} forms',
          noForms: 'No forms found',
          tryAdjust: 'Try adjusting your search or filters',
          viewForm: 'View Form',
        }
      },
      hero: {
        badge: 'Your Smart Form Assistant • Mitra Smart',
        titleLine1: 'Simplify Your',
        titleLine2: 'Nepal Government',
        titleLine3: 'Form Journey',
        desc: 'Digitize, understand, and fill Nepal government forms with ease. From passport applications to citizenship forms — all in one place.',
        getStarted: 'GET STARTED',
        browseForms: 'BROWSE FORMS',
        formLibrary: 'FORM LIBRARY',
        scrapeForm: 'SCRAPE FORM',
      },
      why: {
        title1: 'Why Choose',
        title2: 'Form Mitra Smart?',
        subtitle: 'Cutting-edge technology meets user-friendly design',
        card1Title: 'Nepal Government Forms',
        card1Desc: 'Access passport, citizenship, PAN card, and other official Nepal government forms.',
        card2Title: 'Simplified Forms',
        card2Desc: 'User-friendly forms with Nepali language support, helpful hints, and examples.',
        card3Title: 'Save Time',
        card3Desc: 'Complete government paperwork faster with step-by-step guidance.',
      },
      works: {
        title1: 'How It',
        title2: 'Works',
        subtitle: 'Three simple steps to complete your forms',
        step1Title: 'Browse Forms',
        step1Desc: 'Find the Nepal government form you need from our library.',
        step2Title: 'Fill Step-by-Step',
        step2Desc: 'Complete forms with helpful hints and examples in Nepali and English.',
        step3Title: 'Track Progress',
        step3Desc: 'Save drafts and continue anytime — all forms saved locally.',
      },
      cta: {
        ready: 'Ready to Get Started?',
        authedDesc: 'Access your form tools instantly.',
        guestDesc: 'Create an account to start managing government forms easily.',
        browse: 'Browse Forms',
        scrape: 'Scrape New Form',
        login: 'Login',
        signup: 'Sign Up',
      },
      language: {
        english: 'English',
        nepali: 'नेपाली',
        switchLabel: 'Language',
      }
    }
  },
  ne: {
    common: {
      appName: 'मित्र स्मार्ट',
      nav: {
        home: 'होम',
        formLibrary: 'फर्म लाइब्रेरी',
        myProgress: 'मेरो प्रगति',
        joinNow: 'जोडिनुहोस्',
      },
      pages: {
        smart: {
          header: 'सरकारी फारामहरू',
          subheader: 'सरकारी फारामहरू',
          showingOfficesNear: 'नजिकका कार्यालयहरू देखाउँदै',
          note: 'सूचना:',
          tempSave: 'अपलोड गरिएका कागजातहरू अस्थायी रूपमा मात्र बचत हुन्छन्।',
          savePermanently: 'तपाईंका कागजातहरू स्थायी रूपमा बचत गर्न।',
          requiredDocs: 'आवश्यक कागजातहरू:',
          uploadDocuments: 'कागजातहरू अपलोड गर्नुहोस्',
          guestMode: 'अतिथि मोड',
          chooseFiles: 'अपलोड गर्न फाइलहरू छान्नुहोस्',
          uploadBelow: 'तल आवश्यक कागजातहरू अपलोड गर्नुहोस्:',
          chooseFile: 'फाइल छान्नुहोस् (PDF/JPG/PNG)',
          uploadedFiles: 'अपलोड गरिएका फाइलहरू',
          analyzing: 'विश्लेषण हुँदै...',
          aiAnalysis: 'AI विश्लेषण:',
          verifyAll: 'सबै कागजात जाँच गर्नुहोस्',
          savedToProfile: 'प्रोफाइलमा सुरक्षित ✓',
          saving: 'सेभ हुँदै...',
          saveToProfile: 'अटोफिलका लागि प्रोफाइलमा सुरक्षित',
          nextSteps: 'फॉर्म भरेपछिका चरणहरू:',
          nearestOffice: 'नजिकको कार्यालय',
          openPortal: 'अफिसियल पोर्टल खोल्नुहोस्',
          fillDemo: 'डेमो फाराम भर्नुहोस्',
        },
        library: {
          subtitle: 'डिजिटाइज गरिएका सरकारी फारामहरू ब्राउज र अन्वेषण गर्नुहोस्',
          searchFilter: 'खोजी र फिल्टर',
          searchPlaceholder: 'फाराम खोज्नुहोस्...',
          allDepartments: 'सबै विभाग',
          allLevels: 'सबै स्तर',
          showingCount: 'कुल {{total}} मध्ये {{count}} फाराम देखाइँदै',
          noForms: 'कुनै फाराम भेटिएन',
          tryAdjust: 'तपाईंको खोजी वा फिल्टर समायोजन गर्नुहोस्',
          viewForm: 'फाराम हेर्नुहोस्',
        }
      },
      hero: {
        badge: 'तपाईंको स्मार्ट फर्म सहायक • मित्र स्मार्ट',
        titleLine1: 'सरल बनाउनुहोस्',
        titleLine2: 'नेपाल सरकार',
        titleLine3: 'फर्म यात्रा',
        desc: 'पासपोर्टदेखि नागरिकता फारामसम्म—सबै एकै ठाउँमा, सजिलै बुझ्नुहोस् र भर्नुहोस्।',
        getStarted: 'सुरु गर्नुहोस्',
        browseForms: 'फाराम हेर्नुहोस्',
        formLibrary: 'फर्म लाइब्रेरी',
        scrapeForm: 'फाराम स्क्र्याप',
      },
      why: {
        title1: 'किन रोज्ने',
        title2: 'फर्म मित्र स्मार्ट?',
        subtitle: 'उन्नत प्रविधि र सरल डिजाइन',
        card1Title: 'नेपाल सरकारका फाराम',
        card1Desc: 'पासपोर्ट, नागरिकता, प्यान कार्ड र अन्य सरकारी फारामहरू पहुँचयोग्य।',
        card2Title: 'सरल बनाइएका फाराम',
        card2Desc: 'नेपाली भाषिक सहयोग, उपयोगी संकेत र उदाहरणहरूसँग।',
        card3Title: 'समय बचत',
        card3Desc: 'चरणबद्ध मार्गदर्शनसाथ छिटो फाराम पूरा गर्नुहोस्।',
      },
      works: {
        title1: 'कसरी',
        title2: 'काम गर्छ',
        subtitle: 'तीन चरणमा फाराम पूरा',
        step1Title: 'फाराम हेर्नुहोस्',
        step1Desc: 'लाइब्रेरीबाट आवश्यक सरकारी फाराम खोज्नुहोस्।',
        step2Title: 'चरणबद्ध रूपमा भर्नुहोस्',
        step2Desc: 'नेपाली र अंग्रेजी सहयोगका साथ फाराम भर्नुहोस्।',
        step3Title: 'प्रगतिलाई ट्र्याक गर्नुहोस्',
        step3Desc: 'ड्राफ्ट बचत गर्नुस् र कहिले पनि जारी राख्नुस्।',
      },
      cta: {
        ready: 'तयार हुनुहुन्छ?',
        authedDesc: 'तुरुन्तै तपाईंका उपकरणहरू पहुँचयोग्य।',
        guestDesc: 'सरकारी फाराम सजिलै व्यवस्थापन गर्न खाता खोल्नुहोस्।',
        browse: 'फाराम हेर्नुहोस्',
        scrape: 'नयाँ फाराम स्क्र्याप',
        login: 'लग-इन',
        signup: 'साइन अप',
      },
      language: {
        english: 'English',
        nepali: 'नेपाली',
        switchLabel: 'भाषा',
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: (() => {
      if (typeof window === 'undefined') return 'en';
      const savedLang = localStorage.getItem('lang');
      return savedLang === 'ne' ? 'ne' : 'en';
    })(),
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
    },
  });

export default i18n;
