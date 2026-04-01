import { defineSchema, defineTable } from 'convex/server';
import { type Infer, v } from 'convex/values';
export const scheduleStatus = v.union(
  v.literal('completed'),
  v.literal('not_covered'),
  v.literal('booked'),
  v.literal('on_going'),
  v.literal('available'),
  v.literal('cancelled'),
  v.literal('ended'),
);
export const discipline = v.union(
  v.literal('RN'),
  v.literal('LVN'),
  v.literal('HHA'),
);
export type DisciplineType = Infer<typeof discipline>;
export const careLevel = v.union(
  v.union(
    v.literal('Initial Evaluation'),
    v.literal('Follow Up'),
    v.literal('Continuous Care'),
    v.literal('Supervision'),
    v.literal('Recertification'),
    v.literal('Discharge'),
  ),
);

export const shifts = v.object({
  start: v.string(),
  end: v.string(),
  startShift: v.string(),
  endShift: v.string(),
});
export const hospiceSubscription = {
  hospiceId: v.id('hospices'),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  stripePriceId: v.string(),
  stripeCurrentPeriodEnd: v.number(),
};

const stats = {
  totalNurses: v.number(),
  totalHospices: v.number(),
  totalUnApprovedNurses: v.number(),
  totalUnApprovedHospices: v.number(),
  totalApprovedNurses: v.number(),
  totalApprovedHospices: v.number(),
  totalSuspendedNurses: v.number(),
  totalSuspendedHospices: v.number(),
  totalAssignments: v.number(),
  totalCompletedAssignments: v.number(),
  totalEndedAssignments: v.number(),
  totalActiveAssignments: v.number(),
  totalRejectedNurses: v.number(),
  totalRejectedHospices: v.number(),
};
export const Nurse = {
  name: v.string(),
  gender: v.string(),
  phoneNumber: v.string(),
  email: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  dateOfBirth: v.optional(v.string()),
  discipline: discipline,
  rate: v.optional(v.number()),
  imageId: v.optional(v.id('_storage')),
  userId: v.string(),
  address: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  nurseTimezone: v.string(),
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('suspended'),
  ),
  rejectedReason: v.optional(v.string()),
  stripeCustomerId: v.optional(v.string()),
};
const PendingNurse = {
  firstName: v.string(),
  lastName: v.string(),
  licenseNumber: v.string(),
  stateOfRegistration: v.string(),
  discipline: discipline,
  isApproved: v.boolean(),
  nurseId: v.id('nurses'),
  dateOfBirth: v.optional(v.string()),
};
const NurseAssignments = {
  nurseId: v.id('nurses'),
  isCompleted: v.boolean(),
  assignmentId: v.id('assignments'),
  completedAt: v.optional(v.number()),
  isSubmitted: v.boolean(),
};

export const Hospice = {
  address: v.string(),
  businessName: v.string(),
  licenseNumber: v.string(),
  state: v.string(),
  approved: v.boolean(),
  zipcode: v.optional(v.string()),
  userId: v.string(),
  faxNumber: v.optional(v.string()),
  phoneNumber: v.string(),
  email: v.string(),
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('suspended'),
  ),
  imageId: v.optional(v.id('_storage')),
  rejectedReason: v.optional(v.string()),
};
const PendingHospice = {
  address: v.string(),
  businessName: v.string(),
  licenseNumber: v.string(),
  state: v.string(),
  faxNumber: v.optional(v.string()),
  phoneNumber: v.string(),
  email: v.string(),
  isApproved: v.boolean(),
  hospiceId: v.id('hospices'),
  zipcode: v.optional(v.string()),
};

export const Schedule = {
  assignmentId: v.id('assignments'),
  status: scheduleStatus,
  nurseId: v.optional(v.id('nurses')),
  startTime: v.string(),
  endTime: v.string(),
  startDate: v.string(),
  endDate: v.string(),
  rate: v.number(),
  isReassigned: v.optional(v.boolean()),
  reassignedAt: v.optional(v.number()),
  canceledAt: v.optional(v.number()),
  isEdited: v.optional(v.boolean()),
  isSubmitted: v.optional(v.boolean()),
  isTimeEdited: v.optional(v.boolean()),
};

export type ScheduleType = typeof Schedule;

export const gender = v.union(
  v.literal('male'),
  v.literal('female'),
  v.literal('others'),
);

export const deleteAccount = {
  userId: v.string(),
  reason: v.string(),
};
export const assignment = {
  hospiceId: v.id('hospices'),
  assignedTo: v.optional(v.id('nurses')),
  phoneNumber: v.string(),
  patientFirstName: v.string(),
  patientLastName: v.string(),
  gender: v.string(),
  dateOfBirth: v.string(),
  discipline: discipline,
  startDate: v.string(),
  endDate: v.string(),
  openShift: v.string(),
  patientAddress: v.string(),
  state: v.string(),
  zipcode: v.optional(v.string()),
  notes: v.optional(v.string()),
  status: v.union(
    v.literal('completed'),
    v.literal('not_covered'),
    v.literal('booked'),
    v.literal('available'),
    v.literal('ended'),
  ),
  rate: v.number(),
  careLevel,
  isCanceled: v.optional(v.boolean()),
  canceledAt: v.optional(v.number()),
  hospiceTimezone: v.string(),
};
export const routeSheet = {
  nurseId: v.id('nurses'),
  hospiceId: v.id('hospices'),
  scheduleIds: v.array(v.id('schedules')),
  assignmentId: v.id('assignments'),
  status: v.optional(
    v.union(v.literal('pending'), v.literal('approved'), v.literal('declined')),
  ),

  isSeen: v.optional(v.boolean()),
  signature: v.string(),
  comment: v.optional(v.string()),
};
export const Rating = {
  nurseId: v.id('nurses'),
  rate: v.number(),
};
export const User = {
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  imageId: v.optional(v.id('_storage')),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  streamToken: v.optional(v.string()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  isBoarded: v.boolean(),
  role: v.union(v.literal('nurse'), v.literal('hospice'), v.literal('admin')),
  userId: v.string(),
};
export const day = v.object({
  day: v.union(
    v.literal('Monday'),
    v.literal('Tuesday'),
    v.literal('Wednesday'),
    v.literal('Thursday'),
    v.literal('Friday'),
    v.literal('Saturday'),
    v.literal('Sunday'),
  ),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  available: v.boolean(),
});
export const days = v.array(day);

export const Availability = {
  nurseId: v.id('nurses'),
  days: days,
};
export const NurseNotification = {
  nurseId: v.id('nurses'),
  isRead: v.boolean(),
  type: v.union(
    v.literal('assignment'),
    v.literal('normal'),
    v.literal('admin'),
    v.literal('reassignment'),
  ),
  title: v.string(),
  description: v.optional(v.string()),
  hospiceId: v.optional(v.id('hospices')),
  scheduleId: v.optional(v.id('schedules')),
  status: v.optional(
    v.union(
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('disabled'),
    ),
  ),
  viewCount: v.number(),
  adminNotificationId: v.optional(v.id('adminNotifications')),
};
export const HospiceNotification = {
  hospiceId: v.id('hospices'),
  isRead: v.boolean(),
  type: v.union(
    v.literal('case_request'),
    v.literal('route_sheet'),
    v.literal('cancel_request'),
    v.literal('admin'),
    v.literal('assignment'),
    v.literal('reassignment'),
  ),
  reason: v.optional(v.string()),
  title: v.string(),
  description: v.optional(v.string()),
  routeSheetId: v.optional(v.id('routeSheets')),
  scheduleId: v.optional(v.id('schedules')),
  nurseId: v.optional(v.id('nurses')),
  status: v.optional(
    v.union(
      v.literal('accepted'),
      v.literal('declined'),
      v.literal('disabled'),
    ),
  ),
  viewCount: v.number(),
  adminNotificationId: v.optional(v.id('adminNotifications')),
};
export const adminNotification = {
  isRead: v.boolean(),
  title: v.string(),
  description: v.optional(v.string()),
  nurseId: v.optional(v.id('nurses')),
  hospiceId: v.optional(v.id('hospices')),
  type: v.union(v.literal('nurse'), v.literal('hospice')),
  viewCount: v.number(),
  sentBy: v.string(),
};

const NursePaymentMethod = {
  nurseId: v.id('nurses'),
  stripeCustomerId: v.string(),
  stripePaymentMethodId: v.string(),
  last4: v.string(),
  brand: v.string(),
  expMonth: v.number(),
  expYear: v.number(),
  isDefault: v.boolean(),
};
export default defineSchema({
  users: defineTable(User)
    .index('email', ['email'])
    .index('userId', ['userId']),
  nurses: defineTable(Nurse)
    .index('userId', ['userId'])
    .index('by_discipline', ['discipline', 'stateOfRegistration', 'status'])
    .index('by_discipline_2', ['discipline'])
    .index('by_status', ['status'])
    .index('by_state', ['stateOfRegistration'])
    .index('by_discipline_and_status', ['discipline', 'status'])
    .index('by_state_and_status', ['stateOfRegistration', 'status']),
  hospices: defineTable(Hospice).index('userId', ['userId']),
  assignments: defineTable(assignment)
    .index('state', ['state', 'status', 'discipline'])
    .index('hospiceId', ['hospiceId', 'status', 'discipline']),
  schedules: defineTable(Schedule)
    .index('nurse', ['nurseId', 'status'])
    .index('nurse_id', ['nurseId', 'assignmentId'])
    .index('by_assignment_id', [
      'assignmentId',
      'status',
      'nurseId',
      'isSubmitted',
    ]),
  routeSheets: defineTable(routeSheet)
    .index('by_assignment_id', [
      'assignmentId',
      'nurseId',
      'hospiceId',
      'status',
    ])
    .index('approved', ['status'])
    .index('is_approved', ['status', 'assignmentId']),
  ratings: defineTable(Rating).index('nurseId', ['nurseId']),
  availabilities: defineTable(Availability).index('nurseId', ['nurseId']),
  nurseNotifications: defineTable(NurseNotification)
    .index('by_nurseId', ['nurseId', 'isRead'])
    .index('nurseId_scheduleId', ['nurseId', 'scheduleId', 'type'])
    .index('scheduleId', ['scheduleId', 'type'])
    .index('by_admin_notification_id', ['adminNotificationId']),
  hospiceNotifications: defineTable(HospiceNotification)
    .index('by_hospice_id', ['hospiceId', 'isRead'])
    .index('hospiceId_scheduleId', ['hospiceId', 'scheduleId', 'type'])
    .index('scheduleId', ['scheduleId', 'type'])
    .index('nurse_schedule_id', ['nurseId', 'scheduleId', 'type'])
    .index('by_admin_notification_id', ['adminNotificationId']),
  hospiceSubscriptions: defineTable(hospiceSubscription).index(
    'by_hospice_id',
    ['hospiceId'],
  ),
  pendingNurseProfile: defineTable(PendingNurse)
    .index('by_nurse_id', ['nurseId'])
    .index('isApproved', ['isApproved']),
  pendingHospiceProfile: defineTable(PendingHospice)
    .index('by_hospice_id', ['hospiceId'])
    .index('isApproved', ['isApproved']),
  nurseAssignments: defineTable(NurseAssignments)
    .index('nurse_id', ['nurseId', 'isCompleted', 'assignmentId'])
    .index('nurse_id_is_submitted', ['nurseId', 'isCompleted', 'isSubmitted'])
    .index('assignmentId', ['assignmentId', 'nurseId'])
    .index('by_completed_submitted', ['isCompleted', 'isSubmitted']),
  activityLogs: defineTable({
    userId: v.id('users'),
    action: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
  }).index('by_user', ['userId']),
  stats: defineTable(stats),
  commission: defineTable({
    commissionPercentage: v.number(),
  }),
  adminNotifications: defineTable(adminNotification),
  accountDeletionRequests: defineTable({
    userId: v.string(),
    email: v.string(),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('cancelled'),
    ),
    requestedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index('by_userId', ['userId'])
    .index('by_status', ['status']),
  adminActivityNotifications: defineTable({
    title: v.string(),
    description: v.string(),
    entityId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    isRead: v.boolean(),
    nurseId: v.optional(v.id('nurses')),
    hospiceId: v.optional(v.id('hospices')),
    type: v.union(v.literal('nurse'), v.literal('hospice')),
  }).index('by_isRead', ['isRead']),
  nursePaymentMethods: defineTable(NursePaymentMethod)
    .index('by_nurse', ['nurseId'])
    .index('by_stripe_customer', ['stripeCustomerId']),
  deleteAccount: defineTable(deleteAccount).index('by_userId', ['userId']),
});
