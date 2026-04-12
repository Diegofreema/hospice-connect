import { Button } from '@/components/web/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/web/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/web/ui/input-otp';
import { Loader2, ShieldQuestion } from 'lucide-react-native';

/**
 * VerificationContent — a standalone OTP input block (no Dialog wrapper).
 * Use directly in pages (e.g. verify-2fa) or inside VerificationModal.
 */
export function VerificationContent({
  onVerify,
  isVerifying,
  otpCode,
  setOtpCode,
  title = 'Verify Your Account',
  description = `We've sent a 6-digit verification code to your email. Please enter it below to complete the setup.`,
  onCancel,
}: {
  onVerify: () => void;
  isVerifying: boolean;
  otpCode: string;
  setOtpCode: (code: string) => void;
  title?: string;
  description?: string;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-4">
      {title ? (
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 font-semibold text-sm">
            <ShieldQuestion className="h-5 w-5 text-blue-500" />
            {title}
          </h3>
          {description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      ) : (
        description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )
      )}

      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <InputOTP
          maxLength={6}
          value={otpCode}
          onChange={(value) => setOtpCode(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
            Cancel
          </Button>
        )}
        <Button
          onClick={onVerify}
          disabled={otpCode.length !== 6 || isVerifying}
          className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 w-full sm:w-auto"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * VerificationModal — wraps VerificationContent in a controlled Dialog.
 * Use this anywhere you need a popup 2FA verification flow.
 */
export function VerificationModal({
  isOpen,
  onClose,
  ...props
}: {
  isOpen: boolean;
  onClose: () => void;
} & React.ComponentProps<typeof VerificationContent>) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-5 w-5 text-blue-500" />
            {props.title ?? 'Verify Your Account'}
          </DialogTitle>
          <DialogDescription>
            {props.description ??
              "We've sent a 6-digit verification code to your email. Please enter it below to complete the setup."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <InputOTP
            maxLength={6}
            value={props.otpCode}
            onChange={(value) => props.setOtpCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={props.isVerifying}
          >
            Cancel
          </Button>
          <Button
            onClick={props.onVerify}
            disabled={props.otpCode.length !== 6 || props.isVerifying}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 w-full sm:w-auto"
          >
            {props.isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Finish'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
