import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Landing from './components/Landing.tsx';
import Checker from './components/Checker.tsx';
import TriageResult from './components/TriageResult.tsx';
import DeepAnalysisCard from './components/DeepAnalysisCard.tsx';
import RoutePanel from './components/RoutePanel.tsx';
import HistoryPanel from './components/HistoryPanel.tsx';
import PatternLibrary from './components/PatternLibrary.tsx';
import { useMockEngine } from './lib/firebase.ts';
import {
  isOnline,
  MOCK_ENGINE,
  probeDeviceModel,
  runDeepAnalysis,
  runOcr,
  runTriage,
  shouldOfferDeepAnalysis,
  type DeviceAvailability,
} from './lib/hybrid.ts';
import { mockDeepAnalysis, mockTriage } from './lib/mock.ts';
import {
  clearChecks,
  deleteCheck,
  listChecks,
  makeRecord,
  saveCheck,
  type StoredWhere,
} from './lib/history.ts';
import { trimMessage } from './lib/prompts.ts';
import { t } from './lib/i18n.ts';
import {
  PerisaiError,
  type CheckRecord,
  type DeepAnalysisResult,
  type Lang,
  type RouteInfo,
  type TriageResult as TriageResultType,
  type View,
} from './lib/types.ts';
import './App.css';

type CheckStatus = 'idle' | 'triaging' | 'done' | 'error';
type ErrorSource = 'triage' | 'deep' | 'ocr' | null;

const LANG_KEY = 'perisai-lang';

function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'id' ? 'id' : 'en';
  } catch {
    return 'en';
  }
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '');
      const comma = dataUrl.indexOf(',');
      if (comma === -1) {
        reject(new Error('Could not read file.'));
        return;
      }
      resolve({ base64: dataUrl.slice(comma + 1), mimeType: file.type });
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [lang, setLang] = useState<Lang>(loadLang);
  const [view, setView] = useState<View>('home');
  const [online, setOnline] = useState<boolean>(isOnline());
  const [deviceStatus, setDeviceStatus] =
    useState<DeviceAvailability>('unsupported');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [triage, setTriage] = useState<TriageResultType | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [deep, setDeep] = useState<DeepAnalysisResult | null>(null);
  const [deepRoute, setDeepRoute] = useState<RouteInfo | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<PerisaiError | null>(null);
  const [errorSource, setErrorSource] = useState<ErrorSource>(null);
  const [storedWhere, setStoredWhere] = useState<StoredWhere | null>(null);
  const [truncated, setTruncated] = useState(false);

  const [history, setHistory] = useState<CheckRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const mode = useMockEngine ? 'demo' : 'live';

  // Online/offline tracking.
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Probe on-device model availability once on load.
  useEffect(() => {
    let cancelled = false;
    void probeDeviceModel().then((s) => {
      if (!cancelled) setDeviceStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistory(await listChecks());
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'history') void refreshHistory();
  }, [view, refreshHistory]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'id' : 'en';
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  const clearResults = useCallback(() => {
    setTriage(null);
    setRoute(null);
    setDeep(null);
    setDeepRoute(null);
    setError(null);
    setErrorSource(null);
    setStoredWhere(null);
    setTruncated(false);
    setStatus('idle');
  }, []);

  const saveToHistory = useCallback(
    async (triageResult: TriageResultType, routeInfo: RouteInfo) => {
      try {
        const record = makeRecord(
          message,
          triageResult.risk,
          routeInfo.route,
          triageResult.summary,
        );
        setStoredWhere(await saveCheck(record));
        setHistory((prev) =>
          [record, ...prev.filter((r) => r.id !== record.id)].slice(0, 50),
        );
      } catch {
        // History must never break the check flow.
      }
    },
    [message],
  );

  const handleCheck = useCallback(async () => {
    const { text, truncated: wasTruncated } = trimMessage(message);
    if (!text) return;
    setTruncated(wasTruncated);
    setStatus('triaging');
    setError(null);
    setErrorSource(null);
    setDeep(null);
    setDeepRoute(null);
    setStoredWhere(null);
    try {
      const outcome = await runTriage(text, {
        onDeviceDownload: (p) => setDownloadProgress(p),
      });
      setDownloadProgress(null);
      setTriage(outcome.triage);
      setRoute(outcome.route);
      setStatus('done');
      void saveToHistory(outcome.triage, outcome.route);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    } catch (err) {
      setDownloadProgress(null);
      setError(
        err instanceof PerisaiError
          ? err
          : new PerisaiError('UNKNOWN', 'Check failed.'),
      );
      setErrorSource('triage');
      setStatus('error');
    }
  }, [message, saveToHistory]);

  const handleDeep = useCallback(async () => {
    if (!triage) return;
    setDeepLoading(true);
    setError(null);
    setErrorSource(null);
    try {
      const outcome = await runDeepAnalysis(message, triage);
      setDeep(outcome.analysis);
      setDeepRoute(outcome.route);
    } catch (err) {
      setError(
        err instanceof PerisaiError
          ? err
          : new PerisaiError('UNKNOWN', 'Deep analysis failed.'),
      );
      setErrorSource('deep');
    } finally {
      setDeepLoading(false);
    }
  }, [message, triage]);

  const handleRetry = useCallback(() => {
    if (errorSource === 'deep') void handleDeep();
    else void handleCheck();
  }, [errorSource, handleCheck, handleDeep]);

  /**
   * Honest fallback when live AI is unavailable: run the local rule-based
   * engine and label the result as rule-based (route 'mock').
   */
  const handleUseRuleBased = useCallback(() => {
    const fallbackRoute: RouteInfo = {
      route: 'mock',
      engine: MOCK_ENGINE,
      latencyMs: 0,
      cloudTokens: 0,
      offline: !online,
    };
    if (errorSource === 'deep' && triage) {
      setDeep(mockDeepAnalysis(message, triage));
      setDeepRoute(fallbackRoute);
      setError(null);
      setErrorSource(null);
      return;
    }
    const { text } = trimMessage(message);
    if (!text) return;
    const triageResult = mockTriage(text);
    setTriage(triageResult);
    setRoute(fallbackRoute);
    setStatus('done');
    setError(null);
    setErrorSource(null);
    void saveToHistory(triageResult, fallbackRoute);
  }, [errorSource, message, online, saveToHistory, triage]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setOcrLoading(true);
      setError(null);
      setErrorSource(null);
      try {
        const { base64, mimeType } = await fileToBase64(file);
        const { text } = await runOcr(base64, mimeType);
        if (!text) {
          setError(new PerisaiError('UNKNOWN', t(lang, 'error.ocrEmpty')));
          setErrorSource('ocr');
          return;
        }
        setMessage(text);
        clearResults();
      } catch (err) {
        setError(
          err instanceof PerisaiError
            ? err
            : new PerisaiError('UNKNOWN', 'Screenshot reading failed.'),
        );
        setErrorSource('ocr');
      } finally {
        setOcrLoading(false);
      }
    },
    [clearResults, lang],
  );

  const loadMessageIntoChecker = useCallback(
    (text: string) => {
      const cleaned = text.replace(/^"+|"+$/g, '').replace(/…$/, '').trim();
      setMessage(cleaned);
      clearResults();
      setView('check');
    },
    [clearResults],
  );

  const handleDeleteHistory = useCallback(async (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    await deleteCheck(id);
  }, []);

  const handleClearHistory = useCallback(async () => {
    setHistory([]);
    await clearChecks();
  }, []);

  return (
    <div className="app">
      <Header
        lang={lang}
        view={view}
        onNavigate={setView}
        onToggleLang={toggleLang}
        mode={mode}
      />
      {!online && (
        <div className="offline-strip" role="status">
          <div className="container">{t(lang, 'offline.banner')}</div>
        </div>
      )}
      <main className="app-main">
        {view === 'home' && (
          <Landing
            lang={lang}
            mode={mode}
            deviceStatus={deviceStatus}
            online={online}
            onStartCheck={() => setView('check')}
            onOpenLibrary={() => setView('library')}
          />
        )}
        {view === 'check' && (
          <div className="container check-view">
            <Checker
              lang={lang}
              message={message}
              onMessageChange={(v) => {
                setMessage(v);
                if (error) {
                  setError(null);
                  setErrorSource(null);
                }
              }}
              onCheck={() => void handleCheck()}
              onClear={() => {
                setMessage('');
                clearResults();
              }}
              onSampleSelect={loadMessageIntoChecker}
              onFileSelect={(f) => void handleFileSelect(f)}
              checking={status === 'triaging'}
              ocrLoading={ocrLoading}
              error={error}
              errorSource={errorSource}
              onRetry={handleRetry}
              onUseRuleBased={handleUseRuleBased}
              online={online}
              downloadProgress={downloadProgress}
              truncated={truncated}
            />
            {triage && route && (
              <div ref={resultsRef} className="results-stack">
                <TriageResult
                  lang={lang}
                  triage={triage}
                  route={route}
                  deepOffered={shouldOfferDeepAnalysis(triage)}
                  deepLoading={deepLoading}
                  onDeepAnalysis={() => void handleDeep()}
                  deep={deep}
                  storedWhere={storedWhere}
                />
                {deep && deepRoute && (
                  <DeepAnalysisCard
                    lang={lang}
                    analysis={deep}
                    route={deepRoute}
                  />
                )}
                <RoutePanel lang={lang} route={route} />
                {deepRoute && (
                  <RoutePanel
                    lang={lang}
                    route={deepRoute}
                    heading={`${t(lang, 'result.deepTitle')} · ${t(lang, 'route.title')}`}
                  />
                )}
                <div className="try-another">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setMessage('');
                      clearResults();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {t(lang, 'checker.tryAnother')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'library' && (
          <PatternLibrary lang={lang} onTryExample={loadMessageIntoChecker} />
        )}
        {view === 'history' && (
          <HistoryPanel
            lang={lang}
            records={history}
            loading={historyLoading}
            onDelete={(id) => void handleDeleteHistory(id)}
            onClear={() => void handleClearHistory()}
            onRecheck={loadMessageIntoChecker}
          />
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
