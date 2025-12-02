## Assessment
- Identity and assignment guards are correct (`convex/assignments.ts:543–550`).
- Early exit for terminal statuses includes 'ended' (`convex/assignments.ts:551–553`), but schema does not declare 'ended' for assignments (`convex/schema.ts:135–142`). This is inconsistent.
- Schedules are fetched using a helper that orders ascending by default key (`convex/schedules.ts:598–602`). Using `schedules[schedules.length - 1]` as the "last" may not reflect the true latest end datetime (`convex/assignments.ts:564`).
- No guard for empty schedules while reading `lastSchedule` fields (`convex/assignments.ts:565–575`). This can crash when an assignment has no schedules.
- Completion check uses only `endDate` at midnight (`convex/assignments.ts:569–575`) and ignores `endTime`. Same-day completions will not be recognized until the next day.
- Status transitions otherwise follow a reasonable model but depend on the correctness of last schedule and completion timing.
- Side-effects for nurseAssignments are correct (`convex/assignments.ts:601–614`).

## Proposed Fixes
1. Add an explicit guard for `schedules.length === 0` before accessing `lastSchedule`.
2. Compute the true last schedule by end datetime using helper `parseDateTime(endDate, endTime)` and pick the max; do not rely on array position.
3. Replace day-only completion comparison with a precise end datetime comparison to `Date.now()`.
4. Align status enum usage with schema: remove 'ended' from checks, or add 'ended' to schema consistently; prefer removing and rely on 'cancelled'.
5. Type-safety: restrict `newStatus` to the assignment status union.

## Implementation Steps
- In `updateAssignmentStatus`:
  - If `schedules.length === 0`, either keep current status or set 'available' and return.
  - Derive `lastByEnd = schedules.reduce((max, s) => maxEnd(s) > maxEnd(max) ? s : max)` where `maxEnd(s)` is `parseDateTime(s.endDate, s.endTime).getTime()`.
  - Use `lastByEnd` for status checks and compute `timeHasPassed = parseDateTime(lastByEnd.endDate, lastByEnd.endTime) < new Date()`.
  - Update status logic without referencing 'ended'.
  - Patch assignment if `newStatus` differs, and mark nurseAssignments when `newStatus` in ['completed','cancelled'].

## Verification
- Test with: no schedules; all schedules booked; mixed booked/available; last schedule completed; last schedule not_covered; last schedule ends earlier today.
- Confirm no crashes and correct final statuses.

If approved, I will implement these targeted fixes to make the handler robust and consistent with the schema.