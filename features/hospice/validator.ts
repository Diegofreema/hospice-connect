import { z } from 'zod';

export const createHospiceValidator = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters'),
  address: z.string().min(2, 'Address must be at least 2 characters'),
  state: z.string().min(2, 'State of registration is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters'),

  licenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters'),
});

export const createAssignmentValidator = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  gender: z.enum(['male', 'female', 'others']),
  dateOfBirth: z.date(),
  discipline: z.enum(['RN', 'LVN', 'HHA']),
  rate: z.string().min(1, 'Rate is required'),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  additionalNotes: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  openShift: z.date(),
  careLevel: z.enum([
    'Initial Evaluation',
    'Follow Up',
    'Continuous Care',
    'Supervision',
    'Recertification',
    'Discharge',
  ]),
});

export type CreateAssignmentValidator = z.infer<
  typeof createAssignmentValidator
>;

export type CreateHospiceValidator = z.infer<typeof createHospiceValidator>;
