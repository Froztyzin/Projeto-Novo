import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const applyDateMask = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
};

export const validateDate = (dateStr: string): boolean => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const formatDateToDDMMYYYY = (date: Date | string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const parseDDMMYYYYtoDate = (dateStr: string): Date | null => {
    if (!validateDate(dateStr)) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

export const applyPhoneMask = (value: string): string => {
    if (!value) return "";
    value = value.replace(/\D/g,'');
    value = value.replace(/(\d{2})(\d)/,"($1) $2");
    value = value.replace(/(\d)(\d{4})$/,"$1-$2");
    return value.slice(0, 15);
};

export const applyCreditCardMask = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .slice(0, 19);
};

export const applyExpiryDateMask = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 5);
};


export const markdownToHtml = (markdown: string): string => {
    if (typeof window === 'undefined') {
      return marked.parse(markdown);
    }
    return DOMPurify.sanitize(marked.parse(markdown));
};

export const generateColorPalette = (hex: string): Record<string, string> => {
    const color = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const shades: Record<string, number> = {
        '50': 0.95, '100': 0.9, '200': 0.75, '300': 0.6, '400': 0.3,
        '500': 0, '600': -0.1, '700': -0.2, '800': -0.3, '900': -0.4, '950': -0.5
    };

    const palette: Record<string, string> = {};

    for (const shade in shades) {
        const factor = shades[shade];
        const newR = Math.min(255, Math.max(0, Math.round(r + (factor > 0 ? (255 - r) * factor : r * factor))));
        const newG = Math.min(255, Math.max(0, Math.round(g + (factor > 0 ? (255 - g) * factor : g * factor))));
        const newB = Math.min(255, Math.max(0, Math.round(b + (factor > 0 ? (255 - b) * factor : b * factor))));
        palette[shade] = `${newR}, ${newG}, ${newB}`;
    }
    return palette;
};