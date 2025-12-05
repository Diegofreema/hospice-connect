## Rules To Implement

1. Terminal statuses: if assignment is 'cancelled' or 'ended', do not update.
2. Completion: if the last schedule's end date+time has passed, set assignment to 'completed'.
3. Availability: if any schedule has status 'available', set assignment to 'available'.
4. Booking: if no schedules are 'available', and any schedule is 'booked' or 'on\_going', set assignment to 'booked'. If none are 'available' at all, default to 'booked' (covers 'not\_covered').
5. Timezone: treat schedule date/time as wall-clock values (local) using a timezone-agnostic parser and compare against a wall-clock "now" built the same way.

## Technical Plan

* Import `parseDateTimeWallClock` from `convex/helper.ts`.

* Fetch schedules; guard empty.

* Compute `lastEnd` by reducing schedules using `parseDateTimeWallClock(schedule.endDate, schedule.endTime)` and selecting the max end.

* Build `wallClockNow` as `Date.UTC(now.year, now.month, now.date, now.hours, now.minutes)` so comparisons are made in the same naive wall-clock basis.

* Apply precedence: terminal → completed → available → booked.

* Patch only when `newStatus` differs; keep nurseAssignments completion side-effects when status becomes 'completed' (retain existing behavior).

## Verification

* Test with: terminal statuses; any available; all booked; mixed booked/not\_covered; last end time passed earlier today.

* Ensure there is no crash with zero schedules and correct time comparisons independent of server timezone.

