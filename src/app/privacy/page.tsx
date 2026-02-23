export const metadata = {
  title: 'Privacy Policy - Velamini',
  description: 'Velamini Privacy Policy',
};

import Timeline from '@/components/Timeline';
import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
  const items = [
    {
      title: 'Overview',
      content: (
        <p>This Privacy Policy explains how Velamini collects, uses, and discloses personal information when you use our Service.</p>
      ),
    },
    {
      title: 'Information We Collect',
      content: (
        <p>We collect information you provide (account details, profile information) and non-personal usage data (analytics, logs). We may also collect data from third-party providers when you sign in with them.</p>
      ),
    },
    {
      title: 'How We Use Information',
      content: (
        <p>We use information to provide, maintain, and improve the Service; to personalize your experience; and to communicate with you.</p>
      ),
    },
    {
      title: 'Cookies & Tracking',
      content: (<p>We use cookies and similar technologies for authentication, analytics, and preferences.</p>),
    },
    {
      title: 'Data Security',
      content: (
        <p>We take reasonable measures to protect information, but no system is completely secure. If you believe your account has been compromised, contact <a className="underline text-primary" href="mailto:privacy@velamini.example">privacy@velamini.example</a>.</p>
      ),
    },
    {
      title: 'Your Rights',
      content: (
        <p>Depending on your jurisdiction, you may have rights to access, correct, or delete your personal information. Contact us to exercise those rights.</p>
      ),
    },
  ];

  return (
    <>
      <Navbar />
        <main className="w-full bg-base-100 text-base-content font-sans leading-relaxed flex items-center justify-center md:pt-24">
        <div className="w-full max-w-3xl px-6 py-12 mt-8 md:mt-0 md:py-16 bg-base-200/60 dark:bg-base-300/40 rounded-xl shadow-lg">
          <header className="mb-4 md:mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">Privacy Policy</h1>
            <p className="text-sm text-base-content/70 mt-2">Last updated: February 23, 2026</p>
          </header>

          <div className="mt-4">
            <Timeline items={items} />
          </div>
        </div>
      </main>
    </>
  );
}
