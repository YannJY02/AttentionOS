import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { isOnboardingComplete } from './adapters/storage/onboarding';
import {
  initializeAppPersistence,
  recordNativeQaReady,
  shouldWaitForPersistenceRestore,
} from './adapters/storage/persistence';
import { Shell } from './components/layout/Shell';
import { DailyFlowProvider } from './hooks/useDailyFlow';
import { CapturePage } from './pages/CapturePage';
import { ExecutionPage } from './pages/ExecutionPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { OverviewPage } from './pages/OverviewPage';
import { RitualPage } from './pages/RitualPage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';

function App() {
  const [isPersistenceReady, setIsPersistenceReady] = useState(
    () => !shouldWaitForPersistenceRestore(),
  );
  const [onboardingComplete, setOnboardingComplete] = useState(() => isOnboardingComplete());

  useEffect(() => {
    let isMounted = true;

    initializeAppPersistence()
      .catch((error) => {
        console.error('AttentionOS persistence initialization failed.', error);
      })
      .finally(() => {
        if (isMounted) {
          setOnboardingComplete(isOnboardingComplete());
          setIsPersistenceReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPersistenceReady) {
      return;
    }

    void recordNativeQaReady(onboardingComplete ? 'app-ready' : 'onboarding-ready');
  }, [isPersistenceReady, onboardingComplete]);

  if (!isPersistenceReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 text-stone-700">
        <p role="status">Restoring local AttentionOS workspace...</p>
      </div>
    );
  }

  return (
    <DailyFlowProvider>
      <Routes>
        <Route
          path="onboarding"
          element={<OnboardingPage onComplete={() => setOnboardingComplete(true)} />}
        />
        <Route element={<Shell />}>
          <Route
            index
            element={<Navigate to={onboardingComplete ? '/ritual' : '/onboarding'} replace />}
          />
          <Route path="ritual" element={<RitualPage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="execution" element={<Navigate to="/execution/plan" replace />} />
          <Route path="execution/*" element={<ExecutionPage />} />
          <Route path="capture" element={<CapturePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/ritual" replace />} />
        </Route>
      </Routes>
    </DailyFlowProvider>
  );
}

export default App;
