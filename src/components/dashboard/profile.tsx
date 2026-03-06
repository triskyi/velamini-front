"use client";

import { CheckCircle, Mail, MapPin, ExternalLink, Globe } from "lucide-react";

interface ProfileViewProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  knowledgeBase?: any;
}

export default function ProfileView({ user, knowledgeBase }: ProfileViewProps) {
  const fullName = knowledgeBase?.fullName || user?.name || "Your Name";
  const email    = user?.email || "email@example.com";
  const location = knowledgeBase?.currentLocation || "";
  const bio      = knowledgeBase?.bio || "No bio yet. Complete your training to populate this section.";
  const cover    = knowledgeBase?.coverImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop";

  const socialLinks = (() => {
    try { return knowledgeBase?.socialLinks ? JSON.parse(knowledgeBase.socialLinks) : {}; } catch { return {}; }
  })();

  const initial = (fullName?.[0] || "U").toUpperCase();

  return (
    <>
      <style>{`
        .pv { padding: 16px 14px 48px; background: var(--c-bg); min-height: 100%; transition: background .3s; }
        @media(min-width:600px){ .pv { padding: 24px 24px 56px; } }
        @media(min-width:1024px){ .pv { padding: 32px 36px 64px; } }
        .pv-inner { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }

        /* Cover card */
        .pv-card {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-sm);
          transition: background .3s, border-color .3s;
        }

        .pv-cover {
          width: 100%; height: 160px; object-fit: cover; display: block;
          position: relative;
        }
        @media(min-width:600px){ .pv-cover-wrap { height: 200px; } }
        .pv-cover-wrap {
          width: 100%; height: 160px; overflow: hidden; position: relative;
        }
        .pv-cover-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pv-cover-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,.08), rgba(0,0,0,.45));
        }

        .pv-profile-row {
          display: flex; align-items: flex-end; gap: 16px;
          padding: 0 20px 20px; margin-top: -40px; position: relative; z-index: 1;
          flex-wrap: wrap;
        }
        @media(min-width:600px){ .pv-profile-row { padding: 0 28px 24px; margin-top: -50px; } }

        .pv-av-wrap {
          width: 80px; height: 80px; border-radius: 16px; flex-shrink: 0;
          border: 3px solid var(--c-surface); box-shadow: var(--shadow-sm);
          overflow: hidden; background: var(--c-surface-2);
        }
        @media(min-width:600px){ .pv-av-wrap { width: 96px; height: 96px; } }
        .pv-av-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pv-av-initial {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--c-accent), #7DD3FC);
          color: #fff; font-family: 'DM Serif Display', serif;
          font-size: 2rem; font-weight: 400;
        }

        .pv-name-block { flex: 1; min-width: 0; padding-top: 44px; }
        .pv-name {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.3rem, 4vw, 1.9rem); font-weight: 400;
          color: var(--c-text); letter-spacing: -.02em; margin-bottom: 6px;
        }
        .pv-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .pv-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: .68rem; font-weight: 700;
        }
        .pv-tag--main {
          background: var(--c-accent-soft); color: var(--c-accent);
          border: 1px solid color-mix(in srgb, var(--c-accent) 28%, transparent);
        }
        .pv-tag--verified {
          background: rgba(34,197,94,.1); color: #16A34A;
          border: 1px solid rgba(34,197,94,.25);
        }
        .pv-tag svg { width: 11px; height: 11px; }

        /* Content grid */
        .pv-grid { display: grid; gap: 14px; }
        @media(min-width:700px){ .pv-grid { grid-template-columns: 1fr 320px; } }

        .pv-panel {
          background: var(--c-surface); border: 1px solid var(--c-border);
          border-radius: 14px; padding: 20px 22px;
          box-shadow: var(--shadow-sm); transition: background .3s, border-color .3s;
        }
        .pv-panel-title {
          font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--c-text);
          margin-bottom: 12px; display: flex; align-items: center; gap: 7px;
        }
        .pv-panel-title svg { color: var(--c-accent); width: 14px; height: 14px; }
        .pv-bio { font-size: .875rem; line-height: 1.75; color: var(--c-muted); }

        /* Contact items */
        .pv-contact { display: flex; flex-direction: column; gap: 10px; }
        .pv-contact-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 11px;
          background: var(--c-surface-2); border: 1px solid var(--c-border);
          transition: background .3s, border-color .3s;
        }
        .pv-cic {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--c-accent-soft); color: var(--c-accent);
        }
        .pv-cic svg { width: 13px; height: 13px; }
        .pv-clbl { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--c-muted); margin-bottom: 1px; }
        .pv-cval { font-size: .8rem; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .pv-website {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 11px;
          background: var(--c-accent); color: #fff;
          font-size: .8rem; font-weight: 600; text-decoration: none;
          transition: background .14s, transform .14s; margin-top: 4px;
        }
        .pv-website:hover { background: var(--c-accent-dim); transform: translateY(-1px); }
        .pv-website svg { width: 13px; height: 13px; }
        .pv-website-txt { flex: 1; }
      `}</style>

      <div className="pv">
        <div className="pv-inner">

          {/* Profile card with cover */}
          <div className="pv-card">
            <div className="pv-cover-wrap">
              <img src={cover} alt="Cover" />
            </div>
            <div className="pv-profile-row">
              <div className="pv-av-wrap">
                {user?.image
                  ? <img src={user.image} alt={fullName} />
                  : <div className="pv-av-initial">{initial}</div>
                }
              </div>
              <div className="pv-name-block">
                <h1 className="pv-name">{fullName}</h1>
                <div className="pv-tags">
                  <span className="pv-tag pv-tag--main">Virtual Self</span>
                  <span className="pv-tag pv-tag--verified"><CheckCircle /> Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pv-grid">
            <div className="pv-panel">
              <div className="pv-panel-title">About Me</div>
              <p className="pv-bio">{bio}</p>
            </div>

            <div className="pv-panel">
              <div className="pv-panel-title">Contact</div>
              <div className="pv-contact">
                <div className="pv-contact-item">
                  <div className="pv-cic"><Mail /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pv-clbl">Email</div>
                    <div className="pv-cval" title={email}>{email}</div>
                  </div>
                </div>

                {location && (
                  <div className="pv-contact-item">
                    <div className="pv-cic"><MapPin /></div>
                    <div>
                      <div className="pv-clbl">Location</div>
                      <div className="pv-cval">{location}</div>
                    </div>
                  </div>
                )}

                {socialLinks?.website && (
                  <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="pv-website">
                    <Globe size={13} />
                    <span className="pv-website-txt">Visit Website</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}