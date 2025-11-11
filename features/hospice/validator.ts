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

export const createAssignmentValidator = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    gender: z.string().min(1, 'Please select a gender'),
    customGender: z.string().optional(),
    dateOfBirth: z.date(),
    discipline: z.enum(['RN', 'LVN', 'HHA'], {
      error: 'Discipline is required',
    }),
    rate: z.string().min(1, 'Rate is required'),
    address: z.string().min(1, 'Address is required'),
    state: z.string().min(1, 'State is required'),
    additionalNotes: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    openShift: z.date(),
    zipcode: z.string().optional(),
    careLevel: z.enum(
      [
        'Initial Evaluation',
        'Follow Up',
        'Continuous Care',
        'Supervision',
        'Recertification',
        'Discharge',
      ],
      {
        error: 'Care level is required',
      }
    ),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // Compare just the date parts
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= startDate;
    },
    {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const today = new Date();

      // Compare just the date parts
      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    },
    {
      message: 'Start date of this assignment cannot be in the past',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      // If gender is 'others', customGender must be provided
      if (data.gender === 'others') {
        return data.customGender && data.customGender.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Please specify your gender',
      path: ['customGender'],
    }
  );
export const reopenAssignmentValidator = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
    openShift: z.date(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // Compare just the date parts
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= startDate;
    },
    {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const today = new Date();

      // Compare just the date parts
      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    },
    {
      message: 'Start date of this assignment cannot be in the past',
      path: ['startDate'],
    }
  );

export const editScheduleValidator = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
    openShift: z.date(),
    endShift: z.date(),
    rate: z.string().min(1, 'Rate is required'),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // Compare just the date parts
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      return endDate >= startDate;
    },
    {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    }
  );

export const updateProfileValidator = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  licenseNumber: z.string().min(1, 'License number is required'),

  email: z
    .email({ error: 'Please put a valid email' })
    .min(1, 'Email is required'),
});

export type UpdateProfileValidator = z.infer<typeof updateProfileValidator>;

export type EditScheduleValidator = z.infer<typeof editScheduleValidator>;
export type CreateAssignmentValidator = z.infer<
  typeof createAssignmentValidator
>;

export type CreateHospiceValidator = z.infer<typeof createHospiceValidator>;

export type ReopenAssignmentValidator = z.infer<
  typeof reopenAssignmentValidator
>;
