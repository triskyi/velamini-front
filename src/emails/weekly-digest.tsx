import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WeeklyDigestItem {
  title: string;
  summary: string;
  href: string;
}

interface WeeklyDigestEmailProps {
  company?: string;
  items?: WeeklyDigestItem[];
  unsubscribeUrl?: string;
}

const fallbackItems: WeeklyDigestItem[] = [
  {
    title: "Conversation quality trends",
    summary: "See which support flows improved this week and where users still drop off.",
    href: "https://velamini.com/docs",
  },
  {
    title: "Top knowledge gaps",
    summary: "Review the questions your agent could not answer confidently and train the next batch.",
    href: "https://velamini.com/docs",
  },
  {
    title: "Usage snapshot",
    summary: "Monitor message volume, customer satisfaction, and delivery health in one place.",
    href: "https://velamini.com/Dashboard",
  },
];

export default function WeeklyDigestEmail({
  company = "Velamini",
  items = fallbackItems,
  unsubscribeUrl = "https://velamini.com/settings",
}: WeeklyDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Weekly digest from ${company}`}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Text style={eyebrow}>Weekly digest</Text>
          <Text style={heading}>Your week in {company}</Text>
          {items.map((item) => (
            <Section key={item.title} style={itemWrap}>
              <Text style={itemTitle}>{item.title}</Text>
              <Text style={itemText}>
                {item.summary}{" "}
                <Link href={item.href} style={link}>
                  Read more
                </Link>
              </Text>
            </Section>
          ))}
          <Text style={footer}>
            You can unsubscribe or update your email preferences{" "}
            <Link href={unsubscribeUrl} style={link}>
              here
            </Link>
            .
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
  margin: "0 0 18px",
};

const itemWrap = {
  borderTop: "1px solid #1A3045",
  padding: "18px 0",
};

const itemTitle = {
  color: "#D4EEFF",
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const itemText = {
  color: "#8BBAD6",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0",
};

const link = {
  color: "#38AECC",
  textDecoration: "none",
};

const footer = {
  borderTop: "1px solid #1A3045",
  color: "#5B8FA8",
  fontSize: "12px",
  lineHeight: "1.7",
  margin: "8px 0 0",
  paddingTop: "18px",
};
