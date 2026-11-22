import { useState } from 'react';
import type { CheckRecord, Lang, RiskLevel, RouteInfo } from '../lib/types';
import { t } from '../lib/i18n';
import './HistoryPanel.css';

export interface HistoryPanelProps {
  lang: Lang;
  records: CheckRecord[];
  loading: boolean;
  onDelete: (id: string) => void;
  onClear: () => void;
  onRecheck: (snippet: string) => void;
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

export default function HistoryPanel({
  lang,
  records,
  loading,
  onDelete,
  onClear,
  onRecheck,
}: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const locale = lang === 'id' ? 'id-ID' : 'en-US';

  const formatDate = (createdAt: number) => {
    const date = new Date(createdAt);
    const day = date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const time = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} · ${time}`;
  };

  const handleClear = () => {
    if (window.confirm(t(lang, 'history.confirmClear'))) {
      onClear();
    }
  };

  return (
    <section className="history" aria-label={t(lang, 'history.title')}>
      <div className="history-header">
        <div>
          <h2 className="history-title">{t(lang, 'history.title')}</h2>
          <p className="history-subtitle muted">
            {t(lang, 'history.subtitle')}
          </p>
        </div>
        {records.length > 0 && !loading && (
          <button
            type="button"
            className="btn btn-secondary btn-sm history-clear"
            onClick={handleClear}
          >
            {t(lang, 'history.clear')}
          </button>
        )}
      </div>

      {loading ? (
        <p className="history-state muted" role="status">
          {t(lang, 'history.loading')}
        </p>
      ) : records.length === 0 ? (
        <p className="history-state muted">{t(lang, 'history.empty')}</p>
      ) : (
        <ul className="history-list">
          {records.map((record) => {
            const expanded = expandedId === record.id;
            return (
              <li key={record.id} className="card history-row">
                <button
                  type="button"
                  className="history-row-main"
                  onClick={() =>
                    setExpandedId(expanded ? null : record.id)
                  }
                  aria-expanded={expanded}
                >
                  <span className="history-row-top">
                    <span className={`badge ${RISK_BADGE[record.risk]}`}>
                      {t(lang, RISK_KEY[record.risk])}
                    </span>
                    <span
                      className={`badge ${routeBadgeClass(record.route)}`}
                    >
                      {t(lang, routeBadgeKey(record.route))}
                    </span>
                    <span className="history-date small muted">
                      {formatDate(record.createdAt)}
                    </span>
                  </span>
                  <span className="history-snippet">{record.snippet}</span>
                  <span
                    className={`history-chevron ${expanded ? 'history-chevron--open' : ''}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>

                {expanded && (
                  <p className="history-summary">{record.summary}</p>
                )}

                <div className="history-row-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRecheck(record.snippet)}
                  >
                    {t(lang, 'nav.checker')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm history-delete"
                    onClick={() => onDelete(record.id)}
                  >
                    {t(lang, 'history.delete')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
