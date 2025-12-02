## Findings
- Early returns are correct for identity and missing assignment (convex/assignments.ts:543–550).
- Handler skips updates when assignment.status is in ['completed','cancelled','ended'] (convex/assignments.ts:551–553). The schema for assignment status does not include 'ended' (convex/schema.ts:135–142), yet other code sets 'ended' (convex/assignments.ts:651–654). This is inconsistent and can fail type validation.
- Schedules are fetched without an explicit chronological sort; helper returns `.order('asc')` with default key (likely `_creationTime`) (convex/schedules.ts:598–602). Using `schedules[schedules.length - 1]` as "last schedule" (convex/assignments.ts:564) may not be the true latest by end datetime.
- Potential crash when there are no schedules: `lastSchedule` is used unguarded to access fields (convex/assignments.ts:565–573, 569 uses `lastSchedule.endDate`).
- `timeHasPassed` compares only endDate at midnight (convex/assignments.ts:569–575). If the last shift ended earlier today, status won’t flip until the next day; using the precise end datetime is safer.
- Status logic:
  - Fully staffed + last is completed/not_covered → 'completed' (convex/assignments.ts:584–586) ✔️
  - Fully staffed + last not completed/not_covered → 'booked' (convex/assignments.ts:586–587) ✔️
  - Not fully staffed: if none 'available' OR last completed/not_covered → 'completed' (convex/assignments.ts:588–592). Edge case: if no schedule is 'available' but some are 'booked' and last isn’t done, the fully staffed branch would have already handled; otherwise this is acceptable.
  - Else → 'available' (convex/assignments.ts:593–595).
- Side-effects: When newStatus is 'completed' or 'cancelled', nurseAssignments are marked completed (convex/assignments.ts:601–614) ✔️.

## Proposed Fixes
1. Guard for empty schedules
- If `schedules.length === 0`, set `newStatus` to 'available' (or keep current) and return safely; avoid accessing `lastSchedule`.

2. Determine true last schedule chronologically
- Sort schedules by computed end datetime using `parseDateTime(startDate, startTime)`/`parseDateTime(endDate, endTime)` from helper (convex/helper.ts:286–299) and take the max end.

3. Use precise end datetime for completion check
- Replace day-only `stringToDate(lastSchedule.endDate)` comparison with full end datetime comparison to `Date.now()`.

4. Align status enum
- Either add 'ended' to assignment status schema (convex/schema.ts) or stop using 'ended' in code paths (e.g., cancelAssignment) and only rely on 'cancelled'. Ensure `updateAssignmentStatus` checks match schema.

5. Type hygiene
- Avoid `any` for `newStatus`; restrict to allowed union.

## Implementation Outline
- Update `getSchedulesByAssignmentIdHelper` consumer to derive `lastScheduleByEndTime` and guard for empty arrays.
- Replace `timeHasPassed` with end datetime check.
- Adjust status enum usage to match schema consistently.

## Verification
- Unit-like test runs: simulate cases with 0 schedules, mixed statuses, fully staffed ongoing, and past end datetime.
- Confirm nurseAssignments side-effects fire only for 'completed'/'cancelled'.
- Validate no runtime errors when schedules are empty.

If you approve, I’ll implement these fixes with minimal changes to public behavior but improved correctness and safety.