## Diagnosis

* Conflict detection uses `parseDateTime` which constructs `Date(year, month-1, day, hours, minutes)` in the server's local timezone.

* This can misinterpret wall-clock times depending on where the backend runs.

* The check otherwise correctly filters nurse shifts with statuses `booked` and `on_going` and uses `doIntervalsOverlap`.

## Changes

1. Implement a timezone-agnostic parser that treats schedule date/time as wall-clock (naive) values:

   * `parseDateTimeWallClock(dateStr, timeStr) => new Date(Date.UTC(year, month-1, day, hours, minutes))`

   * Independent of server timezone; preserves wall-clock semantics.
2. Use the wall-clock parser in:

   * `convex/hospiceNotification.ts` sendCaseRequestNotification conflict checks.

   * `convex/helper.ts` checkIfNurseHasAShiftOnDateAndTime.
3. Keep overlap logic (`doIntervalsOverlap`) unchanged; it compares epoch times consistently.
4. Minor hygiene: avoid variable shadowing in the loop (rename inner `shift` to `existing`).

## Verification

* Test overlaps across midnight and multi-day ranges.

* Validate cases where the server timezone differs from the user's; comparisons remain correct.

* Ensure no change to external behavior besides more reliable conflict detection.

