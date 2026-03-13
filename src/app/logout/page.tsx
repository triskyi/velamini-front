"use client";

import { signOut } from "@/lib/auth-client";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/auth/signin?loggedOut=1" });
  }, []);

  return (
    <>
      <style>{`
        :root {
          --c-bg: #EFF7FF;
          --c-surface: #FFFFFF;
          --c-border: #C5DCF2;
          --c-text: #0B1E2E;
          --c-muted: #6B90AE;
          --c-accent: #29A9D4;
          --c-accent-soft: #DDF1FA;
        }
        [data-mode="dark"] {
          --c-bg: #081420;
          --c-surface: #0F1E2D;
          --c-border: #1A3045;
          --c-text: #C8E8F8;
          --c-muted: #3D6580;
          --c-accent: #38AECC;
          --c-accent-soft: #0C2535;
        }

        .lo-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--c-bg);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: background .3s;
        }

        .lo-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 40px 48px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(10, 40, 70, .1);
          text-align: center;
          animation: loFade .4s ease;
        }
        @keyframes loFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Spinner ring */
        .lo-spinner-wrap {
          position: relative;
          width: 56px;
          height: 56px;
        }
        .lo-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 3px solid var(--c-border);
          border-top-color: var(--c-accent);
          animation: loSpin .8s linear infinite;
        }
        @keyframes loSpin {
          to { transform: rotate(360deg); }
        }
        /* Logo in center of spinner */
        .lo-logo {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lo-logo img {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          object-fit: cover;
        }

        .lo-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--c-text);
          line-height: 1.3;
        }

        .lo-sub {
          font-size: .8rem;
          color: var(--c-muted);
          margin-top: -10px;
        }

        /* Animated dots */
        .lo-dots span {
          animation: loDot 1.2s infinite;
          opacity: 0;
        }
        .lo-dots span:nth-child(2) { animation-delay: .2s; }
        .lo-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes loDot {
          0%, 80%, 100% { opacity: 0; }
          40%            { opacity: 1; }
        }
      `}</style>

      <div className="lo-page">
        <div className="lo-card">
          <div className="lo-spinner-wrap">
            <div className="lo-ring" />
            <div className="lo-logo">
              <img src="/logo.png" alt="Velamini" />
            </div>
          </div>

          <div>
            <div className="lo-title">
              Signing out<span className="lo-dots"><span>.</span><span>.</span><span>.</span></span>
            </div>
            <div className="lo-sub">You'll be redirected shortly</div>
          </div>
        </div>
      </div>
    </>
  );
}
