// ============================================
// APPLICATION CONFIGURATION
// ============================================
// This file contains all configurable parameters for the application
// Modify these values based on your environment (dev, staging, production)

// Base path for deployment (e.g. '/billing-analytics' on Tomcat). Set in HTML before this script, or leave empty for root.
window.APP_BASE = typeof window !== 'undefined' && window.APP_BASE !== undefined ? window.APP_BASE : '';

window.AppConfig = {
  // Backend API Configuration
  api: {
    // Base URL for backend API. Use relative path when app and backend are on same Tomcat (same host).
    backendUrl: '/analytics/api',
    
    // API timeout in milliseconds
    timeout: 30000,
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000
  },
  
  // Authentication Configuration
  auth: {
    // Token storage key
    tokenKey: 'token',
    
    // User data storage key
    userKey: 'user',
    
    // Token expiry storage key (ISO date string from signin response)
    expiresAtKey: 'tokenExpiresAt',
    
    // Session timeout (in minutes)
    sessionTimeout: 60
  },
  
  // Application Settings
  app: {
    // Base path when deployed under a context (e.g. Tomcat: '/billing-analytics')
    basePath: window.APP_BASE,
    // Application name
    name: 'CellPay Analytics Portal',
    
    // Version
    version: '1.0.0',
    
    // Debug mode (set to false in production)
    debug: false,
    
    // Auto-refresh interval for dashboard (in milliseconds)
    dashboardRefreshInterval: 30 * 60 * 1000, // 30 minutes
    
    // Date format
    dateFormat: 'YYYY-MM-DD',
    
    // Currency format
    currencySymbol: '$',
    currencyLocale: 'en-US'
  },
  
  // Feature Flags
  features: {
    enableAIAssistant: true,
    enableNotifications: true,
    enableExport: true,
    enablePrint: true
  },
  
  // UI Configuration
  ui: {
    // Items per page for tables
    itemsPerPage: 50,
    
    // Chart colors
    chartColors: [
      '#4F46E5', // Indigo
      '#7C3AED', // Purple
      '#EC4899', // Pink
      '#F59E0B', // Yellow
      '#10B981', // Green
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#8B5CF6'  // Violet
    ],
    
    // Toast notification duration (ms)
    toastDuration: 5000
  }
};

// Environment-specific overrides (optional)
// When app and backend are on the same Tomcat, backendUrl: '/analytics/api' above uses the same host (e.g. localhost).
// To point to a different server (e.g. UAT), set a full URL:
// window.AppConfig.api.backendUrl = 'https://uat.cellpaybackend.us:8443/analytics/api';
