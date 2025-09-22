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

export type CreateHospiceValidator = z.infer<typeof createHospiceValidator>;
