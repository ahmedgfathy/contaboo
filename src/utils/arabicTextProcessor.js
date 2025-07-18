// Arabic real estate keywords and classification
export const PROPERTY_TYPES = {
  apartment: {
    ar: 'شقة',
    keywords: ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف', 'صالة', 'حمام', 'مطبخ']
  },
  villa: {
    ar: 'فيلا',
    keywords: ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل', 'دوبلكس']
  },
  land: {
    ar: 'أرض',
    keywords: ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'متر', 'فدان', 'قيراط']
  },
  office: {
    ar: 'مكتب',
    keywords: ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات', 'متجر']
  },
  warehouse: {
    ar: 'مخزن',
    keywords: ['مخزن', 'مخازن', 'مستودع', 'مستودعات', 'ورشة', 'ورش']
  }
};

export const AREA_KEYWORDS = [
  'الحي', 'منطقة', 'شارع', 'طريق', 'ميدان', 'كوبري', 'جسر', 'حدائق', 'مدينة',
  'قرية', 'العاشر', 'الخامس', 'السادس', 'التجمع', 'المعادي', 'مصر الجديدة',
  'الزمالك', 'وسط البلد', 'مدينة نصر', 'الهرم', 'فيصل', 'إمبابة', 'شبرا'
];

export const PRICE_KEYWORDS = [
  'جنيه', 'ألف', 'مليون', 'سعر', 'ثمن', 'تكلفة', 'مقدم', 'قسط', 'أقساط',
  'نقدي', 'كاش', 'تمويل', 'بنك', 'عربون'
];

// Function to classify property type based on Arabic text
export const classifyPropertyType = (text) => {
  const normalizedText = text.toLowerCase();
  
  for (const [type, data] of Object.entries(PROPERTY_TYPES)) {
    for (const keyword of data.keywords) {
      if (normalizedText.includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'other';
};

// Function to extract keywords from Arabic text
export const extractKeywords = (text) => {
  const keywords = [];
  const normalizedText = text.toLowerCase();
  
  // Extract property-related keywords
  Object.values(PROPERTY_TYPES).forEach(propertyData => {
    propertyData.keywords.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        keywords.push(keyword);
      }
    });
  });
  
  // Extract area keywords
  AREA_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Extract price keywords
  PRICE_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Function to extract location information
export const extractLocation = (text) => {
  const normalizedText = text.toLowerCase();
  const locations = [];
  
  AREA_KEYWORDS.forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      // Try to extract context around the location keyword
      const index = normalizedText.indexOf(keyword);
      const start = Math.max(0, index - 10);
      const end = Math.min(text.length, index + keyword.length + 10);
      locations.push(text.substring(start, end).trim());
    }
  });
  
  return locations.join(', ');
};

// Function to extract price information
export const extractPrice = (text) => {
  const normalizedText = text.toLowerCase();
  const priceRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(جنيه|ألف|مليون|k|m)/g;
  const matches = [...normalizedText.matchAll(priceRegex)];
  
  if (matches.length > 0) {
    return matches.map(match => match[0]).join(', ');
  }
  
  return '';
};

// Function to extract phone numbers from text
export const extractPhoneNumber = (text) => {
  // Enhanced Egyptian phone number patterns to match formats seen in the app:
  const phonePatterns = [
    /(?:\+201[0-9\s-]{8,}|01[0-9\s-]{8,})/g,        // Standard: +201234567890, 01234567890
    /\d{8}\s*\d{2}\s*\d{2}\+?/g,                     // Pattern: 26433244 10 20+
    /\d{3}\s*\d{3}\s*\d{4}/g,                        // Pattern: 123 456 7890
    /\+?20\s*1[0-5]\s*\d{3}\s*\d{4}/g,              // International with spaces
    /01[0-5]\s*\d{3}\s*\d{4}/g,                      // Local with spaces
    /\d{2}\s*\d{3}\s*\d{3}\s*\d{3}/g                // Split format: 01 012 345 678
  ];
  
  for (const phoneRegex of phonePatterns) {
    const matches = text.match(phoneRegex);
    if (matches && matches.length > 0) {
      // Clean up the phone number - remove spaces, dashes, special characters
      let phone = matches[0];
      phone = phone.replace(/[\s\-\+]/g, ''); // Remove spaces, dashes, plus signs
      
      // Handle different formats
      if (phone.startsWith('20')) {
        // International format: remove country code
        phone = phone.substring(2);
        if (!phone.startsWith('0')) {
          phone = '0' + phone;
        }
      }
      
      // Validate that it looks like an Egyptian mobile number
      // Accept both 11 and 12 digit numbers (some variations exist)
      if (phone.match(/^01[0-9]{9,10}$/) && phone.length >= 11 && phone.length <= 12) {
        return phone;
      }
      
      // For patterns like "26433244 10 20+", try to reconstruct
      if (phone.length >= 10 && !phone.startsWith('01')) {
        // Try to add Egyptian mobile prefix
        const testPhone = '01' + phone.substring(0, 9);
        if (testPhone.length === 11) {
          return testPhone;
        }
      }
    }
  }
  
  return null;
};

// Function to process WhatsApp chat text and extract message data
export const parseWhatsAppMessage = (line) => {
  // WhatsApp message format: [date, time] sender: message
  // Support multiple formats: [1/7/25, 10:30:25 AM], [1/7/25, 10:30:25], etc.
  const messageRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*([^:]+):\s*(.+)$/;
  const match = line.match(messageRegex);
  
  if (match) {
    const [, date, time, sender, message] = match;
    const timestamp = `${date} ${time}`;
    
    const messageData = {
      sender: sender.trim(),
      message: message.trim(),
      timestamp,
      property_type: classifyPropertyType(message),
      keywords: extractKeywords(message).join(', '),
      location: extractLocation(message),
      price: extractPrice(message),
      agent_phone: extractPhoneNumber(message) // Extract phone number from message
    };
    
    return messageData;
  }
  
  return null;
};

// Function to process entire WhatsApp chat file
export const parseWhatsAppChatFile = (fileContent) => {
  console.log('Starting to parse file content. Length:', fileContent.length);
  
  const lines = fileContent.split('\n');
  const messages = [];
  let successCount = 0;
  let errorCount = 0;
  
  console.log('Number of lines to process:', lines.length);
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      try {
        const messageData = parseWhatsAppMessage(trimmedLine);
        if (messageData) {
          messages.push(messageData);
          successCount++;
          
          // Only log every 100th message to avoid console spam
          if (successCount % 100 === 0) {
            console.log(`Processed ${successCount} messages so far...`);
          }
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) { // Only log first 5 errors
          console.warn(`Error parsing line ${index + 1}:`, error.message);
        }
      }
    }
  });
  
  console.log(`Parsing complete: ${successCount} messages parsed successfully, ${errorCount} lines skipped`);
  return messages;
};
