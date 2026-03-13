import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";

type InfoSection = {
  title: string;
  paragraphs: string[];
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: InfoSection[];
  primaryCta?: {
    label: string;
    href: string;
  };
  hideFooter?: boolean;
};

export default function InfoPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
  primaryCta,
  hideFooter = false,
}: InfoPageProps) {
  return (
    <>
      <style>{`
        .ip-wrap {
          min-height: 100dvh;
          background: #060e18;
          color: #d4eeff;
          padding-top: 3.75rem;
        }
        [data-mode="light"] .ip-wrap {
          background: #e8f4fd;
          color: #091828;
        }
        .ip-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 3.5rem 1.25rem 5rem;
        }
        .ip-head {
          margin-bottom: 2rem;
        }
        .ip-eyebrow {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #38aecc;
          margin-bottom: 0.6rem;
        }
        .ip-title {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .ip-desc {
          margin: 0.8rem 0 0;
          color: #8bbad6;
          font-size: 0.95rem;
          line-height: 1.75;
        }
        [data-mode="light"] .ip-desc {
          color: #527a96;
        }
        .ip-updated {
          margin-top: 0.8rem;
          font-size: 0.75rem;
          color: #5b8fa8;
        }
        [data-mode="light"] .ip-updated {
          color: #527a96;
        }
        .ip-card {
          border: 1px solid #1a3448;
          background: #0d1e2e;
          border-radius: 16px;
          padding: 1.1rem;
        }
        [data-mode="light"] .ip-card {
          border-color: #bdd9f0;
          background: #ffffff;
        }
        .ip-section + .ip-section {
          border-top: 1px solid #1a3448;
          margin-top: 1rem;
          padding-top: 1rem;
        }
        [data-mode="light"] .ip-section + .ip-section {
          border-color: #d6ecfa;
        }
        .ip-section h2 {
          margin: 0 0 0.55rem;
          font-size: 1.02rem;
          color: #c0dcf0;
        }
        [data-mode="light"] .ip-section h2 {
          color: #1c3a52;
        }
        .ip-section p {
          margin: 0 0 0.6rem;
          color: #8bbad6;
          line-height: 1.7;
          font-size: 0.86rem;
        }
        [data-mode="light"] .ip-section p {
          color: #527a96;
        }
        .ip-section p:last-child {
          margin-bottom: 0;
        }
        .ip-cta {
          margin-top: 1.25rem;
        }
        .ip-cta a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.7rem 1.1rem;
          border-radius: 10px;
          border: 1px solid #38aecc;
          color: #38aecc;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .ip-cta a:hover {
          background: rgba(56, 174, 204, 0.12);
        }
      `}</style>

      <div className="ip-wrap">
        <Navbar />
        <main className="ip-main">
          <header className="ip-head">
            <span className="ip-eyebrow">{eyebrow}</span>
            <h1 className="ip-title">{title}</h1>
            <p className="ip-desc">{description}</p>
            <div className="ip-updated">Last updated: {updatedAt}</div>
          </header>

          <section className="ip-card">
            {sections.map((section) => (
              <article className="ip-section" key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            ))}
          </section>

          {primaryCta && (
            <div className="ip-cta">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </div>
          )}
        </main>
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}
