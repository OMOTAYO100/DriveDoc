import { createWorker } from 'tesseract.js';

/**
 * Extracts document details from an image file
 * @param {File|Blob|string} imageSource - The image to process
 * @returns {Promise<{number: string, expiryDate: string}>}
 */
export const scanDocument = async (imageSource) => {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imageSource);

    const details = {
      number: '',
      expiryDate: ''
    };

    // Simple regex for Document Number (often alphanumeric with dashes/spaces)
    // Looking for patterns like DL-12345, ABC1234567, etc.
    const numberPatterns = [
      /[A-Z0-9]{2,}-\d{4,}/, // e.g., DL-12345
      /[A-Z]{1,2}\d{6,}/,     // e.g., AB123456
      /ID:\s*([A-Z0-9-]+)/i,  // e.g., ID: 123-456
      /Number:\s*([A-Z0-9-]+)/i
    ];

    for (const pattern of numberPatterns) {
      const match = text.match(pattern);
      if (match) {
        details.number = match[1] || match[0];
        break;
      }
    }

    // Regex for Dates (DD/MM/YYYY, YYYY-MM-DD, etc.)
    // Looking for "Expiry" or "Valid until" nearby
    const datePatterns = [
      /(?:exp|expiry|valid\s+until|valid\s+thru)[\s:]*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i,
      /(?:exp|expiry|valid\s+until|valid\s+thru)[\s:]*([0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2})/i,
      /([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/ // General date fallback
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Normalize date to YYYY-MM-DD for input[type="date"]
        const dateStr = match[1] || match[0];
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            details.expiryDate = date.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          console.warn('Failed to parse date:', dateStr);
        }
      }
    }

    return details;
  } finally {
    await worker.terminate();
  }
};
