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

interface UserInviteEmailProps {
  username?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  inviteLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
  company?: string;
}

export default function UserInviteEmail({
  username = "there",
  invitedByUsername = "a teammate",
  invitedByEmail = "team@velamini.com",
  teamName = "Velamini Team",
  inviteLink = "https://velamini.com",
  inviteFromIp = "unknown",
  inviteFromLocation = "unknown",
  company = "Velamini",
}: UserInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Join ${teamName} on ${company}`}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Text style={eyebrow}>Team invite</Text>
          <Text style={heading}>Join {teamName}</Text>
          <Text style={text}>Hello {username},</Text>
          <Text style={text}>
            <strong>{invitedByUsername}</strong> (
            <Link href={`mailto:${invitedByEmail}`} style={link}>
              {invitedByEmail}
            </Link>
            ) invited you to join <strong>{teamName}</strong> on {company}.
          </Text>
          <Section style={ctaWrap}>
            <Button href={inviteLink} style={button}>
              Accept invitation
            </Button>
          </Section>
          <Text style={text}>
            Or copy this link into your browser:
            <br />
            <Link href={inviteLink} style={link}>
              {inviteLink}
            </Link>
          </Text>
          <Text style={meta}>
            Sent from IP {inviteFromIp} in {inviteFromLocation}. If you were not expecting this invite,
            you can ignore this email.
          </Text>
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

const ctaWrap = {
  margin: "22px 0",
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

const link = {
  color: "#38AECC",
  textDecoration: "none",
};

const meta = {
  borderTop: "1px solid #1A3045",
  color: "#5B8FA8",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "22px 0 0",
  paddingTop: "18px",
};
