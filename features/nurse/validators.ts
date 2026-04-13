import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const createNurseValidator = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(10, 'Phone number must be at most 10 characters'),
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.date(),
  discipline: z.enum(['RN', 'LVN', 'HHA']),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseState: z.string().min(1, 'License state is required'),
  address: z.string().min(1, 'Address is required'),
  rate: z.string().min(1, 'Rate is required'),
  email: z.email({ error: 'Please use a valid email' }).optional(),
  zipCode: z.string().min(1, 'Zip code is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateNurseValidator = z.infer<typeof createNurseValidator>;

export type StepProps = {
  form: UseFormReturn<CreateNurseValidator>;
  isEdit?: boolean;
  age: number;
};

export const routeSheetValidator = z.object({
  signature: z.string().min(1, 'Signature is required'),
  comment: z
    .string()
    .max(200, 'Comment must be at most 50 characters')
    .optional(),
});

export type RouteSheetValidator = z.infer<typeof routeSheetValidator>;
