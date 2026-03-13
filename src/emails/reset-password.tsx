import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
  supportUrl?: string;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://velamini.com";
}

export default function ResetPasswordEmail({
  userFirstname = "there",
  resetPasswordLink = `${appUrl()}/auth/reset-password`,
  supportUrl = `${appUrl()}/contact`,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Velamini password</Preview>
      <Body style={main}>
        <Container style={card}>
          <Text style={eyebrow}>Password reset</Text>
          <Text style={heading}>Reset your password</Text>
          <Section>
            <Text style={text}>Hi {userFirstname},</Text>
            <Text style={text}>
              We received a request to reset your Velamini password. If this was you, use the
              button below to choose a new password.
            </Text>
            <Button style={button} href={resetPasswordLink}>
              Reset password
            </Button>
            <Text style={text}>
              If you did not request this, you can ignore this message. Your password will stay the same.
            </Text>
            <Text style={text}>
              Need help?{" "}
              <Link style={link} href={supportUrl}>
                Contact support
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#081420",
  fontFamily: "Arial, sans-serif",
  padding: "32px 16px",
};

const card = {
  backgroundColor: "#0F1E2D",
  border: "1px solid #1A3045",
  borderRadius: "22px",
  margin: "0 auto",
  maxWidth: "520px",
  padding: "36px",
};

const eyebrow = {
  color: "#38AECC",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: ".16em",
  margin: "0 0 10px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#D4EEFF",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 16px",
};

const text = {
  color: "#8BBAD6",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 14px",
};

const button = {
  backgroundColor: "#38AECC",
  borderRadius: "12px",
  color: "#04131E",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700",
  margin: "10px 0 20px",
  padding: "12px 20px",
  textDecoration: "none",
};

const link = {
  color: "#38AECC",
  textDecoration: "none",
};
