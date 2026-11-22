import type {
  DeepAnalysisResult,
  Lang,
  RiskLevel,
  RouteInfo,
  TriageResult as TriageResultData,
} from '../lib/types';
import { t } from '../lib/i18n';
import { patternLabel } from '../lib/patterns';
import './TriageResult.css';

export interface TriageResultProps {
  lang: Lang;
  triage: TriageResultData;
  route: RouteInfo;
  deepOffered: boolean;
  deepLoading: boolean;
  onDeepAnalysis: () => void;
  deep: DeepAnalysisResult | null;
  storedWhere: 'firestore' | 'local' | null;
}

const RISK_BADGE: Record<RiskLevel, string> = {
  safe: 'badge-safe',
  low: 'badge-low',
  medium: 'badge-med',
  high: 'badge-high',
};

const RISK_KEY: Record<RiskLevel, string> = {
  safe: 'result.riskSafe',
  low: 'result.riskLow',
  medium: 'result.riskMedium',
  high: 'result.riskHigh',
};

function routeBadgeClass(route: RouteInfo['route']): string {
  if (route === 'on-device') return 'badge-device';
  if (route === 'cloud') return 'badge-cloud';
  return 'badge-neutral';
}

function routeBadgeKey(route: RouteInfo['route']): string {
  if (route === 'on-device') return 'route.badgeDevice';
  if (route === 'cloud') return 'route.badgeCloud';
  return 'route.badgeMock';
}

export default function TriageResult({
  lang,
  triage,
  route,
  deepOffered,
  deepLoading,
  onDeepAnalysis,
  deep,
  storedWhere,
}: TriageResultProps) {
  const confidence = Math.max(0, Math.min(100, Math.round(triage.confidence)));

  return (
    <section
      className="card triage-result"
      aria-live="polite"
      aria-label={t(lang, 'result.title')}
    >
      <div className="triage-header">
        <span className={`badge ${RISK_BADGE[triage.risk]}`}>
          {t(lang, RISK_KEY[triage.risk])}
        </span>
        <span className={`badge ${routeBadgeClass(route.route)}`}>
          {t(lang, routeBadgeKey(route.route))}
        </span>
      </div>

      <div className="triage-confidence">
        <div className="triage-confidence-row">
          <span className="triage-confidence-label small">
            {t(lang, 'result.confidence')}
          </span>
          <span className="triage-confidence-value small">{confidence}%</span>
        </div>
        <div
          className="triage-confidence-bar"
          role="progressbar"
          aria-valuenow={confidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t(lang, 'result.confidence')}
        >
          <div
            className={`triage-confidence-fill triage-confidence-fill--${triage.risk}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <h3 className="triage-section-title">{t(lang, 'result.summary')}</h3>
      <p className="triage-summary">{triage.summary}</p>

      <h3 className="triage-section-title">{t(lang, 'result.patterns')}</h3>
      {triage.patterns.length === 0 ? (
        <p className="triage-no-patterns muted">
          {t(lang, 'result.noPatterns')}
        </p>
      ) : (
        <ul className="triage-patterns">
          {triage.patterns.map((pattern) => (
            <li key={pattern.id} className="triage-pattern">
              <span className="triage-pattern-name">
                {patternLabel(pattern.id, lang)}
              </span>
              {pattern.evidence && (
                <q className="triage-pattern-evidence">{pattern.evidence}</q>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="triage-language small muted">
        {t(lang, 'result.detectedLanguage')}:{' '}
        <strong>
          {triage.language === 'id' ? 'Bahasa Indonesia' : 'English'}
        </strong>
      </p>

      {deepOffered && !deep && (
        <div className="triage-deep-offer">
          <h3 className="triage-deep-offer-title">
            {t(lang, 'result.deepOfferTitle')}
          </h3>
          <p className="triage-deep-offer-desc small muted">
            {t(lang, 'result.deepOfferDesc')}
          </p>
          <button
            type="button"
            className="btn btn-dark btn-sm"
            onClick={onDeepAnalysis}
            disabled={deepLoading}
          >
            {deepLoading
              ? t(lang, 'result.deepLoading')
              : t(lang, 'result.deepButton')}
          </button>
        </div>
      )}

      {storedWhere && (
        <p className="triage-saved small muted">
          {t(lang, 'result.saved')} ·{' '}
          {t(
            lang,
            storedWhere === 'firestore'
              ? 'history.storedCloud'
              : 'history.storedLocal',
          )}
        </p>
      )}
    </section>
  );
}
