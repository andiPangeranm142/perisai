import type { Lang, RouteInfo } from '../lib/types';
import { t } from '../lib/i18n';
import './RoutePanel.css';

export interface RoutePanelProps {
  lang: Lang;
  route: RouteInfo;
  heading?: string;
}

export default function RoutePanel({ lang, route, heading }: RoutePanelProps) {
  return (
    <section className="card route-panel" aria-label={heading ?? t(lang, 'route.title')}>
      <h3 className="route-title">{heading ?? t(lang, 'route.title')}</h3>
      <dl className="route-rows">
        <div className="route-row">
          <dt>{t(lang, 'route.engine')}</dt>
          <dd>{route.engine}</dd>
        </div>
        <div className="route-row">
          <dt>{t(lang, 'route.latency')}</dt>
          <dd>
            {route.latencyMs.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}{' '}
            ms
          </dd>
        </div>
        <div className="route-row">
          <dt>{t(lang, 'route.cloudTokens')}</dt>
          <dd>
            {route.cloudTokens > 0
              ? `${route.cloudTokens.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} tokens`
              : t(lang, 'route.tokensNone')}
          </dd>
        </div>
      </dl>

      {route.fallbackReasonKey && (
        <p className="route-fallback small">
          <strong>{t(lang, 'route.fallbackLabel')}</strong>{' '}
          {t(lang, route.fallbackReasonKey)}
        </p>
      )}

      {route.offline && (
        <p className="route-note route-note-offline small">
          {t(lang, 'route.offline')}
        </p>
      )}

      {route.route === 'mock' && (
        <p className="route-note small">{t(lang, 'route.mockNote')}</p>
      )}

      {route.route === 'on-device' && (
        <p className="route-privacy small">
          <span className="dot" aria-hidden="true" />
          {t(lang, 'route.privateNote')}
        </p>
      )}
      {route.route === 'cloud' && (
        <p className="route-privacy small">
          <span className="dot" aria-hidden="true" />
          {t(lang, 'route.cloudNote')}
        </p>
      )}
    </section>
  );
}
