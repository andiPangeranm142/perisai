import { useEffect, useRef, useState } from 'react';
import type { DeepAnalysisResult, Lang, RouteInfo } from '../lib/types';
import { t } from '../lib/i18n';
import './DeepAnalysisCard.css';

export interface DeepAnalysisCardProps {
  lang: Lang;
  analysis: DeepAnalysisResult;
  route: RouteInfo;
}

export default function DeepAnalysisCard({
  lang,
  analysis,
  route,
}: DeepAnalysisCardProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.safeReply);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — still show feedback.
    }
    setCopied(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const isMock = route.route === 'mock';

  return (
    <section className="card deep-card" aria-label={t(lang, 'result.deepTitle')}>
      <div className="deep-header">
        <h2 className="deep-title">{t(lang, 'result.deepTitle')}</h2>
        <span className={`badge ${isMock ? 'badge-neutral' : 'badge-cloud'}`}>
          {t(lang, isMock ? 'route.badgeMock' : 'route.badgeCloud')}
        </span>
      </div>

      <dl className="deep-meta">
        <div className="deep-meta-row">
          <dt>{t(lang, 'result.scamType')}</dt>
          <dd>
            <strong>{analysis.scamType}</strong>
          </dd>
        </div>
        <div className="deep-meta-row">
          <dt>{t(lang, 'result.verdict')}</dt>
          <dd>{analysis.verdict}</dd>
        </div>
      </dl>

      {analysis.tactics.length > 0 && (
        <>
          <h3 className="deep-section-title">{t(lang, 'result.tactics')}</h3>
          <ol className="deep-tactics">
            {analysis.tactics.map((tactic, i) => (
              <li key={`${tactic.tactic}-${i}`} className="deep-tactic">
                <h4 className="deep-tactic-name">{tactic.tactic}</h4>
                <blockquote className="deep-tactic-evidence">
                  {tactic.evidence}
                </blockquote>
                <p className="deep-tactic-explanation">{tactic.explanation}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {analysis.riskFactors.length > 0 && (
        <>
          <h3 className="deep-section-title">
            {t(lang, 'result.riskFactors')}
          </h3>
          <ul className="deep-risk-factors">
            {analysis.riskFactors.map((factor, i) => (
              <li key={`${factor}-${i}`}>{factor}</li>
            ))}
          </ul>
        </>
      )}

      {analysis.safeSteps.length > 0 && (
        <>
          <h3 className="deep-section-title">{t(lang, 'result.safeSteps')}</h3>
          <ol className="deep-safe-steps">
            {analysis.safeSteps.map((step, i) => (
              <li key={`${step}-${i}`}>{step}</li>
            ))}
          </ol>
        </>
      )}

      <div className="deep-reply">
        <h3 className="deep-section-title">{t(lang, 'result.safeReply')}</h3>
        <p className="deep-reply-text">{analysis.safeReply}</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCopy}
          aria-live="polite"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? t(lang, 'result.copied') : t(lang, 'result.copyReply')}
        </button>
      </div>
    </section>
  );
}
