## Goal
Refactor `sendReassignmentNotification` to send nurse notifications in batches of 500 to avoid performance bottlenecks and potential write limits.

## Approach
- Keep all existing permission checks and query logic intact.
- Chunk the `nurses` array into groups of 500.
- Iterate batches sequentially; within each batch use `Promise.all` to insert notifications concurrently for up to 500 nurses.
- Preserve notification payload fields and index usage.

## Notes
- No changes to existing indexes, args, or notification schema.
- Errors propagate as before; empty nurse list still throws.
