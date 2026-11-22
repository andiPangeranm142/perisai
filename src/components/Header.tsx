import type { Lang, View } from '../lib/types';
import { t } from '../lib/i18n';
import './Header.css';

interface HeaderProps {
  lang: Lang;
  view: View;
  onNavigate: (view: View) => void;
  onToggleLang: () => void;
  mode: 'live' | 'demo';
}

const NAV_ITEMS: { view: View; key: string }[] = [
  { view: 'home', key: 'nav.home' },
  { view: 'check', key: 'nav.checker' },
  { view: 'library', key: 'nav.library' },
  { view: 'history', key: 'nav.history' },
];

function ShieldIcon() {
  return (
    <svg
      className="header-logo-icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
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

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export default function Header({
  lang,
  view,
  onNavigate,
  onToggleLang,
  mode,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <button
          type="button"
          className="header-brand"
          onClick={() => onNavigate('home')}
          aria-label="Perisai — home"
        >
          <span className="header-logo">
            <ShieldIcon />
          </span>
          <span className="header-brand-text">
            <span className="header-wordmark">Perisai</span>
            <span className="header-tagline">{t(lang, 'brand.tagline')}</span>
          </span>
        </button>

        <nav className="header-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              className={`header-nav-btn${view === item.view ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.view)}
              aria-current={view === item.view ? 'page' : undefined}
            >
              {t(lang, item.key)}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <span
            className={`badge ${mode === 'live' ? 'badge-safe' : 'badge-neutral'}`}
          >
            <span className="dot" aria-hidden="true" />
            {t(lang, mode === 'live' ? 'mode.live' : 'mode.demo')}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm header-lang-btn"
            onClick={onToggleLang}
            aria-label={t(lang, 'lang.toggle')}
          >
            <GlobeIcon />
            <span>{t(lang, 'lang.toggle')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
