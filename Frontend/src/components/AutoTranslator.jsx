import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const originalText = new WeakMap();
const translationCache = new Map();

const targetLanguages = {
  en: 'en',
  hi: 'hi',
  mr: 'mr',
};

const fixedTranslations = {
  hi: {
    Home: 'होम',
    'Home Page': 'होम पेज',
    'This is Home page component.': 'यह Home page component है।',
    'Panchayat Info': 'ग्राम पंचायत जानकारी',
    'Panchayat Info Page': 'ग्राम पंचायत जानकारी पेज',
    'This is Panchayat Info page component.': 'यह Panchayat Info page component है।',
    'Citizen Services': 'नागरिक सेवा',
    'Citizen Services Page': 'नागरिक सेवा पेज',
    'This is Citizen Services page component.': 'यह Citizen Services page component है।',
    'Birth Death Registration': 'जन्म-मृत्यु पंजीकरण',
    'Property Tax': 'संपत्ति कर',
    'Property Tax Page': 'संपत्ति कर पेज',
    'This is Property Tax page component.': 'यह Property Tax page component है।',
    'Water Supply': 'जल आपूर्ति',
    'Water Supply Page': 'जल आपूर्ति पेज',
    'This is Water Supply page component.': 'यह Water Supply page component है।',
    Complaints: 'शिकायत',
    'Complaints Page': 'शिकायत पेज',
    'This is Complaints page component.': 'यह Complaints page component है।',
    Schemes: 'योजनाएं',
    'Schemes Page': 'योजना पेज',
    'This is Schemes page component.': 'यह Schemes page component है।',
    Gallery: 'गैलरी',
    'Gallery Page': 'गैलरी पेज',
    'This is Gallery page component.': 'यह Gallery page component है।',
    'Notice Board': 'सूचना बोर्ड',
    'Notice Board Page': 'सूचना बोर्ड पेज',
    'This is Notice Board page component.': 'यह Notice Board page component है।',
    Contact: 'संपर्क',
    'Contact Page': 'संपर्क पेज',
    'This is Contact page component.': 'यह Contact page component है।',
    Profile: 'प्रोफाइल',
    'Profile Page': 'प्रोफाइल पेज',
    'This is Profile page component.': 'यह Profile page component है।',
    Logout: 'लॉगआउट',
    Login: 'लॉगिन',
    'Admin Login': 'Admin लॉगिन',
    'Worker Login': 'Worker लॉगिन',
    'User Login': 'User लॉगिन',
    'This is Admin Login page.': 'यह Admin Login page है।',
    'This is Worker Login page.': 'यह Worker Login page है।',
    'This is User Login page.': 'यह User Login page है।',
    Search: 'खोजें',
    'Top Navbar Option': 'टॉप नेवबार विकल्प',
    'Chapalgaon Gram Panchayat': 'चापलगांव ग्राम पंचायत',
    'Clean village, beautiful village, prosperous village': 'स्वच्छ गांव, सुंदर गांव, समृद्ध गांव',
    'Secure Access': 'सुरक्षित प्रवेश',
    'Email Address': 'ईमेल पता',
    Password: 'पासवर्ड',
    'Verify admin email first. Password field will open only after email is correct.':
      'पहले admin email verify करें। Email सही होने पर ही password field खुलेगी।',
    'Verify Email': 'ईमेल verify करें',
    'Please wait...': 'कृपया प्रतीक्षा करें...',
    'Email verified. Please enter password.': 'ईमेल verify हो गया। कृपया password डालें।',
    'Admin login successful.': 'Admin login सफल हुआ।',
    'Please enter a valid email address.': 'कृपया सही email address डालें।',
    'Please enter password.': 'कृपया password डालें।',
    'Email not found. Please enter a correct admin email.':
      'Email नहीं मिला। कृपया सही admin email डालें।',
    'Unable to verify email. Please check backend server.':
      'Email verify नहीं हो सका। कृपया backend server check करें।',
  },
  mr: {
    Home: 'होम',
    'Home Page': 'होम पेज',
    'This is Home page component.': 'हा Home page component आहे.',
    'Panchayat Info': 'ग्रामपंचायत माहिती',
    'Panchayat Info Page': 'ग्रामपंचायत माहिती पेज',
    'This is Panchayat Info page component.': 'हा Panchayat Info page component आहे.',
    'Citizen Services': 'नागरिक सेवा',
    'Citizen Services Page': 'नागरिक सेवा पेज',
    'This is Citizen Services page component.': 'हा Citizen Services page component आहे.',
    'Birth Death Registration': 'जन्म-मृत्यू नोंदणी',
    'Property Tax': 'मालमत्ता कर',
    'Property Tax Page': 'मालमत्ता कर पेज',
    'This is Property Tax page component.': 'हा Property Tax page component आहे.',
    'Water Supply': 'पाणीपुरवठा',
    'Water Supply Page': 'पाणीपुरवठा पेज',
    'This is Water Supply page component.': 'हा Water Supply page component आहे.',
    Complaints: 'तक्रार',
    'Complaints Page': 'तक्रार पेज',
    'This is Complaints page component.': 'हा Complaints page component आहे.',
    Schemes: 'योजना',
    'Schemes Page': 'योजना पेज',
    'This is Schemes page component.': 'हा Schemes page component आहे.',
    Gallery: 'गॅलरी',
    'Gallery Page': 'गॅलरी पेज',
    'This is Gallery page component.': 'हा Gallery page component आहे.',
    'Notice Board': 'सूचना फलक',
    'Notice Board Page': 'सूचना फलक पेज',
    'This is Notice Board page component.': 'हा Notice Board page component आहे.',
    Contact: 'संपर्क',
    'Contact Page': 'संपर्क पेज',
    'This is Contact page component.': 'हा Contact page component आहे.',
    Profile: 'प्रोफाइल',
    'Profile Page': 'प्रोफाइल पेज',
    'This is Profile page component.': 'हा Profile page component आहे.',
    Logout: 'लॉगआउट',
    Login: 'लॉगिन',
    'Admin Login': 'Admin लॉगिन',
    'Worker Login': 'Worker लॉगिन',
    'User Login': 'User लॉगिन',
    'This is Admin Login page.': 'हे Admin Login page आहे.',
    'This is Worker Login page.': 'हे Worker Login page आहे.',
    'This is User Login page.': 'हे User Login page आहे.',
    Search: 'शोधा',
    'Top Navbar Option': 'टॉप नेव्हबार पर्याय',
    'Chapalgaon Gram Panchayat': 'चापलगाव ग्रामपंचायत',
    'Clean village, beautiful village, prosperous village': 'स्वच्छ गाव, सुंदर गाव, समृद्ध गाव',
    'Secure Access': 'सुरक्षित प्रवेश',
    'Email Address': 'ईमेल पत्ता',
    Password: 'पासवर्ड',
    'Verify admin email first. Password field will open only after email is correct.':
      'आधी admin email verify करा. Email बरोबर असेल तरच password field उघडेल.',
    'Verify Email': 'ईमेल verify करा',
    'Please wait...': 'कृपया थांबा...',
    'Email verified. Please enter password.': 'ईमेल verify झाला. कृपया password टाका.',
    'Admin login successful.': 'Admin login यशस्वी झाला.',
    'Please enter a valid email address.': 'कृपया योग्य email address टाका.',
    'Please enter password.': 'कृपया password टाका.',
    'Email not found. Please enter a correct admin email.':
      'Email सापडला नाही. कृपया योग्य admin email टाका.',
    'Unable to verify email. Please check backend server.':
      'Email verify होऊ शकला नाही. कृपया backend server check करा.',
  },
};

function decodeHtml(text) {
  const element = document.createElement('textarea');
  element.innerHTML = text;
  return element.value;
}

function hasWrongKannadaScript(text) {
  return /[\u0C80-\u0CFF]/.test(text);
}

function hasIndicScript(text) {
  return /[\u0900-\u097F]/.test(text);
}

async function translateWithGoogle(text, language) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', targetLanguages[language]);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url);
  const data = await response.json();
  return data?.[0]?.map((part) => part?.[0]).join('') || text;
}

async function translateWithMyMemory(text, language) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `en|${targetLanguages[language]}`);

  const response = await fetch(url);
  const data = await response.json();
  return data?.responseData?.translatedText || text;
}

function getTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      const text = node.textContent.trim();

      if (!parent || !text) {
        return NodeFilter.FILTER_REJECT;
      }

      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (parent.closest('[data-no-translate="true"]')) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  return nodes;
}

async function translateText(text, language) {
  if (language === 'en' || !targetLanguages[language]) {
    return text;
  }

  const sourceText = text.trim();
  if (hasIndicScript(sourceText)) {
    return text;
  }

  if (fixedTranslations[language]?.[sourceText]) {
    return text.replace(sourceText, fixedTranslations[language][sourceText]);
  }

  const cacheKey = `${language}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    let translatedText = await translateWithGoogle(text, language);

    if (!translatedText || translatedText === text || hasWrongKannadaScript(translatedText)) {
      translatedText = await translateWithMyMemory(text, language);
    }

    translatedText = decodeHtml(translatedText);

    if (hasWrongKannadaScript(translatedText)) {
      translatedText = text;
    }

    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch {
    return text;
  }
}

function AutoTranslator({ children }) {
  const { i18n } = useTranslation();
  const isTranslatingRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function translatePage() {
      const root = document.getElementById('root');
      if (!root) {
        return;
      }

      isTranslatingRef.current = true;
      const nodes = getTextNodes(root);

      nodes.forEach((node) => {
        if (!originalText.has(node)) {
          originalText.set(node, node.textContent);
        }
      });

      if (i18n.language === 'en') {
        nodes.forEach((node) => {
          node.textContent = originalText.get(node);
        });
        isTranslatingRef.current = false;
        return;
      }

      await Promise.all(
        nodes.map(async (node) => {
          const sourceText = originalText.get(node);
          const translatedText = await translateText(sourceText, i18n.language);

          if (isCurrent) {
            node.textContent = translatedText;
          }
        }),
      );

      isTranslatingRef.current = false;
    }

    const timeoutId = window.setTimeout(translatePage, 0);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [i18n.language, refreshKey]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) {
      return undefined;
    }

    const observer = new MutationObserver(() => {
      if (!isTranslatingRef.current && i18n.language !== 'en') {
        setRefreshKey((key) => key + 1);
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [i18n.language]);

  return children;
}

export default AutoTranslator;
