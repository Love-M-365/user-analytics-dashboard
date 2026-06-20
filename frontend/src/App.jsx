import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import Heatmap from './pages/Heatmap';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Sidebar Left Navigation */}
            <Sidebar />

            {/* Main Content Workspace Panel */}
            <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/sessions/:sessionId" element={<SessionDetails />} />
                <Route path="/heatmap" element={<Heatmap />} />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
