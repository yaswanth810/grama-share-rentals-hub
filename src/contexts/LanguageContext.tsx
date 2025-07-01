
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ta' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header translations
    'header.title': 'Equipment Rental',
    'header.browse': 'Browse',
    'header.dashboard': 'Dashboard',
    'header.myListings': 'My Listings',
    'header.bookingRequests': 'Booking Requests',
    'header.myBookings': 'My Bookings',
    'header.messages': 'Messages',
    'header.addListing': 'Add Listing',
    'header.profile': 'Profile',
    'header.signOut': 'Sign Out',
    'header.signIn': 'Sign In',
    
    // Equipment list translations
    'equipmentList.title': 'Find the Perfect Equipment for Your Project',
    'equipmentList.subtitle': 'Browse thousands of tools and equipment available for rent in your area',
    'equipmentList.searchPlaceholder': 'Search equipment...',
    'equipmentList.allCategories': 'All Categories',
    'equipmentList.allConditions': 'All Conditions',
    'equipmentList.excellent': 'Excellent',
    'equipmentList.good': 'Good',
    'equipmentList.fair': 'Fair',
    'equipmentList.sortBy': 'Sort by',
    'equipmentList.newest': 'Newest',
    'equipmentList.oldest': 'Oldest',
    'equipmentList.priceLowHigh': 'Price: Low to High',
    'equipmentList.priceHighLow': 'Price: High to Low',
    'equipmentList.noResults': 'No equipment found',
    'equipmentList.noResultsDesc': 'Try adjusting your search or filters',
    'equipmentList.equipmentAvailable': 'equipment available',
    'equipmentList.equipmentsAvailable': 'equipments available',
    'equipmentList.noEquipmentFound': 'No Equipment Found',
    'equipmentList.tryAdjustingFilters': 'Try adjusting your filters or search terms to find what you need',
    
    // Equipment card translations
    'equipmentCard.new': 'New',
    'equipmentCard.day': '/day',
    'equipmentCard.week': '/week',
    'equipmentCard.days': 'days',
    'equipmentCard.viewDetails': 'View Details',
    'equipmentCard.contact': 'Contact',
    
    // Add Listing translations (missing keys)
    'addListing.backToListings': 'Back to Listings',
    'addListing.pricing': 'Pricing',
    'addListing.rentalTerms': 'Rental Terms',
    'addListing.minRentalDays': 'Minimum Rental Days',
    'addListing.maxRentalDays': 'Maximum Rental Days',
    'addListing.pickupOptions': 'Pickup/Delivery Options',
    'addListing.securityDeposit': 'Security Deposit',
    
    // Listing details translations
    'listingDetails.day': '/day',
    'listingDetails.week': '/week',
    'listingDetails.month': '/month',
    'listingDetails.securityDeposit': 'Security Deposit',
    'listingDetails.rentalPeriod': 'Rental Period',
    'listingDetails.days': 'days',
    'listingDetails.pickupOptions': 'Pickup/Delivery Options',
    'listingDetails.pickup': 'Pickup',
    'listingDetails.delivery': 'Delivery',
    'listingDetails.ownerInfo': 'Owner Information',
    'listingDetails.rating': 'Rating',
    'listingDetails.totalRatings': 'total ratings',
    'listingDetails.newUser': 'New User',
    'listingDetails.bookNow': 'Book Now',
    'listingDetails.contactOwner': 'Contact Owner',
    'listingDetails.description': 'Description',
    'listingDetails.condition': 'Condition',
    'listingDetails.location': 'Location',
    
    // My listings translations
    'myListings.title': 'My Listings',
    'myListings.addNew': 'Add New Listing',
    'myListings.noListings': 'No Listings Yet',
    'myListings.noListingsDesc': 'Start by adding your first equipment listing',
    'myListings.available': 'Available',
    'myListings.rented': 'Rented',
    'myListings.maintenance': 'Maintenance',
    'myListings.edit': 'Edit',
    'myListings.delete': 'Delete',
    'myListings.views': 'views',
  },
  hi: {
    // Header translations
    'header.title': 'उपकरण किराया',
    'header.browse': 'ब्राउज़ करें',
    'header.dashboard': 'डैशबोर्ड',
    'header.myListings': 'मेरी लिस्टिंग',
    'header.bookingRequests': 'बुकिंग अनुरोध',
    'header.myBookings': 'मेरी बुकिंग',
    'header.messages': 'संदेश',
    'header.addListing': 'लिस्टिंग जोड़ें',
    'header.profile': 'प्रोफ़ाइल',
    'header.signOut': 'साइन आउट',
    'header.signIn': 'साइन इन',
    
    'equipmentList.title': 'अपने प्रोजेक्ट के लिए सही उपकरण खोजें',
    'equipmentList.subtitle': 'अपने क्षेत्र में किराए के लिए उपलब्ध हजारों उपकरण ब्राउज़ करें',
    'equipmentList.searchPlaceholder': 'उपकरण खोजें...',
    'equipmentList.allCategories': 'सभी श्रेणियां',
    'equipmentList.allConditions': 'सभी स्थितियां',
    'equipmentList.excellent': 'उत्कृष्ट',
    'equipmentList.good': 'अच्छा',
    'equipmentList.fair': 'ठीक',
    'equipmentList.sortBy': 'क्रमबद्ध करें',
    'equipmentList.newest': 'नवीनतम',
    'equipmentList.oldest': 'पुराना',
    'equipmentList.priceLowHigh': 'कीमत: कम से अधिक',
    'equipmentList.priceHighLow': 'कीमत: अधिक से कम',
    'equipmentList.noResults': 'कोई उपकरण नहीं मिला',
    'equipmentList.noResultsDesc': 'अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें',
    'equipmentList.equipmentAvailable': 'उपकरण उपलब्ध',
    'equipmentList.equipmentsAvailable': 'उपकरण उपलब्ध',
    'equipmentList.noEquipmentFound': 'कोई उपकरण नहीं मिला',
    'equipmentList.tryAdjustingFilters': 'आपको जो चाहिए उसे खोजने के लिए अपने फ़िल्टर या खोज शब्दों को समायोजित करने का प्रयास करें',
    
    // Equipment card translations
    'equipmentCard.new': 'नया',
    'equipmentCard.day': '/दिन',
    'equipmentCard.week': '/सप्ताह',
    'equipmentCard.days': 'दिन',
    'equipmentCard.viewDetails': 'विवरण देखें',
    'equipmentCard.contact': 'संपर्क करें',
    
    // Add Listing translations (missing keys)
    'addListing.backToListings': 'लिस्टिंग पर वापस जाएं',
    'addListing.pricing': 'मूल्य निर्धारण',
    'addListing.rentalTerms': 'किराया नियम',
    'addListing.minRentalDays': 'न्यूनतम किराया दिन',
    'addListing.maxRentalDays': 'अधिकतम किराया दिन',
    'addListing.pickupOptions': 'पिकअप/डिलीवरी विकल्प',
    'addListing.securityDeposit': 'सिक्यूरिटी डिपॉज़िट',
    
    'listingDetails.day': '/दिन',
    'listingDetails.week': '/सप्ताह',
    'listingDetails.month': '/महीना',
    'listingDetails.securityDeposit': 'सिक्यूरिटी डिपॉज़िट',
    'listingDetails.rentalPeriod': 'किराये की अवधि',
    'listingDetails.days': 'दिन',
    'listingDetails.pickupOptions': 'पिकअप/डिलीवरी विकल्प',
    'listingDetails.pickup': 'पिकअप',
    'listingDetails.delivery': 'डिलीवरी',
    'listingDetails.ownerInfo': 'मालिक की जानकारी',
    'listingDetails.rating': 'रेटिंग',
    'listingDetails.totalRatings': 'कुल रेटिंग',
    'listingDetails.newUser': 'नया उपयोगकर्ता',
    'listingDetails.bookNow': 'अभी बुक करें',
    'listingDetails.contactOwner': 'मालिक से संपर्क करें',
    'listingDetails.description': 'विवरण',
    'listingDetails.condition': 'स्थिति',
    'listingDetails.location': 'स्थान',
    
    'myListings.title': 'मेरी लिस्टिंग',
    'myListings.addNew': 'नई लिस्टिंग जोड़ें',
    'myListings.noListings': 'अभी तक कोई लिस्टिंग नहीं',
    'myListings.noListingsDesc': 'अपनी पहली उपकरण लिस्टिंग जोड़कर शुरू करें',
    'myListings.available': 'उपलब्ध',
    'myListings.rented': 'किराए पर',
    'myListings.maintenance': 'रखरखाव',
    'myListings.edit': 'संपादित करें',
    'myListings.delete': 'हटाएं',
    'myListings.views': 'दृश्य',
  },
  ta: {
    // Header translations
    'header.title': 'உபகரண வாடகை',
    'header.browse': 'உலாவு',
    'header.dashboard': 'டாஷ்போர்டு',
    'header.myListings': 'என் பட்டியல்கள்',
    'header.bookingRequests': 'முன்பதிவு கோரிக்கைகள்',
    'header.myBookings': 'என் முன்பதிவுகள்',
    'header.messages': 'செய்திகள்',
    'header.addListing': 'பட்டியல் சேர்க்கவும்',
    'header.profile': 'சுயவிவரம்',
    'header.signOut': 'வெளியேறு',
    'header.signIn': 'உள்நுழையவும்',
    
    'equipmentList.title': 'உங்கள் திட்டத்திற்கான சரியான உபகரணங்களைக் கண்டறியுங்கள்',
    'equipmentList.subtitle': 'உங்கள் பகுதியில் வாடகைக்கு கிடைக்கும் ஆயிரக்கணக்கான கருவிகள் மற்றும் உபகரணங்களை உலாவுங்கள்',
    'equipmentList.searchPlaceholder': 'உபகரணங்களைத் தேடுங்கள்...',
    'equipmentList.allCategories': 'அனைத்து வகைகள்',
    'equipmentList.allConditions': 'அனைத்து நிலைமைகள்',
    'equipmentList.excellent': 'சிறந்த',
    'equipmentList.good': 'நல்ல',
    'equipmentList.fair': 'சரியான',
    'equipmentList.sortBy': 'வரிசைப்படுத்து',
    'equipmentList.newest': 'புதியது',
    'equipmentList.oldest': 'பழையது',
    'equipmentList.priceLowHigh': 'விலை: குறைந்த இருந்து அதிக',
    'equipmentList.priceHighLow': 'விலை: அதிக இருந்து குறைந்த',
    'equipmentList.noResults': 'உபகரணம் கிடைக்கவில்லை',
    'equipmentList.noResultsDesc': 'உங்கள் தேடல் அல்லது வடிகட்டிகளை சரிசெய்ய முயற்சிக்கவும்',
    'equipmentList.equipmentAvailable': 'உபகரணம் கிடைக்கும்',
    'equipmentList.equipmentsAvailable': 'உபகரணங்கள் கிடைக்கும்',
    'equipmentList.noEquipmentFound': 'உபகரணம் கிடைக்கவில்லை',
    'equipmentList.tryAdjustingFilters': 'உங்களுக்குத் தேவையானதைக் கண்டறிய உங்கள் வடிகட்டிகள் அல்லது தேடல் சொற்களை சரிசெய்ய முயற்சிக்கவும்',
    
    // Equipment card translations
    'equipmentCard.new': 'புதிய',
    'equipmentCard.day': '/நாள்',
    'equipmentCard.week': '/வாரம்',
    'equipmentCard.days': 'நாட்கள்',
    'equipmentCard.viewDetails': 'விவரங்களைக் காண்க',
    'equipmentCard.contact': 'தொடர்பு',
    
    // Add Listing translations (missing keys)
    'addListing.backToListings': 'பட்டியல்களுக்குத் திரும்பு',
    'addListing.pricing': 'விலை நிர்ணயம்',
    'addListing.rentalTerms': 'வாடகை நிபந்தனைகள்',
    'addListing.minRentalDays': 'குறைந்தபட்ச வாடகை நாட்கள்',
    'addListing.maxRentalDays': 'அதிகபட்ச வாடகை நாட்கள்',
    'addListing.pickupOptions': 'எடுக்கும்/விநியோக விகல்பங்கள்',
    'addListing.securityDeposit': 'பாதுகாப்பு வைப்பு',
    
    'listingDetails.day': '/நாள்',
    'listingDetails.week': '/வாரம்',
    'listingDetails.month': '/மாதம்',
    'listingDetails.securityDeposit': 'பாதுகாப்பு வைப்பு',
    'listingDetails.rentalPeriod': 'வாடகை காலம்',
    'listingDetails.days': 'நாட்கள்',
    'listingDetails.pickupOptions': 'எடுக்கும்/விநியோக விகல்பங்கள்',
    'listingDetails.pickup': 'எடுக்கும்',
    'listingDetails.delivery': 'விநியோகம்',
    'listingDetails.ownerInfo': 'உரிமையாளர் தகவல்',
    'listingDetails.rating': 'மதிப்பீடு',
    'listingDetails.totalRatings': 'மொத்த மதிப்பீடுகள்',
    'listingDetails.newUser': 'புதிய பயனர்',
    'listingDetails.bookNow': 'இப்போது முன்பதிவு செய்யுங்கள்',
    'listingDetails.contactOwner': 'உரிமையாளரைத் தொடர்பு கொள்ளுங்கள்',
    'listingDetails.description': 'விளக்கம்',
    'listingDetails.condition': 'நிலைமை',
    'listingDetails.location': 'இடம்',
    
    'myListings.title': 'என் பட்டியல்கள்',
    'myListings.addNew': 'புதிய பட்டியல் சேர்க்கவும்',
    'myListings.noListings': 'இன்னும் பட்டியல்கள் இல்லை',
    'myListings.noListingsDesc': 'உங்கள் முதல் உபகரண பட்டியலைச் சேர்ப்பதன் மூலம் தொடங்குங்கள்',
    'myListings.available': 'கிடைக்கும்',
    'myListings.rented': 'வாடகைக்கு',
    'myListings.maintenance': 'பராமரிப்பு',
    'myListings.edit': 'திருத்து',
    'myListings.delete': 'நீக்கு',
    'myListings.views': 'காட்சிகள்',
  },
  te: {
    // Header translations
    'header.title': 'పరికరాల అద్దె',
    'header.browse': 'బ్రౌజ్ చేయండి',
    'header.dashboard': 'డాష్‌బోర్డ్',
    'header.myListings': 'నా జాబితాలు',
    'header.bookingRequests': 'బుకింగ్ అభ్యర్థనలు',
    'header.myBookings': 'నా బుకింగ్‌లు',
    'header.messages': 'సందేశాలు',
    'header.addListing': 'జాబితా జోడించండి',
    'header.profile': 'ప్రొఫైల్',
    'header.signOut': 'సైన్ అవుట్',
    'header.signIn': 'సైన్ ఇన్',
    
    'equipmentList.title': 'మీ ప్రాజెక్ట్ కోసం సరైన పరికరాలను కనుగొనండి',
    'equipmentList.subtitle': 'మీ ప్రాంతంలో అద్దెకు అందుబాటులో ఉన్న వేలాది పరికరాలను బ్రౌజ్ చేయండి',
    'equipmentList.searchPlaceholder': 'పరికరాలను వెతకండి...',
    'equipmentList.allCategories': 'అన్ని వర్గాలు',
    'equipmentList.allConditions': 'అన్ని పరిస్థితులు',
    'equipmentList.excellent': 'అద్భుతమైన',
    'equipmentList.good': 'మంచి',
    'equipmentList.fair': 'ఫెయిర్',
    'equipmentList.sortBy': 'ఇలా క్రమబద్ధీకరించండి',
    'equipmentList.newest': 'కొత్తది',
    'equipmentList.oldest': 'పాతది',
    'equipmentList.priceLowHigh': 'ధర: తక్కువ నుండి ఎక్కువ వరకు',
    'equipmentList.priceHighLow': 'ధర: ఎక్కువ నుండి తక్కువ వరకు',
    'equipmentList.noResults': 'పరికరం కనుగొనబడలేదు',
    'equipmentList.noResultsDesc': 'మీ శోధన లేదా ఫిల్టర్‌లను సర్దుబాటు చేయడానికి ప్రయత్నించండి',
    'equipmentList.equipmentAvailable': 'పరికరం అందుబాటులో ఉంది',
    'equipmentList.equipmentsAvailable': 'పరికరాలు అందుబాటులో ఉన్నాయి',
    'equipmentList.noEquipmentFound': 'పరికరాలు కనుగొనబడలేదు',
    'equipmentList.tryAdjustingFilters': 'మీకు అవసరమైనది కనుగొనడానికి మీ ఫిల్టర్‌లు లేదా శోధన పదాలను సర్దుబాటు చేయడానికి ప్రయత్నించండి',
    
    // Equipment card translations
    'equipmentCard.new': 'కొత్త',
    'equipmentCard.day': '/రోజు',
    'equipmentCard.week': '/వారం',
    'equipmentCard.days': 'రోజులు',
    'equipmentCard.viewDetails': 'వివరాలు చూడండి',
    'equipmentCard.contact': 'సంప్రదించండి',
    
    // Add Listing translations (missing keys)
    'addListing.backToListings': 'జాబితాలకు తిరిగి వెళ్లండి',
    'addListing.pricing': 'ధర నిర్ణయం',
    'addListing.rentalTerms': 'అద్దె నిబంధనలు',
    'addListing.minRentalDays': 'కనిష్ట అద్దె రోజులు',
    'addListing.maxRentalDays': 'గరిష్ట అద్దె రోజులు',
    'addListing.pickupOptions': 'పికప్/డెలివరీ ఎంపికలు',
    'addListing.securityDeposit': 'సెక్యూరిటీ డిపాజిట్',
    
    'listingDetails.day': '/రోజు',
    'listingDetails.week': '/వారం',
    'listingDetails.month': '/నెల',
    'listingDetails.securityDeposit': 'సెక్యూరిటీ డిపాజిట్',
    'listingDetails.rentalPeriod': 'అద్దె కాలం',
    'listingDetails.days': 'రోజులు',
    'listingDetails.pickupOptions': 'పికప్/డెలివరీ ఎంపికలు',
    'listingDetails.pickup': 'పికప్',
    'listingDetails.delivery': 'డెలివరీ',
    'listingDetails.ownerInfo': 'యజమాని సమాచారం',
    'listingDetails.rating': 'రేటింగ్',
    'listingDetails.totalRatings': 'మొత్తం రేటింగ్‌లు',
    'listingDetails.newUser': 'కొత్త వినియోగదారు',
    'listingDetails.bookNow': 'ఇప్పుడే బుక్ చేయండి',
    'listingDetails.contactOwner': 'యజమానిని సంప్రదించండి',
    'listingDetails.description': 'వివరణ',
    'listingDetails.condition': 'పరిస్థితి',
    'listingDetails.location': 'స్థానం',
    
    'myListings.title': 'నా జాబితాలు',
    'myListings.addNew': 'కొత్త జాబితా జోడించండి',
    'myListings.noListings': 'ఇంకా జాబితాలు లేవు',
    'myListings.noListingsDesc': 'మీ మొదటి పరికరాల జాబితాను జోడించడం ద్వారా ప్రారంభించండి',
    'myListings.available': 'అందుబాటులో ఉంది',
    'myListings.rented': 'అద్దెకు ఇవ్వబడింది',
    'myListings.maintenance': 'నిర్వహణ',
    'myListings.edit': 'సవరించండి',
    'myListings.delete': 'తొలగించండి',
    'myListings.views': 'వీక్షణలు',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
