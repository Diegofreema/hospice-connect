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

interface VerifyEmailProps {
  code: string;
  expires: Date;
}

export const VerifyEmail = ({ expires, code }: VerifyEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Verify your email address to complete your Hospice account creation
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logo}>
              <Text style={logoText}>HospiceConnect</Text>
            </div>
          </div>
          <Text style={headerSubtitle}>Account Creation</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Verify Your Email Address</Heading>

          <Text style={text}>Hi,</Text>

          <Text style={text}>
            Welcome to HospiceConnect! We&apos;re excited to have you join our
            community.
          </Text>

          <Text style={text}>
            To complete your registration and secure your account, please verify
            your email address by using this token below:
          </Text>

          {/* CTA Button */}
          <Text className="text-sm">
            Please enter the following code on the sign in page.
          </Text>
          <Section className="text-center">
            <Text className="font-semibold">Verification code</Text>
            <Text className="font-bold text-4xl">{code}</Text>
            <Text>
              (This code is valid for{' '}
              {Math.floor((+expires - Date.now()) / (60 * 60 * 1000))} hours)
            </Text>
          </Section>

          <Text style={text}>
            This verification link will expire in 24 hours for security reasons.
          </Text>

          {/* Program Info */}
          <Text style={text}>
            If you didn&apos;t create an account with HospiceConnect, you can
            safely ignore this email.
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
            This email was sent to you as part of your HospiceConnect account
            creation process.
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

export default VerifyEmail;

// Styles
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

// const buttonContainer = {
//   textAlign: "center" as const,
//   margin: "32px 0",
// };

// const button = {
//   backgroundColor: "#060622",
//   borderRadius: "8px",
//   color: "#ffffff",
//   fontSize: "16px",
//   fontWeight: "bold",
//   textDecoration: "none",
//   textAlign: "center" as const,
//   display: "inline-block",
//   padding: "16px 32px",
//   border: "none",
//   cursor: "pointer",
// };

// const linkText = {
//   color: "#666666",
//   fontSize: "14px",
//   lineHeight: "24px",
//   margin: "16px 0",
//   wordBreak: "break-all" as const,
// };

// const link = {
//   color: "#060622",
//   textDecoration: "underline",
// };

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const infoTitle = {
  color: '#060622',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const list = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
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
