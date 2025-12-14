import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AccessControl from './pages/AccessControl';
import AttackSimulation from './pages/AttackSimulation';
import SecurityLogs from './pages/SecurityLogs'; // Import the new Logs page
import { MockBackend } from './services/mockBackend';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />;
      case 'access': return <AccessControl />;
      case 'attacks': return <AttackSimulation />;
      case 'logs': return <SecurityLogs />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

export default App;