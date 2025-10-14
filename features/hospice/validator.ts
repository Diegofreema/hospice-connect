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
    gender: z.enum(['male', 'female', 'others'], {
      error: 'Gender is required',
    }),
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
  )
  .refine((data) => data.endShift >= data.openShift, {
    message: 'End of shift cannot be before opening shift',
    path: ['endShift'],
  })
  .refine(
    (data) => {
      const startShift = new Date(data.openShift);
      const today = new Date();
      startShift.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return startShift >= today;
    },
    {
      message: 'Start date of this assignment cannot be in the past',
      path: ['startDate'],
    }
  );

export type EditScheduleValidator = z.infer<typeof editScheduleValidator>;
export type CreateAssignmentValidator = z.infer<
  typeof createAssignmentValidator
>;

export type CreateHospiceValidator = z.infer<typeof createHospiceValidator>;

export type ReopenAssignmentValidator = z.infer<
  typeof reopenAssignmentValidator
>;
