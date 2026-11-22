import type { Lang } from '../lib/types';
import { t } from '../lib/i18n';
import { SCAM_LIBRARY } from '../lib/patterns';
import './PatternLibrary.css';

interface PatternLibraryProps {
  lang: Lang;
  onTryExample: (text: string) => void;
}

/** Strips the surrounding double-quote characters from an example string. */
function stripQuotes(text: string): string {
  return text.replace(/^"+|"+$/g, '');
}

function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4.5L18 13H5" />
    </svg>
  );
}

export default function PatternLibrary({ lang, onTryExample }: PatternLibraryProps) {
  return (
    <div className="library">
      <div className="container">
        <header className="library-header">
          <h1>{t(lang, 'library.title')}</h1>
          <p className="library-subtitle muted">{t(lang, 'library.subtitle')}</p>
        </header>

        <div className="library-grid">
          {SCAM_LIBRARY.map((pattern) => (
            <article key={pattern.id} className="card library-card">
              <h2 className="library-card-title">{pattern.title[lang]}</h2>
              <p className="library-card-desc">{pattern.description[lang]}</p>

              <h3 className="library-label">
                <FlagIcon />
                {t(lang, 'library.redFlags')}
              </h3>
              <ul className="library-flags">
                {pattern.redFlags[lang].map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>

              <h3 className="library-label">{t(lang, 'library.example')}</h3>
              <blockquote className="library-example">
                {pattern.example[lang]}
              </blockquote>

              <p className="library-action">
                <strong>{t(lang, 'library.action')}: </strong>
                {pattern.action[lang]}
              </p>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  onTryExample(stripQuotes(pattern.example[lang]))
                }
              >
                {t(lang, 'library.tryInChecker')}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
