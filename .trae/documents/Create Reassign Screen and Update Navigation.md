I will create a new screen `reassign.tsx` in `app/(protected)/(boarded)/(hospice)/(other-screens)/` by duplicating the functionality of `assign-nurse.tsx` (since `assign.tsx` does not fetch nurses, but `assign-nurse.tsx` does, and the context "reassign" matches "assign-nurse"). Then I will update the `ShiftCard` component to navigate to this new screen.

Steps:

1. Create `app/(protected)/(boarded)/(hospice)/(other-screens)/reassign.tsx` with the content of `assign-nurse.tsx`, renaming the component to `Reassign` and the back button title to "Reassign".
2. Update `features/hospice/components/shift-card.tsx` to change the `handleReassign` function to route to `/reassign` instead of `/assign-nurse`.

