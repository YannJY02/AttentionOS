import { Navigate, Route, Routes } from 'react-router';
import { Shell } from './components/layout/Shell';
import { ExecutionPage } from './pages/ExecutionPage';
import { OverviewPage } from './pages/OverviewPage';
import { RitualPage } from './pages/RitualPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Navigate to="/ritual" replace />} />
        <Route path="ritual" element={<RitualPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="execution" element={<ExecutionPage />} />
        <Route path="*" element={<Navigate to="/ritual" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
