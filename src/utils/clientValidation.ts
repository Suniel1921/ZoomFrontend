import { z } from 'zod';
import type { ClientCategory } from '../types';

const optionalCategories: ClientCategory[] = [
  'Document Translation',
  'Epassport Applicant',
  'Japan Visa',
  'General Consultation'
];

export const createClientSchema = (category: ClientCategory, isEditing = false) => {
  const isOptionalCategory = optionalCategories.includes(category);

  // Base email schema - required for new clients in mandatory categories
  const emailSchema = isEditing
    ? z.string().email('Invalid email address').optional().or(z.literal(''))
    : isOptionalCategory 
      ? z.string().email('Invalid email address').optional().or(z.literal(''))
      : z.string().email('Invalid email address');

  // Base phone schema - required for new clients in mandatory categories
  const phoneSchema = isEditing
    ? z.string().optional().or(z.literal(''))
    : isOptionalCategory
      ? z.string().optional().or(z.literal(''))
      : z.string().min(1, 'Phone number is required');

  // Base password schema - required for new clients in mandatory categories
  const passwordSchema = isEditing
    ? z.string().optional().or(z.literal(''))
    : isOptionalCategory
      ? z.string().optional().or(z.literal(''))
      : z.string().min(8, 'Password must be at least 8 characters');

  // Base nationality schema - required for new clients in mandatory categories
  const nationalitySchema = isEditing
    ? z.string().optional().or(z.literal(''))
    : isOptionalCategory
      ? z.string().optional().or(z.literal(''))
      : z.string().min(1, 'Nationality is required');

  // Base address schema - make all fields optional when editing
  const addressSchema = isEditing
    ? z.object({
        postalCode: z.string().optional(),
        prefecture: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        building: z.string().optional(),
      })
    : isOptionalCategory
      ? z.object({
          postalCode: z.string().optional().or(z.literal('')),
          prefecture: z.string().optional().or(z.literal('')),
          city: z.string().optional().or(z.literal('')),
          street: z.string().optional().or(z.literal('')),
          building: z.string().optional(),
        })
      : z.object({
          postalCode: z.string().min(7, 'Postal code must be 7 digits'),
          prefecture: z.string().min(1, 'Prefecture is required'),
          city: z.string().min(1, 'City is required'),
          street: z.string().min(1, 'Street is required'),
          building: z.string().optional(),
        });

  return z.object({
    name: isEditing ? z.string().optional() : z.string().min(1, 'Name is required'),
    email: emailSchema,
    phone: phoneSchema,
    nationality: nationalitySchema,
    category: z.enum([
      'Visit Visa Applicant',
      'Japan Visit Visa Applicant',
      'Document Translation',
      'Student Visa Applicant',
      'Epassport Applicant',
      'Japan Visa',
      'General Consultation'
    ] as const),
    status: z.enum(['active', 'inactive']),
    profilePhoto: z.string().optional(),
    address: addressSchema,
    socialMedia: z.object({
      facebook: z.string().optional(),
    }),
    modeOfContact: z.array(z.enum(['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger'])),
    password: passwordSchema,
  });
};