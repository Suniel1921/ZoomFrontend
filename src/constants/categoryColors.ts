import type { ClientCategory } from '../types';

export const categoryColors: Record<ClientCategory, { bg: string; text: string }> = {
  'Visit Visa Applicant': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Japan Visit Visa Applicant': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'Document Translation': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Student Visa Applicant': { bg: 'bg-green-100', text: 'text-green-700' },
  'Epassport Applicant': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Japan Visa': { bg: 'bg-red-100', text: 'text-red-700' },
  'General Consultation': { bg: 'bg-gray-100', text: 'text-gray-700' }
};