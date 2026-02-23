export const metadata = {
  title: 'Terms of Service - Velamini',
  description: 'Velamini Terms of Service',
};

import Timeline from '@/components/Timeline';
import Navbar from '@/components/Navbar';

export default function TermsPage() {
  const items = [
    {
      title: 'Acceptance',
      content: (
        <p>By using Velamini (the “Service”) you agree to these Terms of Service. Please read them carefully. If you do not agree, do not use the Service.</p>
      ),
    },
    {
      title: 'Use of Service',
      content: (
        <p>You may use the Service only in compliance with these terms and applicable laws. You are responsible for your account and any activity that occurs under your account.</p>
      ),
    },
    {
      title: 'Accounts & Security',
      content: (
        <p>You must provide accurate account information and keep your credentials secure. You are responsible for all activity under your account.</p>
      ),
    },
    {
      title: 'Content',
      content: (
        <p>You retain ownership of the content you submit. By submitting content you grant Velamini a license to use it as needed to provide the Service.</p>
      ),
    },
    {
      title: 'Termination',
      content: (
        <p>We may suspend or terminate accounts for violations of these Terms or for other reasons permitted by law.</p>
      ),
    },
    {
      title: 'Changes',
      content: (
        <p>We may update these Terms from time to time. Changes will be posted on this page with an updated effective date.</p>
      ),
    },
    {
      title: 'Contact',
      content: (
        <p>For questions about these Terms, contact us at <a className="underline text-primary" href="mailto:support@velamini.example">support@velamini.example</a>.</p>
      ),
    },
  ];

  return (
    <>
      <Navbar />
        <main className="w-full bg-base-100 text-base-content font-sans leading-relaxed flex items-center justify-center md:pt-24">
        <div className="w-full max-w-3xl px-6 py-12 mt-20  bg-base-200/60 dark:bg-base-300/40 rounded-xl shadow-lg">
          <header className="mb-4 md:mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold">Terms of Service</h1>
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
