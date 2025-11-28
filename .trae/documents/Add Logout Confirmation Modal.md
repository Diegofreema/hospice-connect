## Approach
- Replace immediate logout in `features/shared/components/log-out.tsx` with a confirmation modal using the existing Dialog components.
- Keep the footer button in `MoreLinks` as-is; `ListFooterComponent={LogOut}` continues to render the entry point.

## Implementation
1. Wrap the logout button in `Dialog` + `DialogTrigger`.
2. Show `DialogContent` with:
   - `DialogHeader` → title “Confirm Logout” and description “Are you sure you want to log out?”
   - `DialogFooter` → two actions:
     - `DialogClose` → “Cancel” (closes modal)
     - Primary button → “Log out” (runs the existing `authClient.signOut`, shows toast, closes modal).
3. Respect existing `loading` state: disable buttons while logging out.
4. Preserve styling via `useUnistyles` theme colors.

## Verification
- Clicking “Logout” in `MoreLinks` opens a modal instead of logging out.
- “Cancel” closes the modal, no logout.
- “Log out” performs logout, shows success/error toasts, and closes the modal.
- No regressions elsewhere since `LogOut` isn’t used outside `MoreLinks`.
