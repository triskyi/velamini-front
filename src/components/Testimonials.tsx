'use client';

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Muthoni",
    role: "CEO",
    company: "TechStart Kenya",
    content: "Velamini transformed how we handle customer support. Our AI agent handles 80% of queries automatically, and customers love the instant responses.",
    rating: 5,
  },
  {
    name: "David Okonkwo",
    role: "Founder",
    company: "GreenEnergy Africa",
    content: "We created an AI twin of our lead engineer. Now clients get technical answers 24/7, even outside business hours. Game changer for our sales.",
    rating: 5,
  },
  {
    name: "Amara Diallo",
    role: "Marketing Director",
    company: "RetailHub Rwanda",
    content: "The embed widget increased our lead capture by 40%. Visitors chat with our AI and we get qualified leads while we sleep.",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "CTO",
    company: "FinTech Solutions",
    content: "Integration was seamless. We used the REST API to connect to our existing CRM. Our support team productivity doubled in the first month.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section style={{
      padding: "6rem 0",
      background: "var(--bg)",
    }}>
      <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 20,
            background: "color-mix(in srgb, var(--org-c) 12%, transparent)",
            color: "var(--org-c)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            <Star size={12} />
            Testimonials
          </div>
          
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
            color: "var(--fg)",
          }}>
            Loved by <span style={{ color: "var(--org-c)", fontStyle: "italic" }}>businesses</span> across Africa
          </h2>
          
          <p style={{
            fontSize: "1rem",
            color: "var(--muted)",
            maxWidth: 500,
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Join hundreds of companies already using Velamini to scale their customer engagement.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}>
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)",
                borderRadius: 20,
                border: "1px solid var(--border2)",
                padding: 28,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Quote Icon */}
              <div style={{
                position: "absolute",
                top: 16,
                right: 20,
                opacity: 0.1,
              }}>
                <Quote size={48} style={{ color: "var(--accent)" }} />
              </div>

              {/* Stars */}
              <div style={{
                display: "flex",
                gap: 4,
                marginBottom: 16,
              }}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              {/* Content */}
              <p style={{
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--fg)",
                marginBottom: 20,
                fontStyle: "italic",
              }}>
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--org-c))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--fg)",
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                  }}>
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(2rem, 8vw, 5rem)",
            marginTop: "4rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "500+", label: "Businesses" },
            { value: "50K+", label: "AI Conversations" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "Rating" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 800,
                color: "var(--fg)",
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
