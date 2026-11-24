import { useRef } from 'react';
import type { Lang, PerisaiError } from '../lib/types';
import { t } from '../lib/i18n';
import { SAMPLE_MESSAGES } from '../lib/samples';
import './Checker.css';

export interface CheckerProps {
  lang: Lang;
  message: string;
  onMessageChange: (v: string) => void;
  onCheck: () => void;
  onClear: () => void;
  onSampleSelect: (text: string) => void;
  onFileSelect: (file: File) => void;
  checking: boolean;
  ocrLoading: boolean;
  error: PerisaiError | null;
  /** Which step failed — 'ocr' failures have no message to retry with. */
  errorSource: 'triage' | 'deep' | 'ocr' | null;
  onRetry: () => void;
  onUseRuleBased: () => void;
  online: boolean;
  downloadProgress: number | null;
  truncated: boolean;
}

const ERROR_KEY: Record<PerisaiError['code'], string> = {
  OFFLINE: 'error.offline',
  AI_UNAVAILABLE: 'error.aiUnavailable',
  PARSE_FAILED: 'error.parseFailed',
  MOCK_NO_OCR: 'error.mockNoOcr',
  UNKNOWN: 'error.generic',
};

const MAX_CHARS = 4000;

export default function Checker({
  lang,
  message,
  onMessageChange,
  onCheck,
  onClear,
  onSampleSelect,
  onFileSelect,
  checking,
  ocrLoading,
  error,
  errorSource,
  onRetry,
  onUseRuleBased,
  online,
  downloadProgress,
  truncated,
}: CheckerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busy = checking || ocrLoading;
  const empty = message.trim().length === 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset so the same file can be picked again.
    e.target.value = '';
  };

  return (
    <section className="checker" aria-label={t(lang, 'checker.title')}>
      {!online && (
        <p className="checker-offline" role="status">
          <span className="dot" aria-hidden="true" />
          {t(lang, 'offline.banner')}
        </p>
      )}

      <h2 className="checker-title">{t(lang, 'checker.title')}</h2>
      <p className="checker-subtitle muted">{t(lang, 'checker.subtitle')}</p>

      <div className="checker-field">
        <div className="checker-label-row">
          <label className="field-label" htmlFor="checker-message">
            {t(lang, 'checker.label')}
          </label>
          <span className="checker-count muted small" aria-live="off">
            {message.length.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} /{' '}
            {MAX_CHARS.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}
          </span>
        </div>
        <textarea
          id="checker-message"
          className="textarea checker-textarea"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t(lang, 'checker.placeholder')}
          rows={7}
          disabled={busy}
        />
        {truncated && (
          <p className="checker-note small">{t(lang, 'checker.tooLong')}</p>
        )}
      </div>

      <div className="checker-samples">
        <span className="checker-samples-label small">
          {t(lang, 'checker.samplesLabel')}
        </span>
        <div className="checker-chips">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="checker-chip"
              onClick={() => onSampleSelect(sample.text)}
              disabled={busy}
            >
              {sample.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="checker-upload">
        <span className="field-label">{t(lang, 'checker.uploadLabel')}</span>
        <p className="checker-upload-hint muted small">
          {t(lang, 'checker.uploadHint')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          aria-label={t(lang, 'checker.uploadButton')}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
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
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {ocrLoading ? t(lang, 'checker.ocrReading') : t(lang, 'checker.uploadButton')}
        </button>
      </div>

      {error && (
        <div className="checker-error" role="alert">
          <p className="checker-error-text">
            {/* UNKNOWN errors may carry a specific, user-facing message
                (e.g. OCR returned no text); show it instead of the generic
                fallback when present. */}
            {error.code === 'UNKNOWN' && error.message
              ? error.message
              : t(lang, ERROR_KEY[error.code] ?? 'error.generic')}
          </p>
          <div className="checker-error-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={
                // OCR failures have no message text to retry with — the
                // only useful retry is picking the screenshot again.
                errorSource === 'ocr'
                  ? () => fileInputRef.current?.click()
                  : onRetry
              }
            >
              {t(lang, 'error.retry')}
            </button>
            {(error.code === 'AI_UNAVAILABLE' || error.code === 'OFFLINE') &&
              // No message text exists after an OCR failure, so the
              // rule-based engine has nothing to analyse — hide it.
              errorSource !== 'ocr' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onUseRuleBased}
                >
                  {t(lang, 'error.useRuleBased')}
                </button>
              )}
          </div>
        </div>
      )}

      <div className="checker-actions">
        <button
          type="button"
          className="btn btn-primary checker-check-btn"
          onClick={onCheck}
          disabled={empty || busy}
        >
          {checking ? (
            <span className="checker-spinner" aria-hidden="true" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          {checking ? t(lang, 'checker.checking') : t(lang, 'checker.checkButton')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClear}
          disabled={busy && empty}
        >
          {t(lang, 'checker.clearButton')}
        </button>
      </div>

      {checking && (
        <p className="checker-status small" role="status" aria-live="polite">
          {t(lang, 'checker.checking')}
        </p>
      )}

      {downloadProgress != null && (
        <div className="checker-download" aria-live="polite">
          <div
            className="checker-progress"
            role="progressbar"
            aria-valuenow={Math.round(downloadProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="checker-progress-fill"
              style={{ width: `${Math.round(downloadProgress * 100)}%` }}
            />
          </div>
          <p className="checker-download-text small">
            {t(lang, 'checker.downloading')}{' '}
            {Math.round(downloadProgress * 100)}%
          </p>
        </div>
      )}
    </section>
  );
}
