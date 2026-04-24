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
import SubscriptionPage from './pages/SubscriptionPage';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Start on 'home' regardless of auth status, or let them navigate freely
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    // If the URL has session_id or mockPaymentSuccess, set it to active (mocking client side)
    if (window.location.search.includes('session_id') || window.location.search.includes('mockPaymentSuccess')) {
      if (user && user.subscriptionStatus !== 'active') {
         user.subscriptionStatus = 'active'; // In a real app, you'd fetch from backend
      }
    }

    const needsSubscription = user?.role?.toUpperCase() === 'STUDENT' && user?.subscriptionStatus !== 'active';

    switch (currentPage) {
      case 'home':
        return <HomePage onLaunch={() => setCurrentPage(isAuthenticated ? 'dashboard' : 'login')} />;
      case 'login':
        return <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('dashboard')} />;
      case 'signup':
        return <SignupPage onSwitchToLogin={() => setCurrentPage('login')} onSignupSuccess={() => setCurrentPage('login')} />;
      case 'labs':
        if (!isAuthenticated) return <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} onLoginSuccess={() => setCurrentPage('labs')} />;
        if (needsSubscription) return <SubscriptionPage onSuccess={() => setCurrentPage('labs')} onLogout={logout} />;
        return <LabsPage />;
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
      case 'subscription':
        return <SubscriptionPage onSuccess={() => setCurrentPage('labs')} onLogout={logout} />;
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