import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import FloatingElements from './components/FloatingElements';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import LabsPage from './pages/LabsPage';
import DashboardPage from './pages/DashboardPage';
import BlogPage from './pages/BlogPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DepartmentOpsPage from './pages/DepartmentOpsPage';
import CoreAccessPage from './pages/CoreAccessPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // Start on 'home' regardless of auth status, or let them navigate freely
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onLaunch={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'login')} />;
      case 'login':
        return <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('dashboard')} />;
      case 'signup':
        return <SignupPage onSwitchToLogin={() => setCurrentPage('login')} onSignupSuccess={() => setCurrentPage('login')} />;
      case 'labs':
        return isAuthenticated ? <LabsPage /> : <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('labs')} />;
      case 'dashboard':
        return isAuthenticated ? <DashboardPage /> : <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('dashboard')} />;
      case 'blog':
        return <BlogPage />;
      case 'department':
        return isAuthenticated ? <DepartmentOpsPage /> : <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('department')} />;
      case 'data':
        return isAuthenticated ? <CoreAccessPage /> : <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('data')} />;
      case 'settings':
        return isAuthenticated ? <SettingsPage /> : <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('settings')} />;
      default:
        return <HomePage onLaunch={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-neural-light dark:bg-neural-dark transition-colors duration-300">
      {/* Background Elements */}
      <ParticleBackground />
      <FloatingElements />
      
      {/* Navigation (Only show if authenticated) */}
      {isAuthenticated && (
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      )}
      
      {/* Main Content */}
      <main className="relative z-10 w-full h-full">
        {renderCurrentPage()}
      </main>
      
      {/* AI Assistant (Only show if authenticated) */}
      {isAuthenticated && <AIAssistant />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;