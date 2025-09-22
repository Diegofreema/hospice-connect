import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ResetPasswordProps {
  code: string;
  expires: Date;
  userName?: string;
}

export const ResetPasswordEmail = ({
  code,
  expires,
  userName,
}: ResetPasswordProps) => (
  <Html>
    <Head />
    <Preview>Reset your HospiceConnect password - Action required</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logo}>
              <Text style={logoText}>HospiceConnect</Text>
            </div>
          </div>
          <Text style={headerSubtitle}>Password Reset</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={text}>Hi{userName ? ` ${userName}` : ''},</Text>

          <Text style={text}>
            We received a request to reset your password for your HospiceConnect
            account.
          </Text>

          <Text style={text}>
            If you made this request, please use the code below to reset your
            password. If you didn&apos;t request a password reset, you can
            safely ignore this email.
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>{code}</Section>

          <Text style={text}>
            This password reset link will expire in{' '}
            {Math.floor((+expires - Date.now()) / (60 * 60 * 1000))} hours for
            security reasons.
          </Text>

          <Text style={text}>
            For your security, this link can only be used once. If you need to
            reset your password again, please request a new reset link.
          </Text>

          <Text style={text}>
            If you continue to have trouble accessing your account, please
            contact our support team for assistance.
          </Text>

          <Text style={signature}>
            Best regards,
            <br />
            The HospiceConnect Team
            <br />
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent to you because a password reset was requested
            for your HospiceConnect account.
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} HospiceConnect
          </Text>
          <Text style={footerText}>HospiceConnect Bridging The Gap!</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles (inherited from your verification email)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  backgroundColor: '#060622',
  textAlign: 'center' as const,
};

const logoContainer = {
  marginBottom: '16px',
};

const logo = {
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoText = {
  color: '#060622',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: '0.8',
};

const content = {
  padding: '24px',
};

const h1 = {
  color: '#060622',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const signature = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 16px 0',
};

const footer = {
  borderTop: '1px solid #e9ecef',
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0',
};

// Additional styles for reset email
const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};
