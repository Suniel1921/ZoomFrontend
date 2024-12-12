import { parseISO, isValid, format as formatDate } from 'date-fns';

// Safely parse any date input into a Date object
export function safeParse(dateString: string | Date | null | undefined): Date | null {
  if (!dateString) return null;
  
  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : null;
  }

  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Ensure a valid ISO string is returned
export function ensureISOString(date: Date | string | null | undefined): string {
  const parsed = safeParse(date);
  return parsed ? parsed.toISOString() : new Date().toISOString();
}

// Format time string consistently
export function formatTime(time: string | undefined | null): string {
  if (!time) return '';
  
  // Already in HH:mm format
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return time.padStart(5, '0'); // Ensure 5 characters (HH:mm)
  }
  
  try {
    const date = parseISO(time);
    if (isValid(date)) {
      return formatDate(date, 'HH:mm');
    }
  } catch {
    // Ignore parse errors
  }
  
  return '';
}

// Format date only
export function formatDateOnly(date: string | Date | null | undefined): string {
  const parsed = safeParse(date);
  if (!parsed) return '';
  return formatDate(parsed, 'MMM d');
}

// Format full date
export function formatFullDate(date: string | Date | null | undefined): string {
  const parsed = safeParse(date);
  if (!parsed) return '';
  return formatDate(parsed, 'MMM d, yyyy');
}