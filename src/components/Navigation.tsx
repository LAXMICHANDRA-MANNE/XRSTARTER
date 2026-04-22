import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  FlaskConical, 
  Trophy, 
  Bot, 
  BookOpen, 
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Building2,
  Database
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, setIsAIAssistantOpen } = useApp();
  const { logout, permissions } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNavVisible, setIsNavVisible] = React.useState(false);

  // Dynamic Navigation builder based on RBAC Permissions
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, visible: true },
    { id: 'labs', label: 'Labs', icon: FlaskConical, visible: permissions?.canViewLabs ?? true },
    { id: 'dashboard', label: 'Dashboard', icon: Trophy, visible: permissions?.canViewDashboard ?? true },
    { id: 'blog', label: 'Research', icon: BookOpen, visible: true },
    { id: 'department', label: 'Dept Ops', icon: Building2, visible: permissions?.canAccessDepartmentOverview ?? false },
    { id: 'data', label: 'Core Access', icon: Database, visible: permissions?.canAccessRootEngine ?? false },
  ].filter(item => item.visible);

  return (
    <>
      {/* Invisible Trigger Zone at the very top of the screen */}
      <div 
        className="fixed top-0 left-0 right-0 h-8 z-[60]"
        onMouseEnter={() => setIsNavVisible(true)}
      />

      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: "-100%" }}
        animate={{ y: isNavVisible ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseLeave={() => setIsNavVisible(false)}
        className="fixed top-0 left-0 right-0 z-50 bg-glass-white dark:bg-glass-black backdrop-blur-glass border-b border-white/20 dark:border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all">
                XRSTARTER
              </span>
            </motion.div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Settings Core Access */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange('settings')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'settings' 
                    ? 'bg-primary-500 text-white shadow-glow' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* AI Assistant Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAIAssistantOpen(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow-accent hover:shadow-lg transition-all duration-200"
              >
                <Bot className="w-5 h-5" />
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>

              {/* User Avatar & Logout */}
              {user && (
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-glass-white dark:bg-glass-black border border-white/20 dark:border-gray-800/50"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="hidden lg:block text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">Level {user.level}</p>
                    </div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Spacer for fixed navigation (only show space if not auto-hiding globally, or keep minimal space) */}
      {currentPage !== 'labs' && <div className="h-16"></div>}
    </>
  );
};

export default Navigation;