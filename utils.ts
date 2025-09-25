/**
 * Formats a date string with DD/MM/YYYY mask.
 * Allows only numbers and automatically adds slashes.
 */
export const applyDateMask = (value: string): string => {
  let v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 4) {
    v = `${v.slice(0, 4)}/${v.slice(4)}`;
  }
  if (v.length > 2) {
    v = `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
};

/**
 * Validates if a string is in DD/MM/YYYY format and represents a valid date.
 */
export const validateDate = (dateStr: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return false;
  }
  const [day, month, year] = dateStr.split('/').map(Number);
  // Basic validation
  if (year < 1900 || year > 2100 || month === 0 || month > 12) {
      return false;
  }
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Validates an email address.
 */
export const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Formats a Date object to a DD/MM/YYYY string.
 */
export const formatDateToDDMMYYYY = (date: Date): string => {
    const d = new Date(date);
    const day = (`0${d.getDate()}`).slice(-2);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Parses a DD/MM/YYYY string into a Date object.
 */
export const parseDDMMYYYYtoDate = (dateStr: string): Date | null => {
    if (!validateDate(dateStr)) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Formats a phone number string with a robust mask for Brazilian numbers.
 * Handles both landline (10 digits) and mobile (11 digits) formats.
 */
export const applyPhoneMask = (value: string): string => {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  const length = cleaned.length;

  if (length === 0) {
    return "";
  }
  
  if (length <= 2) {
    return `(${cleaned}`;
  }
  
  if (length <= 6) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }

  // Handles landline format: (XX) XXXX-XXXX
  if (length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // Handles mobile format: (XX) XXXXX-XXXX
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

/**
 * Converts a simple markdown string to HTML.
 * Supports:
 * - Bold (**text**)
 * - Unordered lists (- item)
 * - Ordered lists (1. item)
 * - Paragraphs (separated by double newlines)
 * - Line breaks (single newlines within a paragraph)
 */
export const markdownToHtml = (text: string): string => {
    if (!text) return '';

    const processInlines = (line: string): string => {
      // Bold **text**
      return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    // Split into blocks by one or more empty lines
    const blocks = text.split(/\n\s*\n+/);

    const htmlBlocks = blocks.map(block => {
      const lines = block.trim().split('\n');
      if (lines.length === 0 || lines[0].trim() === '') return '';

      const firstLine = lines[0].trim();
      const isUl = firstLine.startsWith('- ');
      const isOl = /^\d+\.\s/.test(firstLine);

      if (isUl) {
        const listItems = lines
          .map(line => `<li>${processInlines(line.replace(/-\s/, '').trim())}</li>`)
          .join('');
        return `<ul>${listItems}</ul>`;
      }
      
      if (isOl) {
        const listItems = lines
          .map(line => `<li>${processInlines(line.replace(/\d+\.\s/, '').trim())}</li>`)
          .join('');
        return `<ol>${listItems}</ol>`;
      }

      // It's a paragraph block
      return `<p>${lines.map(processInlines).join('<br />')}</p>`;
    });

    return htmlBlocks.join('');
  };


export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const lerp = (start: number, end: number, amt: number): number => {
    return Math.round((1 - amt) * start + amt * end);
}

export const generateColorPalette = (baseHex: string): { [key: string]: string } => {
    const baseRgb = hexToRgb(baseHex);
    if (!baseRgb) {
        // Fallback to a default color if hex is invalid
        return generateColorPalette('#22c55e');
    };

    const paletteRgb: { [key: string]: { r: number, g: number, b: number } } = {};
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    // The base color is often a mid-range, like 500 or 600. Let's use it for 600.
    paletteRgb['600'] = baseRgb;

    // Generate lighter shades by mixing with white
    paletteRgb['500'] = { r: lerp(baseRgb.r, white.r, 0.2), g: lerp(baseRgb.g, white.g, 0.2), b: lerp(baseRgb.b, white.b, 0.2) };
    paletteRgb['400'] = { r: lerp(baseRgb.r, white.r, 0.4), g: lerp(baseRgb.g, white.g, 0.4), b: lerp(baseRgb.b, white.b, 0.4) };
    paletteRgb['300'] = { r: lerp(baseRgb.r, white.r, 0.6), g: lerp(baseRgb.g, white.g, 0.6), b: lerp(baseRgb.b, white.b, 0.6) };
    paletteRgb['200'] = { r: lerp(baseRgb.r, white.r, 0.8), g: lerp(baseRgb.g, white.g, 0.8), b: lerp(baseRgb.b, white.b, 0.8) };
    paletteRgb['100'] = { r: lerp(baseRgb.r, white.r, 0.9), g: lerp(baseRgb.g, white.g, 0.9), b: lerp(baseRgb.b, white.b, 0.9) };
    paletteRgb['50'] = { r: lerp(baseRgb.r, white.r, 0.95), g: lerp(baseRgb.g, white.g, 0.95), b: lerp(baseRgb.b, white.b, 0.95) };
    
    // Generate darker shades by mixing with black
    paletteRgb['700'] = { r: lerp(baseRgb.r, black.r, 0.2), g: lerp(baseRgb.g, black.g, 0.2), b: lerp(baseRgb.b, black.b, 0.2) };
    paletteRgb['800'] = { r: lerp(baseRgb.r, black.r, 0.4), g: lerp(baseRgb.g, black.g, 0.4), b: lerp(baseRgb.b, black.b, 0.4) };
    paletteRgb['900'] = { r: lerp(baseRgb.r, black.r, 0.6), g: lerp(baseRgb.g, black.g, 0.6), b: lerp(baseRgb.b, black.b, 0.6) };
    paletteRgb['950'] = { r: lerp(baseRgb.r, black.r, 0.75), g: lerp(baseRgb.g, black.g, 0.75), b: lerp(baseRgb.b, black.b, 0.75) };
    
    const paletteString: { [key: string]: string } = {};
    for (const key in paletteRgb) {
        const { r, g, b } = paletteRgb[key];
        paletteString[key] = `${r} ${g} ${b}`;
    }
    
    return paletteString;
};