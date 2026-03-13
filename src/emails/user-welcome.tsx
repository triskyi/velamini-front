import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface UserWelcomeEmailProps {
  username?: string;
  company?: string;
  ctaUrl?: string;
}

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://velamini.com";
}

export default function UserWelcomeEmail({
  username = "there",
  company = "Velamini",
  ctaUrl = `${baseUrl()}/Dashboard`,
}: UserWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Welcome to ${company}, ${username}`}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={brandWrap}>
            <Text style={brand}>Velamini</Text>
          </Section>
          <Heading style={heading}>Welcome to {company}</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            Your account is ready. You can now continue setting up your AI workflows, launch
            your organization, and start using the dashboard.
          </Text>
          <Section style={ctaWrap}>
            <Button href={ctaUrl} style={button}>
              Open dashboard
            </Button>
          </Section>
          <Text style={footer}>You are receiving this because you created a Velamini account.</Text>
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

const brandWrap = {
  marginBottom: "18px",
};

const brand = {
  color: "#38AECC",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: ".16em",
  margin: "0",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#D4EEFF",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 14px",
};

const text = {
  color: "#8BBAD6",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 14px",
};

const ctaWrap = {
  margin: "24px 0",
};

const button = {
  backgroundColor: "#38AECC",
  borderRadius: "12px",
  color: "#04131E",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "700",
  padding: "12px 20px",
  textDecoration: "none",
};

const footer = {
  color: "#5B8FA8",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "18px 0 0",
};
