import { type ClientCategory } from '../types';

interface CategoryBadgeProps {
  category: ClientCategory;
}

const categoryStyles: Record<ClientCategory, { bg: string; text: string }> = {
  'Visit Visa Applicant': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  'Japan Visit Visa Applicant': {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
  },
  'Document Translation': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
  },
  'Student Visa Applicant': {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  'Epassport Applicant': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
  },
  'Japan Visa': {
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  'Graphic Design & Printing': {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
  },
  'Web Design & Seo': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
  },
  'Birth Registration': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  'Documentation Support': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  },
  'Other': {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
  },
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const style = categoryStyles[category] || { bg: 'bg-gray-300', text: 'text-gray-700' }; // Default fallback

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      {category}
    </span>
  );
}