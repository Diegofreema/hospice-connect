## Approach
- Replace per‑day single shift generation with continuous 12‑hour chaining that starts at `startDate` with `openShift` time and advances by 12 hours until reaching `endDate`.
- This ensures exactly two 12‑hour shifts per full day and handles partial final day correctly.

## Implementation
1. Compute initial cursor: `shiftStart = set(startDate, { hours: openShift.getHours(), minutes: openShift.getMinutes(), seconds: 0, milliseconds: 0 })`.
2. Loop while `shiftStart < endDate`:
   - `shiftEnd = addHours(shiftStart, 12)`
   - `actualEnd = shiftEnd > endDate ? endDate : shiftEnd`
   - Push `{ start: format(shiftStart,'dd-MM-yyyy'), end: format(actualEnd,'dd-MM-yyyy'), startShift: format(shiftStart,'h:mm a'), endShift: format(actualEnd,'h:mm a') }`
   - `shiftStart = shiftEnd` (chain immediately)
3. Remove `eachDayOfInterval` usage, keep date‑fns `set`, `addHours`, `format`.

## Verification
- For a multi‑day range, yields two 12‑hour entries per full day.
- For partial final day, last entry is truncated to `endDate`.
- Handles openShift at any hour, including night (e.g., 20:00 → 08:00 next day → 20:00, etc.).