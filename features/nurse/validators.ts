import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const createNurseValidator = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  gender: z.string(),
  dateOfBirth: z.date(),
  discipline: z.enum(['RN', 'LVN', 'HHA']),
  licenseNumber: z.string(),
  licenseState: z.string(),
});

export type CreateNurseValidator = z.infer<typeof createNurseValidator>;

export type StepProps = {
  form: UseFormReturn<CreateNurseValidator>;
  isEdit?: boolean;
};
