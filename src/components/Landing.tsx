import type { Lang } from '../lib/types';
import type { DeviceAvailability } from '../lib/hybrid';
import {
  HERO_STATS,
  HOW_STEPS,
  HYBRID_CLOUD_POINTS,
  HYBRID_DEVICE_POINTS,
  t,
} from '../lib/i18n';
import './Landing.css';

interface LandingProps {
  lang: Lang;
  mode: 'live' | 'demo';
  deviceStatus: DeviceAvailability;
  online: boolean;
  onStartCheck: () => void;
  onOpenLibrary: () => void;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5 20 6v6c0 4.8-3.2 8.4-8 9.5C7.2 20.4 4 16.8 4 12V6l8-3.5Z" />
      <path d="m8.8 11.8 2.3 2.3 4.1-4.3" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.5 19a4.5 4.5 0 0 0 .4-8.98 6 6 0 0 0-11.7 1.6A4 4 0 0 0 7 19h10.5Z" />
    </svg>
  );
}

function EngineStatus({
  lang,
  deviceStatus,
  online,
}: {
  lang: Lang;
  deviceStatus: DeviceAvailability;
  online: boolean;
}) {
  return (
    <div className="landing-engine-status" role="status">
      {!online && (
        <p className="landing-offline">{t(lang, 'offline.banner')}</p>
      )}
      {deviceStatus === 'available' && (
        <span className="badge badge-device">
          <span className="dot" aria-hidden="true" />
          {t(lang, 'route.badgeDevice')}
        </span>
      )}
      {deviceStatus === 'downloading' && (
        <span className="landing-engine-note">
          {t(lang, 'landing.deviceDownloading')}
        </span>
      )}
      {deviceStatus === 'downloadable' && (
        <span className="landing-engine-note">
          {t(lang, 'landing.deviceDownload')}
        </span>
      )}
      {(deviceStatus === 'unsupported' || deviceStatus === 'unavailable') && (
        <span className="landing-engine-note">
          {t(lang, 'landing.deviceCloud')}
        </span>
      )}
    </div>
  );
}

export default function Landing({
  lang,
  mode,
  deviceStatus,
  online,
  onStartCheck,
  onOpenLibrary,
}: LandingProps) {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero" aria-labelledby="landing-hero-title">
        <div className="container landing-hero-inner">
          <span className="badge badge-device landing-hero-badge">
            <span className="dot" aria-hidden="true" />
            {t(lang, 'hero.badge')}
          </span>
          <h1 id="landing-hero-title" className="landing-hero-title">
            {t(lang, 'hero.title')}{' '}
            <span className="landing-hero-accent">
              {t(lang, 'hero.titleAccent')}
            </span>
          </h1>
          <p className="landing-hero-subtitle">{t(lang, 'hero.subtitle')}</p>
          <div className="landing-hero-cta">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onStartCheck}
            >
              {t(lang, 'hero.ctaCheck')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenLibrary}
            >
              {t(lang, 'hero.ctaLibrary')}
            </button>
          </div>
          <EngineStatus
            lang={lang}
            deviceStatus={deviceStatus}
            online={online}
          />
          <dl className="landing-stats">
            {HERO_STATS.map((stat) => (
              <div key={stat.label.en} className="landing-stat">
                <dt className="landing-stat-label">{stat.label[lang]}</dt>
                <dd className="landing-stat-value">{stat.value[lang]}</dd>
              </div>
            ))}
          </dl>
          <p className="landing-trust">{t(lang, 'hero.trust')}</p>
          {mode === 'demo' && (
            <p className="landing-demo-note small muted">
              {t(lang, 'route.mockNote')}
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section" aria-labelledby="landing-how-title">
        <div className="container">
          <h2 id="landing-how-title" className="landing-section-title">
            {t(lang, 'how.title')}
          </h2>
          <p className="landing-section-subtitle">
            {t(lang, 'how.subtitle')}
          </p>
          <ol className="landing-steps">
            {HOW_STEPS.map((step, i) => (
              <li key={step.title.en} className="card landing-step">
                <span className="landing-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="landing-step-title">{step.title[lang]}</h3>
                <p className="landing-step-desc">{step.desc[lang]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Hybrid engines */}
      <section
        className="landing-section landing-hybrid"
        aria-labelledby="landing-hybrid-title"
      >
        <div className="container">
          <h2 id="landing-hybrid-title" className="landing-section-title">
            {t(lang, 'hybrid.title')}
          </h2>
          <p className="landing-section-subtitle">
            {t(lang, 'hybrid.subtitle')}
          </p>
          <div className="landing-hybrid-grid">
            <article className="card landing-engine-card">
              <div className="landing-engine-icon landing-engine-icon-device">
                <ShieldIcon />
              </div>
              <h3>{t(lang, 'hybrid.deviceTitle')}</h3>
              <p className="muted">{t(lang, 'hybrid.deviceDesc')}</p>
              <ul className="landing-points">
                {HYBRID_DEVICE_POINTS.map((point) => (
                  <li key={point.en}>
                    <CheckIcon />
                    <span>{point[lang]}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="card landing-engine-card">
              <div className="landing-engine-icon landing-engine-icon-cloud">
                <CloudIcon />
              </div>
              <h3>{t(lang, 'hybrid.cloudTitle')}</h3>
              <p className="muted">{t(lang, 'hybrid.cloudDesc')}</p>
              <ul className="landing-points">
                {HYBRID_CLOUD_POINTS.map((point) => (
                  <li key={point.en}>
                    <CheckIcon />
                    <span>{point[lang]}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <p className="landing-hybrid-note">{t(lang, 'hybrid.note')}</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-final" aria-labelledby="landing-final-title">
        <div className="container landing-final-inner">
          <h2 id="landing-final-title" className="landing-final-title">
            {t(lang, 'hero.title')}{' '}
            <span className="landing-hero-accent">
              {t(lang, 'hero.titleAccent')}
            </span>
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStartCheck}
          >
            {t(lang, 'hero.ctaCheck')}
          </button>
        </div>
      </section>
    </div>
  );
}
