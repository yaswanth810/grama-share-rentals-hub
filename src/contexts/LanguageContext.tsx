
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'te';
  setLanguage: (lang: 'en' | 'te') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Header
    'header.title': '🌾 Grama Rental',
    'header.browse': 'Browse Equipment',
    'header.myListings': 'My Listings',
    'header.myBookings': 'My Bookings',
    'header.addListing': 'Add Listing',
    'header.profile': 'Profile',
    'header.signOut': 'Sign out',
    'header.menu': 'Menu',
    
    // Equipment List
    'equipmentList.title': '🌾 Equipment Rental Marketplace',
    'equipmentList.subtitle': 'Find and rent agricultural and construction equipment from your community',
    'equipmentList.equipmentAvailable': 'equipment available',
    'equipmentList.equipmentsAvailable': 'equipments available',
    'equipmentList.noEquipmentFound': 'No equipment found',
    'equipmentList.tryAdjustingFilters': 'Try adjusting your filters or check back later for new listings.',
    
    // Equipment Card
    'equipmentCard.viewDetails': 'View Details',
    'equipmentCard.contact': 'Contact',
    'equipmentCard.day': '/day',
    'equipmentCard.week': '/week',
    'equipmentCard.days': 'days',
    'equipmentCard.new': 'New',
    
    // Add Listing
    'addListing.title': 'Add New Equipment Listing',
    'addListing.editTitle': 'Edit Equipment Listing',
    'addListing.subtitle': 'List your equipment for rent and start earning from your unused items.',
    'addListing.editSubtitle': 'Update your equipment details and pricing.',
    'addListing.backToListings': 'Back to listings',
    'addListing.basicInfo': 'Basic Information',
    'addListing.equipmentTitle': 'Equipment Title',
    'addListing.description': 'Description',
    'addListing.category': 'Category',
    'addListing.condition': 'Condition',
    'addListing.pricing': 'Pricing',
    'addListing.dailyRate': 'Daily Rate (₹)',
    'addListing.securityDeposit': 'Security Deposit (₹)',
    'addListing.weeklyRate': 'Weekly Rate (₹)',
    'addListing.monthlyRate': 'Monthly Rate (₹)',
    'addListing.location': 'Location',
    'addListing.village': 'Village',
    'addListing.district': 'District',
    'addListing.state': 'State',
    'addListing.rentalTerms': 'Rental Terms',
    'addListing.minRentalDays': 'Minimum Rental Days',
    'addListing.maxRentalDays': 'Maximum Rental Days',
    'addListing.pickupOptions': 'Pickup/Delivery Options',
    'addListing.createListing': 'Create Listing',
    'addListing.updateListing': 'Update Listing',
    'addListing.creating': 'Creating Listing...',
    'addListing.updating': 'Updating Listing...',
    
    // Common
    'common.loading': 'Loading...',
    'common.excellent': 'Excellent',
    'common.good': 'Good',
    'common.fair': 'Fair',
    'common.selectCategory': 'Select category',
    'common.selectCondition': 'Select condition',
  },
  te: {
    // Header (Telugu)
    'header.title': '🌾 గ్రామ రెంటల్',
    'header.browse': 'పరికరాలు చూడండి',
    'header.myListings': 'నా జాబితాలు',
    'header.myBookings': 'నా బుకింగ్లు',
    'header.addListing': 'జాబితా జోడించండి',
    'header.profile': 'ప్రొఫైల్',
    'header.signOut': 'సైన్ అవుట్',
    'header.menu': 'మెనూ',
    
    // Equipment List (Telugu)
    'equipmentList.title': '🌾 పరికరాల అద్దె మార్కెట్‌ప్లేస్',
    'equipmentList.subtitle': 'మీ సమాజంలో వ్యవసాయ మరియు నిర్మాణ పరికరాలను కనుగొనండి మరియు అద్దెకు తీసుకోండి',
    'equipmentList.equipmentAvailable': 'పరికరం అందుబాటులో ఉంది',
    'equipmentList.equipmentsAvailable': 'పరికరాలు అందుబాటులో ఉన్నాయి',
    'equipmentList.noEquipmentFound': 'పరికరాలు కనుగొనబడలేదు',
    'equipmentList.tryAdjustingFilters': 'మీ ఫిల్టర్లను సర్దుబాటు చేయడానికి ప్రయత్నించండి లేదా కొత్త జాబితాల కోసం తర్వాత తనిఖీ చేయండి.',
    
    // Equipment Card (Telugu)
    'equipmentCard.viewDetails': 'వివరాలు చూడండి',
    'equipmentCard.contact': 'సంప్రదించండి',
    'equipmentCard.day': '/రోజు',
    'equipmentCard.week': '/వారం',
    'equipmentCard.days': 'రోజులు',
    'equipmentCard.new': 'కొత్తది',
    
    // Add Listing (Telugu)
    'addListing.title': 'కొత్త పరికర జాబితా జోడించండి',
    'addListing.editTitle': 'పరికర జాబితాను సవరించండి',
    'addListing.subtitle': 'మీ పరికరాలను అద్దెకు జాబితా చేయండి మరియు మీ ఉపయోగించని వస్తువుల నుండి సంపాదించడం ప్రారంభించండి.',
    'addListing.editSubtitle': 'మీ పరికర వివరాలు మరియు ధరలను నవీకరించండి.',
    'addListing.backToListings': 'జాబితాలకు తిరిగి వెళ్ళండి',
    'addListing.basicInfo': 'ప్రాథమిక సమాచారం',
    'addListing.equipmentTitle': 'పరికర శీర్షిక',
    'addListing.description': 'వివరణ',
    'addListing.category': 'వర్గం',
    'addListing.condition': 'పరిస్థితి',
    'addListing.pricing': 'ధర',
    'addListing.dailyRate': 'రోజువారీ రేటు (₹)',
    'addListing.securityDeposit': 'భద్రతా డిపాజిట్ (₹)',
    'addListing.weeklyRate': 'వారపు రేటు (₹)',
    'addListing.monthlyRate': 'నెలవారీ రేటు (₹)',
    'addListing.location': 'స్థానం',
    'addListing.village': 'గ్రామం',
    'addListing.district': 'జిల్లా',
    'addListing.state': 'రాష్ట్రం',
    'addListing.rentalTerms': 'అద్దె నిబంధనలు',
    'addListing.minRentalDays': 'కనీస అద్దె రోజులు',
    'addListing.maxRentalDays': 'గరిష్ట అద్దె రోజులు',
    'addListing.pickupOptions': 'పికప్/డెలివరీ ఎంపికలు',
    'addListing.createListing': 'జాబితా సృష్టించండి',
    'addListing.updateListing': 'జాబితాను నవీకరించండి',
    'addListing.creating': 'జాబితా సృష్టిస్తోంది...',
    'addListing.updating': 'జాబితాను నవీకరిస్తోంది...',
    
    // Common (Telugu)
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.excellent': 'అద్భుతమైన',
    'common.good': 'మంచి',
    'common.fair': 'సాధారణ',
    'common.selectCategory': 'వర్గాన్ని ఎంచుకోండి',
    'common.selectCondition': 'పరిస్థితిని ఎంచుకోండి',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'te';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'te') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
