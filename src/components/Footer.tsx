import type { Lang } from '../lib/types';
import { t } from '../lib/i18n';
import './Footer.css';

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-text">{t(lang, 'footer.text')}</p>
        <p className="footer-privacy">{t(lang, 'footer.privacy')}</p>
        <p className="footer-meta">
          <span>{t(lang, 'footer.builtWith')}</span>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <a
            href="https://github.com/andiPangeranm142/perisai"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
