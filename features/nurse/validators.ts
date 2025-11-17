import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const createNurseValidator = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  gender: z.string().min(1, 'Gender is required'),
  dateOfBirth: z.date().optional(),
  discipline: z.enum(['RN', 'LVN', 'HHA']),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseState: z.string().min(1, 'License state is required'),
  address: z.string().optional(),
  rate: z.string().optional(),
  email: z.email({ error: 'Please use a valid email' }).optional(),
  zipCode: z.string().optional(),
});

export type CreateNurseValidator = z.infer<typeof createNurseValidator>;

export type StepProps = {
  form: UseFormReturn<CreateNurseValidator>;
  isEdit?: boolean;
};

export const routeSheetValidator = z.object({
  signature: z.string().min(1, 'Signature is required'),
  comment: z
    .string()
    .max(200, 'Comment must be at most 50 characters')
    .optional(),
});

export type RouteSheetValidator = z.infer<typeof routeSheetValidator>;
