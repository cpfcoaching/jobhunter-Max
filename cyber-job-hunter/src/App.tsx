import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CompanyList } from './pages/CompanyList';
import { CompanyDetail } from './pages/CompanyDetail';
import { Calendar } from './pages/Calendar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<div>Settings Placeholder</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
