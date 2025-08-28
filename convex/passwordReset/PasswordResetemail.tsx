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
  userFirstName?: string;
  code: string;

  userEmail?: string;
}

export const ResetPasswordTemplate = ({
  userFirstName,
  userEmail,

  code,
}: ResetPasswordProps) => (
  <Html>
    <Head />
    <Preview>Reset your HospiceConnect account password</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <div style={logoContainer}>
            <div style={logo}>
              <Text style={logoText}>HospiceConnect</Text>
            </div>
          </div>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={text}>Hi {userFirstName || 'there'},</Text>

          <Text style={text}>
            We received a request to reset the password for your HospiceConnect
            account associated with ${userEmail}.
          </Text>

          <Text style={text}>
            If you made this request, use the code below to reset your password:
          </Text>

          {/* CTA Button */}
          <Heading className="text-xl font-bold mb-4">
            Reset your password
          </Heading>
          <Text className="text-sm">
            Please enter the following code on the password reset page.
          </Text>
          <Section className="text-center">
            <Text className="font-semibold">Reset code</Text>
            <Text className="font-bold text-4xl">{code}</Text>
          </Section>

          {/* Tips */}
          <Section style={tipsBox}>
            <Text style={tipsTitle}>💡 Password Tips</Text>
            <Text style={tipsText}>
              When creating your new password, make sure it:
            </Text>
            <ul style={list}>
              <li style={listItem}>Is at least 8 characters long</li>
              <li style={listItem}>
                Contains both uppercase and lowercase letters
              </li>
              <li style={listItem}>Includes at least one number</li>
              <li style={listItem}>Has at least one special character</li>
              <li style={listItem}>Is unique and not used on other accounts</li>
            </ul>
          </Section>

          <Text style={text}>
            If you continue to have trouble accessing your account, please
            don&apos;t hesitate to contact our support team.
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
            This email was sent because a password reset was requested for your
            HospiceConnect account.
          </Text>
          <Text style={footerText}>
            If you did not make this request, you can safely ignore this email.
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

export default ResetPasswordTemplate;

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
//
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

// const securityBox = {
//   backgroundColor: "#fff3cd",
//   border: "1px solid #ffeaa7",
//   borderRadius: "8px",
//   padding: "24px",
//   margin: "32px 0",
// };

// const securityTitle = {
//   color: "#856404",
//   fontSize: "18px",
//   fontWeight: "bold",
//   margin: "0 0 12px 0",
// };

// const securityText = {
//   color: "#856404",
//   fontSize: "14px",
//   lineHeight: "22px",
//   margin: "0 0 12px 0",
// };

const tipsBox = {
  backgroundColor: '#e7f3ff',
  border: '1px solid #b3d9ff',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const tipsTitle = {
  color: '#0056b3',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const tipsText = {
  color: '#0056b3',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const list = {
  color: '#0056b3',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '6px 0',
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
