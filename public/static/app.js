

const state = {user: null, currentPage: "dashboard", filters: {dateRange: "7d", service: "all"}, charts: {}, notifications: []};

window.updateFilter = function(key, value) {
  if (state.filters && key in state.filters) {
    state.filters[key] = value;
    if (key === 'dateRange') loadDashboardData();
  }
};

function getDateRangeLabel(value) {
  const v = (value || '7d').toLowerCase();
  if (v === '1d') return 'Today';
  if (v === '7d') return 'Last 7 Days';
  if (v === '30d') return 'Last 30 Days';
  if (v === '90d') return 'Last 90 Days';
  if (v === 'custom') return 'Custom Range';
  return 'Last 7 Days';
}
function getDateRangeShortLabel(value) {
  const v = (value || '7d').toLowerCase();
  if (v === '1d') return 'Today';
  if (v === '7d') return '7 Days';
  if (v === '30d') return '30 Days';
  if (v === '90d') return '90 Days';
  if (v === 'custom') return 'Custom';
  return '7 Days';
}
function setDefaultCustomDates() {
  const { startDate, endDate } = getReportDateRange('7d');
  const startEl = document.getElementById('custom-start-date');
  const endEl = document.getElementById('custom-end-date');
  if (startEl) startEl.value = startDate;
  if (endEl) endEl.value = endDate;
}
function toggleCustomDateInputs(selectId, wrapId) {
  const sel = document.getElementById(selectId);
  const wrap = document.getElementById(wrapId);
  if (!sel || !wrap) return;
  const isCustom = sel.value === 'custom';
  wrap.classList.toggle('hidden', !isCustom);
  if (isCustom) setDefaultCustomDates();
}

// ============================================
// UI ENHANCEMENT UTILITIES
// ============================================

// Loading Overlay
window.showLoading = function(message = 'Loading...') {
  if (document.getElementById('loading-overlay')) return;
  const overlay = `
    <div id="loading-overlay" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 modal-backdrop">
      <div class="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-2xl bounce-in">
        <div class="spinner"></div>
        <span class="text-gray-900 font-medium text-lg">${message}</span>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlay);
};

window.hideLoading = function() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }
};

// Empty State Component
window.showEmptyState = function(container, config = {}) {
  const {
    icon = 'inbox',
    title = 'No Data Found',
    message = 'There are no items to display.',
    actionText = null,
    actionOnClick = null
  } = config;
  
  const iconSvgs = {
    inbox: `<svg class="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
    </svg>`,
    users: `<svg class="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
    </svg>`,
    search: `<svg class="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>`,
    chart: `<svg class="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>`
  };
  
  const html = `
    <div class="empty-state py-16">
      ${iconSvgs[icon] || iconSvgs.inbox}
      <h3 class="text-xl font-semibold text-gray-700 mt-4">${title}</h3>
      <p class="text-gray-500 mt-2 max-w-md mx-auto">${message}</p>
      ${actionText ? `
        <button onclick="${actionOnClick}" class="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
          ${actionText}
        </button>
      ` : ''}
    </div>
  `;
  
  document.getElementById(container).innerHTML = html;
};

// Skeleton Loader
window.showSkeleton = function(container, type = 'table', count = 5) {
  const skeletons = {
    table: `
      <div class="space-y-3">
        ${Array(count).fill('').map(() => `
          <div class="flex items-center space-x-4 p-4 bg-white rounded-lg">
            <div class="skeleton w-12 h-12 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
            </div>
            <div class="skeleton h-8 w-20 rounded"></div>
          </div>
        `).join('')}
      </div>
    `,
    card: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${Array(count).fill('').map(() => `
          <div class="card p-6 space-y-3">
            <div class="skeleton h-4 w-20 rounded"></div>
            <div class="skeleton h-8 w-32 rounded"></div>
            <div class="skeleton h-3 w-24 rounded"></div>
          </div>
        `).join('')}
      </div>
    `,
    list: `
      <div class="space-y-2">
        ${Array(count).fill('').map(() => `
          <div class="skeleton h-16 w-full rounded-lg"></div>
        `).join('')}
      </div>
    `
  };
  
  document.getElementById(container).innerHTML = skeletons[type] || skeletons.table;
};

// Progress Bar
window.showProgress = function(container, percentage) {
  const html = `
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: ${percentage}%"></div>
    </div>
  `;
  document.getElementById(container).innerHTML = html;
};

// Confirmation Dialog
window.confirmDialog = function(title, message, onConfirm) {
  const modal = `
    <div id="confirm-dialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md m-4 bounce-in">
        <div class="p-6 border-b">
          <h3 class="text-xl font-bold text-gray-900">${title}</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-600">${message}</p>
        </div>
        <div class="p-6 border-t flex gap-3 justify-end">
          <button onclick="document.getElementById('confirm-dialog').remove()" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onclick="${onConfirm}; document.getElementById('confirm-dialog').remove()" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modal);
};

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'BUTTON') {
    const button = e.target;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }
});

// Page transition effect
let previousContent = '';
window.addPageTransition = function() {
  const content = document.getElementById('main-content');
  if (content) {
    content.classList.add('page-enter');
    setTimeout(() => {
      content.classList.remove('page-enter');
      content.classList.add('page-enter-active');
    }, 10);
  }
};

// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================
const PERMISSIONS = {
  admin: {
    viewDashboard: true,
    viewAnalytics: true,
    viewEmployees: true,
    addEmployee: true,
    editEmployee: true,
    deleteEmployee: true,
    viewCRM: true,
    addContact: true,
    editContact: true,
    deleteContact: true,
    viewCustomers: true,
    viewTasks: true,
    addTask: true,
    editTask: true,
    deleteTask: true,
    viewTickets: true,
    addTicket: true,
    editTicket: true,
    deleteTicket: true,
    viewReports: true,
    exportReports: true,
    viewAllData: true,
    manageCarrierMargins: true,
    updateB2BClient: true,
    addB2BClient: true
  },
  manager: {
    viewDashboard: true,
    viewAnalytics: true,
    viewEmployees: true,
    addEmployee: false,
    editEmployee: true,
    deleteEmployee: false,
    viewCRM: true,
    addContact: true,
    editContact: true,
    deleteContact: false,
    viewCustomers: true,
    viewTasks: true,
    addTask: true,
    editTask: true,
    deleteTask: false,
    viewTickets: true,
    addTicket: true,
    editTicket: true,
    deleteTicket: false,
    viewReports: true,
    exportReports: true,
    viewAllData: true,
    manageCarrierMargins: false,
    updateB2BClient: false,
    addB2BClient: false
  },
  sales: {
    viewDashboard: true,
    viewAnalytics: false,
    viewEmployees: false,
    addEmployee: false,
    editEmployee: false,
    deleteEmployee: false,
    viewCRM: true,
    addContact: false,
    editContact: false,
    deleteContact: false,
    viewCustomers: true,
    viewTasks: true,
    addTask: false,
    editTask: true,
    deleteTask: false,
    viewTickets: true,
    addTicket: true,
    editTicket: false,
    deleteTicket: false,
    viewReports: true,
    exportReports: false,
    viewAllData: false,
    manageCarrierMargins: false,
    updateB2BClient: false,
    addB2BClient: false
  }
};

// Normalize backend role (array or string, e.g. ['ADMIN'] or 'ROLE_ADMIN') to frontend key: 'admin' | 'manager' | 'sales'
function normalizeRole(role) {
  const raw = Array.isArray(role) ? role[0] : role;
  if (raw == null || raw === '') return 'sales';
  const s = String(raw).toLowerCase().replace(/^role_/, '');
  if (s === 'admin') return 'admin';
  if (s === 'manager') return 'manager';
  if (s === 'sales') return 'sales';
  return 'sales';
}

window.hasPermission = function(permission) {
  if (!state.user) return false;
  const rawRole = state.user.employee_role || state.user.role || 'sales';
  const role = normalizeRole(rawRole);
  return PERMISSIONS[role]?.[permission] || false;
};

window.getUserRole = function() {
  if (!state.user) return 'sales';
  const rawRole = state.user.employee_role || state.user.role || 'sales';
  return normalizeRole(rawRole);
};

window.isAdmin = function() {
  return getUserRole() === 'admin';
};

window.isManager = function() {
  return getUserRole() === 'manager';
};

window.isSales = function() {
  return getUserRole() === 'sales';
};

// Returns HTML string for displaying API errors (403 = access denied style, else red). Use in catch blocks for any API call.
function getApiErrorDisplay(err, opts) {
  const message = (typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.response?.data?.message || err.message || 'Please try again.'));
  const safeMessage = (message || '').replace(/</g, '&lt;');
  const is403 = err.response && err.response.status === 403;
  const title = (opts && opts.title) ? String(opts.title).replace(/</g, '&lt;') : '';
  if (is403) {
    return `<div class="card bg-amber-50 border-l-4 border-amber-500 p-4">
      <p class="text-amber-800"><i class="fas fa-lock mr-2"></i>${safeMessage}</p>
      <p class="text-amber-700 text-sm mt-1">Contact your administrator if you need access.</p>
    </div>`;
  }
  return `<div class="card bg-red-50 border-l-4 border-red-500 p-4">
    ${title ? `<h3 class="text-lg font-semibold text-red-800 mb-2">${title}</h3>` : ''}
    <p class="text-red-600">${safeMessage}</p>
  </div>`;
}

// Escape user/API content for safe HTML (tasks, tickets, comments).
function escapeHtml(s) {
  if (s == null) return '';
  const t = String(s);
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

// Task/Ticket state and priority enums (for dropdowns and display)
const TASK_STATES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
function taskStateLabel(state) {
  const labels = { OPEN: 'Open', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
  return labels[state] || state;
}
function formatIsoDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch (_) { return iso; }
}

window.logout = function() {
  
  localStorage.clear();
  window.location.href = (window.APP_BASE || '') + "/login.html";
};

window.navigateTo = function(page, params = {}) {
  
  
  // Close mobile menu after navigation
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) menuToggle.checked = false;
  
  state.currentPage = page;
  state.currentParams = params; // Store params for detail pages
  
  document.querySelectorAll(".sidebar-link").forEach(link => {
    link.classList.remove("active", "bg-indigo-600");
    if (link.dataset.page === page) link.classList.add("active", "bg-indigo-600");
  });
  
  switch(page) {
    case "dashboard": loadDashboard(); break;
    case "analytics": loadAnalytics(); break;
    case "employees": loadEmployees(); break;
    case "crm": loadCRM(); break;
    case "tasks": loadTasks(); break;
    case "tickets": loadTickets(); break;
    case "ai-reports": loadAIReports(); break;
    case "notifications": loadNotifications(); break;
    case "provider-detail": loadProviderDetail(params.provider); break;
    case "customer-detail": loadCustomerDetail(params.customerId); break;
    case "task-detail": loadTaskDetail(params.id); break;
    case "ticket-detail": loadTicketDetail(params.id); break;
  }
};

async function init() {
  
  const tokenKey = window.AppConfig?.auth?.tokenKey || 'token';
  const userKey = window.AppConfig?.auth?.userKey || 'user';
  const token = localStorage.getItem(tokenKey);
  if (!token) {
    window.location.href = (window.APP_BASE || '') + "/login.html";
    return;
  }
  if (typeof window.isSessionExpired === 'function' && window.isSessionExpired()) {
    localStorage.clear();
    window.location.href = (window.APP_BASE || '') + "/login.html";
    return;
  }

  try {
    
    // Get user data from localStorage (stored during login)
    const tokenKey = window.AppConfig?.auth?.tokenKey || 'token';
    const userKey = window.AppConfig?.auth?.userKey || 'user';
    const userStr = localStorage.getItem(userKey);
    if (!userStr) {
      window.location.href = (window.APP_BASE || '') + "/login.html";
      return;
    }
    
    const user = JSON.parse(userStr);
    state.user = user;
    
    
    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-role").textContent = user.employee_role || user.role;
    
    // Optionally hide Tasks/Tickets sidebar links by permission
    document.querySelectorAll('.sidebar-link[data-page="tasks"]').forEach(function(el) { el.style.display = hasPermission('viewTasks') ? '' : 'none'; });
    document.querySelectorAll('.sidebar-link[data-page="tickets"]').forEach(function(el) { el.style.display = hasPermission('viewTickets') ? '' : 'none'; });
    
    // Initialize notifications
    initNotifications();
    
    
    loadDashboard();
  } catch (e) {
    
    window.location.href = (window.APP_BASE || '') + "/login.html";
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
window.addNotification = function(type, title, message) {
  const notification = {
    id: Date.now(),
    type: type, // 'info', 'success', 'warning', 'error'
    title: title,
    message: message,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  state.notifications.unshift(notification);
  updateNotificationBadge();
  
  // Show toast notification
  showToast(notification);
};

window.updateNotificationBadge = function() {
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
};

window.showToast = function(notification) {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 translate-x-full`;
  
  const bgColor = {
    'info': 'bg-blue-50',
    'success': 'bg-green-50',
    'warning': 'bg-yellow-50',
    'error': 'bg-red-50'
  }[notification.type] || 'bg-gray-50';
  
  const iconColor = {
    'info': 'text-blue-600',
    'success': 'text-green-600',
    'warning': 'text-yellow-600',
    'error': 'text-red-600'
  }[notification.type] || 'text-gray-600';
  
  const icon = {
    'info': 'fa-info-circle',
    'success': 'fa-check-circle',
    'warning': 'fa-exclamation-triangle',
    'error': 'fa-times-circle'
  }[notification.type] || 'fa-bell';
  
  toast.innerHTML = `
    <div class="p-4 ${bgColor}">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas ${icon} ${iconColor} text-xl"></i>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="mt-1 text-sm text-gray-500">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="ml-4 flex-shrink-0">
          <i class="fas fa-times text-gray-400 hover:text-gray-600"></i>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.remove('translate-x-full'), 100);
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
};

// Initialize notifications with dummy data
function initNotifications() {
  state.notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Sales Drop Alert',
      message: 'SurePays sales dropped 25% this week',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'New Ticket',
      message: 'New support ticket #1234 assigned to you',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Deal Closed',
      message: 'DT One - Enterprise Plan deal closed ($150K)',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ];
  updateNotificationBadge();
}

async function loadNotifications() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">
        <i class="fas fa-bell mr-2"></i>Notifications
      </h1>
      <button onclick="markAllAsRead()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        <i class="fas fa-check-double mr-2"></i>Mark All as Read
      </button>
    </div>
    
    <div class="card">
      <div id="notifications-list"></div>
    </div>
  </div>`;
  
  loadNotificationsList();
}

function loadNotificationsList() {
  const html = state.notifications.length ? state.notifications.map(n => {
    const bgColor = n.read ? 'bg-white' : 'bg-blue-50';
    const iconColor = {
      'info': 'text-blue-600',
      'success': 'text-green-600',
      'warning': 'text-yellow-600',
      'error': 'text-red-600'
    }[n.type] || 'text-gray-600';
    
    const icon = {
      'info': 'fa-info-circle',
      'success': 'fa-check-circle',
      'warning': 'fa-exclamation-triangle',
      'error': 'fa-times-circle'
    }[n.type] || 'fa-bell';
    
    return `
      <div class="${bgColor} p-4 border-b last:border-b-0 hover:bg-gray-50 transition">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i class="fas ${icon} ${iconColor} text-xl"></i>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">${n.title}</p>
              <span class="text-xs text-gray-500">${new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <p class="mt-1 text-sm text-gray-600">${n.message}</p>
          </div>
          <div class="ml-4 flex-shrink-0">
            ${!n.read ? `<button onclick="markAsRead(${n.id})" class="text-xs text-indigo-600 hover:text-indigo-900">Mark as read</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('') : '<p class="text-center text-gray-500 py-8">No notifications</p>';
  
  document.getElementById('notifications-list').innerHTML = html;
}

window.markAsRead = function(id) {
  const notification = state.notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    updateNotificationBadge();
    loadNotificationsList();
  }
};

window.markAllAsRead = function() {
  state.notifications.forEach(n => n.read = true);
  updateNotificationBadge();
  loadNotificationsList();
};

// Chart rendering utility function
window.renderChart = function(canvasId, type, config) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      
      return;
    }
    
    // Destroy existing chart if it exists
    if (window.chartInstances && window.chartInstances[canvasId]) {
      window.chartInstances[canvasId].destroy();
    }
    
    // Initialize chart instances storage
    if (!window.chartInstances) {
      window.chartInstances = {};
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    window.chartInstances[canvasId] = new Chart(ctx, {
      type: type,
      data: config.data || config,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type !== 'bar',
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        ...(config.options || {})
      }
    });
  } catch (error) {
    
  }
};

// Enhanced chart rendering for dashboard
window.renderEnhancedChart = function(canvasId, type, config) {
  return window.renderChart(canvasId, type, config);
};

async function loadDashboard() {
  const content = document.getElementById("main-content");
  
  if (!content) {
    
    return;
  }
  
  // Reset dashboard date range to default (Last 7 Days) when navigating to Dashboard
  if (state && state.filters) {
    state.filters.dateRange = '7d';
  }
  
  content.innerHTML = `<div class="space-y-6">
    <!-- Header with Gradient Background -->
    <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 sm:p-8 text-white shadow-xl">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl sm:text-4xl font-bold mb-2">
            <i class="fas fa-chart-line mr-2 sm:mr-3"></i>Dashboard Overview
          </h1>
          <p class="text-indigo-100 text-sm sm:text-lg">Real-time Business Intelligence • Auto-refresh every 30 minutes</p>
          <div class="flex items-center space-x-4 mt-3">
            <div class="flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <i class="fas fa-sync-alt fa-spin text-green-300"></i>
              <span class="text-sm font-medium">Live Data</span>
            </div>
            <div class="flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <i class="fas fa-calendar text-yellow-300"></i>
              <span id="dashboard-date-range-label" class="text-sm font-medium">${getDateRangeLabel(state.filters.dateRange)}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-3 flex-wrap gap-2">
          <select id="dashboard-date-range" onchange="window.updateFilter('dateRange', this.value); toggleCustomDateInputs('dashboard-date-range', 'dashboard-custom-range-wrap');" class="px-5 py-3 bg-white/90 backdrop-blur text-gray-800 font-semibold rounded-xl shadow-lg focus:ring-4 focus:ring-white/50 transition border-0">
            <option value="1d" ${(state.filters.dateRange || '7d') === '1d' ? 'selected' : ''}>📅 Today</option>
            <option value="7d" ${(state.filters.dateRange || '7d') === '7d' ? 'selected' : ''}>📅 Last 7 Days</option>
            <option value="30d" ${(state.filters.dateRange || '7d') === '30d' ? 'selected' : ''}>📅 Last 30 Days</option>
            <option value="90d" ${(state.filters.dateRange || '7d') === '90d' ? 'selected' : ''}>📅 Last 90 Days</option>
            <option value="custom" ${(state.filters.dateRange || '7d') === 'custom' ? 'selected' : ''}>📅 Custom Range</option>
          </select>
          <div id="dashboard-custom-range-wrap" class="hidden flex items-center gap-2 flex-wrap">
            <label class="text-sm font-medium text-white/90">From</label>
            <input type="date" id="custom-start-date" onchange="loadDashboardData()" class="px-3 py-2 rounded-lg border-0 bg-white/90 text-gray-800 font-medium">
            <label class="text-sm font-medium text-white/90">To</label>
            <input type="date" id="custom-end-date" onchange="loadDashboardData()" class="px-3 py-2 rounded-lg border-0 bg-white/90 text-gray-800 font-medium">
          </div>
        </div>
      </div>
    </div>

    <!-- Main KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-tiles"></div>

    <!-- B2B vs D2C Comparison with Beautiful Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- B2B Performance Card -->
      <div class="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div class="relative p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div>
              <div class="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div class="bg-white/20 backdrop-blur rounded-xl p-2 sm:p-3">
                  <i class="fas fa-building text-white text-xl sm:text-2xl"></i>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-white">B2B Performance</h3>
              </div>
              <p class="text-blue-100 text-sm sm:text-base">Business-to-Business Sales</p>
            </div>
            <div class="text-left sm:text-right w-full sm:w-auto">
              <div class="text-3xl sm:text-4xl font-bold text-white" id="b2b-total">$0</div>
              <div class="text-blue-200 text-xs sm:text-sm mt-1">Total Revenue</div>
            </div>
          </div>
          <div class="space-y-3 bg-white/10 backdrop-blur rounded-xl p-4" id="b2b-metrics"></div>
        </div>
      </div>
      
      <!-- D2C Performance Card -->
      <div class="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition">
        <div class="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div class="relative p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div>
              <div class="flex items-center space-x-2 sm:space-x-3 mb-2">
                <div class="bg-white/20 backdrop-blur rounded-xl p-2 sm:p-3">
                  <i class="fas fa-users text-white text-xl sm:text-2xl"></i>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-white">D2C Performance</h3>
              </div>
              <p class="text-green-100 text-sm sm:text-base">Direct-to-Consumer Sales</p>
            </div>
            <div class="text-left sm:text-right w-full sm:w-auto">
              <div class="text-3xl sm:text-4xl font-bold text-white" id="d2c-total">$0</div>
              <div class="text-green-200 text-xs sm:text-sm mt-1">Total Revenue</div>
            </div>
          </div>
          <div class="space-y-3 bg-white/10 backdrop-blur rounded-xl p-4" id="d2c-metrics"></div>
        </div>
      </div>
    </div>

    <!-- Sales Drop Alerts with Premium Design -->
    <div class="relative overflow-hidden rounded-2xl shadow-xl" id="sales-drop-alerts">
      <div class="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
      <div class="relative p-4 sm:p-8">
        <div class="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <div class="bg-white/20 backdrop-blur rounded-xl p-2 sm:p-3">
            <i class="fas fa-exclamation-triangle text-white text-xl sm:text-2xl"></i>
          </div>
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-white">⚠️ Sales Drop Alerts</h3>
            <p class="text-red-100 text-xs sm:text-base">Customers requiring immediate attention</p>
          </div>
        </div>
        <div id="sales-drop-list" class="space-y-3"></div>
      </div>
    </div>

    <!-- Charts Grid with Premium Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card shadow-xl hover:shadow-2xl transition rounded-2xl border-0">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-chart-line text-indigo-600 mr-2"></i>Sales Timeline
          </h3>
          <span id="sales-timeline-range-label" class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg">${getDateRangeShortLabel(state.filters.dateRange)}</span>
        </div>
        <div id="sales-timeline-chart-container" class="relative w-full" style="min-height: 300px; max-height: 400px;"><canvas id="sales-timeline-chart"></canvas></div>
      </div>
      
      <div class="card shadow-xl hover:shadow-2xl transition rounded-2xl border-0">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-chart-pie text-purple-600 mr-2"></i>Revenue Breakdown
          </h3>
          <span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg">
            By Source
          </span>
        </div>
        <div id="service-breakdown-chart-container" class="relative w-full" style="min-height: 300px; max-height: 400px;"><canvas id="service-breakdown-chart"></canvas></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card shadow-xl hover:shadow-2xl transition rounded-2xl border-0">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-signal text-blue-600 mr-2"></i>Top 10 Carriers
          </h3>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
            By Revenue
          </span>
        </div>
        <div id="carrier-chart-container" class="relative w-full" style="min-height: 300px; max-height: 400px;"><canvas id="carrier-chart"></canvas></div>
      </div>
      
      <div class="card shadow-xl hover:shadow-2xl transition rounded-2xl border-0">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-credit-card text-green-600 mr-2"></i>Payment Methods
          </h3>
          <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
            By Revenue
          </span>
        </div>
        <div id="payment-methods-chart-container" class="relative w-full" style="min-height: 300px; max-height: 400px;"><canvas id="payment-methods-chart"></canvas></div>
      </div>
    </div>
  </div>`;
  
  
  
  try {
    await loadDashboardData();
    
    
    // Start auto-refresh every 30 minutes
    if (window.dashboardRefreshInterval) clearInterval(window.dashboardRefreshInterval);
    window.dashboardRefreshInterval = setInterval(() => {
      
      loadDashboardData();
    }, 30 * 60 * 1000); // 30 minutes
    
  } catch (e) {
    
  }
}

function showDashboardLoadingState() {
  const spinnerHtml = '<div class="flex flex-col items-center justify-center gap-2 min-h-[120px] text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><span class="text-sm">Loading...</span></div>';
  const chartSpinnerHtml = '<div class="flex flex-col items-center justify-center gap-2 min-h-[280px] text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><span class="text-sm">Loading...</span></div>';
  const el = (id) => document.getElementById(id);
  if (el('kpi-tiles')) {
    el('kpi-tiles').innerHTML = [1, 2, 3, 4].map(() =>
      `<div class="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[140px]">${spinnerHtml}</div>`
    ).join('');
  }
  if (el('b2b-metrics')) el('b2b-metrics').innerHTML = `<div class="flex items-center justify-center min-h-[100px] text-white/80"><i class="fas fa-spinner fa-spin text-xl"></i><span class="ml-2 text-sm">Loading...</span></div>`;
  if (el('b2b-total')) el('b2b-total').textContent = '...';
  if (el('d2c-metrics')) el('d2c-metrics').innerHTML = `<div class="flex items-center justify-center min-h-[100px] text-white/80"><i class="fas fa-spinner fa-spin text-xl"></i><span class="ml-2 text-sm">Loading...</span></div>`;
  if (el('d2c-total')) el('d2c-total').textContent = '...';
  if (el('sales-drop-list')) el('sales-drop-list').innerHTML = `<div class="flex items-center justify-center py-8 text-white/90"><i class="fas fa-spinner fa-spin text-xl"></i><span class="ml-2">Loading...</span></div>`;
  if (el('sales-timeline-chart-container')) el('sales-timeline-chart-container').innerHTML = chartSpinnerHtml;
  if (el('service-breakdown-chart-container')) el('service-breakdown-chart-container').innerHTML = chartSpinnerHtml;
  if (el('carrier-chart-container')) el('carrier-chart-container').innerHTML = chartSpinnerHtml;
  if (el('payment-methods-chart-container')) el('payment-methods-chart-container').innerHTML = chartSpinnerHtml;
}

async function loadDashboardData() {
  try {
    showDashboardLoadingState();
    let kpis = null;
    let kpisError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const res = await window.fetchDashboardMetrics(startDate, endDate);
      if (res && typeof res.totalRevenue === 'number') {
        kpis = {
          totalVolume: { value: res.totalRevenue, change: res.totalRevenueChangePercent ?? 0 },
          totalTransactions: { value: res.totalTxns ?? 0, change: res.totalTxnsChangePercent ?? 0 },
          avgTicket: { value: res.avgTicket ?? 0, change: res.avgTicketChangePercent ?? 0 },
          successRate: { value: res.successRate ?? 0, change: res.successRateChangePercent ?? 0 }
        };
      }
    } catch (err) {
      kpisError = err;
    }

    let b2bData = null;
    let b2bError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const res = await window.fetchB2BPerformance(startDate, endDate);
      if (res && typeof res.totalRevenue === 'number') {
        b2bData = {
          totalSales: res.totalRevenue,
          customers: res.totalCustomers ?? 0,
          avgTicket: res.avgTicket ?? 0,
          growth: res.revenueGrowth ?? 0
        };
      }
    } catch (err) {
      b2bError = err;
    }

    let d2cData = null;
    let d2cError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const res = await window.fetchD2CPerformance(startDate, endDate);
      if (res && typeof res.totalRevenue === 'number') {
        d2cData = {
          totalSales: res.totalRevenue,
          transactions: res.totalTxns ?? 0,
          avgTicket: res.avgTicket ?? 0,
          growth: res.revenueGrowth ?? 0
        };
      }
    } catch (err) {
      d2cError = err;
    }

    let salesDropAlerts = [];
    let salesDropError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const data = await window.fetchSalesDropAlerts(startDate, endDate);
      if (Array.isArray(data)) {
        salesDropAlerts = data;
      }
    } catch (err) {
      salesDropError = err;
    }
    
    const breakdownContainer = document.getElementById('service-breakdown-chart-container');
    let breakdown = null;
    let breakdownError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const data = await window.fetchRevenueBreakdown(startDate, endDate);
      if (data && Array.isArray(data.labels) && Array.isArray(data.datasets) && data.datasets.length > 0) {
        breakdown = data;
      }
    } catch (err) {
      breakdownError = err;
    }
    if (breakdownContainer) {
      if (breakdown) {
        if (!document.getElementById('service-breakdown-chart')) {
          breakdownContainer.innerHTML = '<canvas id="service-breakdown-chart"></canvas>';
        }
        const minSegmentPercent = 2;
        const ds = breakdown.datasets[0];
        const rawData = ds.data.slice();
        const total = rawData.reduce((a, v) => a + (Number(v) || 0), 0) || 1;
        const displayData = rawData.map(v => Math.max((Number(v) || 0) / total * 100, minSegmentPercent));
        const chartConfig = {
          labels: breakdown.labels.slice(),
          datasets: [{
            label: ds.label,
            data: displayData,
            backgroundColor: ds.backgroundColor || [],
            _rawData: rawData
          }],
          options: {
            plugins: {
              legend: {
                display: true,
                position: 'bottom'
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    const raw = context.dataset._rawData;
                    const value = (raw && raw[context.dataIndex]) != null ? raw[context.dataIndex] : context.parsed;
                    const label = context.label || '';
                    return label + ': $' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  }
                }
              }
            }
          }
        };
        renderEnhancedChart('service-breakdown-chart', 'doughnut', chartConfig);
      } else {
        const msg = breakdownError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(breakdownError) : 'Unable to load revenue breakdown data. Please try again.';
        const is403 = breakdownError && breakdownError.response && breakdownError.response.status === 403;
        breakdownContainer.innerHTML = `
          <div class="flex items-center justify-center h-full min-h-[280px] ${is403 ? 'text-amber-700' : 'text-red-600'}">
            <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
          </div>
        `;
      }
    }

    // Render Premium KPI Cards
    renderBeautifulKPIs(kpis, kpisError);
    
    // Render B2B & D2C with premium styling
    renderBeautifulB2BD2C(b2bData, d2cData, b2bError, d2cError);
    
    // Render Sales Drop Alerts
    renderSalesDropAlerts(salesDropAlerts, salesDropError);
    
    // Render Charts - Sales Timeline (daily sales API)
    const salesTimelineContainer = document.getElementById('sales-timeline-chart-container');
    let timeline = null;
    let timelineError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const data = await window.fetchDailySales(startDate, endDate);
      if (Array.isArray(data) && data.length > 0) {
        timeline = data;
      }
    } catch (err) {
      timelineError = err;
    }
    if (salesTimelineContainer) {
      if (timeline) {
        if (!document.getElementById('sales-timeline-chart')) {
          salesTimelineContainer.innerHTML = '<canvas id="sales-timeline-chart"></canvas>';
        }
        renderEnhancedChart('sales-timeline-chart', 'line', {
          labels: timeline.map(t => t.date),
          datasets: [{
            label: 'Daily Revenue',
            data: timeline.map(t => t.volume),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          }]
        });
      } else {
        const msg = timelineError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(timelineError) : 'Unable to load daily sales data. Please try again.';
        const is403 = timelineError && timelineError.response && timelineError.response.status === 403;
        salesTimelineContainer.innerHTML = `
          <div class="flex items-center justify-center h-full min-h-[280px] ${is403 ? 'text-amber-700' : 'text-red-600'}">
            <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
          </div>
        `;
      }
    }

    const carrierChartContainer = document.getElementById('carrier-chart-container');
    let carriers = null;
    let carriersError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const data = await window.fetchTopCarriers(startDate, endDate);
      if (data && Array.isArray(data.labels) && Array.isArray(data.datasets) && data.datasets.length > 0) {
        carriers = data;
      }
    } catch (err) {
      carriersError = err;
    }
    if (carrierChartContainer) {
      if (carriers) {
        if (!document.getElementById('carrier-chart')) {
          carrierChartContainer.innerHTML = '<canvas id="carrier-chart"></canvas>';
        }
        renderEnhancedChart('carrier-chart', 'bar', carriers);
      } else {
        const msg = carriersError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(carriersError) : 'Unable to load top carriers data. Please try again.';
        const is403 = carriersError && carriersError.response && carriersError.response.status === 403;
        carrierChartContainer.innerHTML = `
          <div class="flex items-center justify-center h-full min-h-[280px] ${is403 ? 'text-amber-700' : 'text-red-600'}">
            <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
          </div>
        `;
      }
    }

    const paymentMethodsContainer = document.getElementById('payment-methods-chart-container');
    let payments = null;
    let paymentsError = null;
    try {
      const dateRange = state.filters.dateRange || '7d';
      const { startDate, endDate } = getReportDateRange(dateRange);
      const data = await window.fetchPaymentMethods(startDate, endDate);
      if (data && Array.isArray(data.labels) && Array.isArray(data.datasets) && data.datasets.length > 0) {
        payments = data;
      }
    } catch (err) {
      paymentsError = err;
    }
    if (paymentMethodsContainer) {
      if (payments) {
        if (!document.getElementById('payment-methods-chart')) {
          paymentMethodsContainer.innerHTML = '<canvas id="payment-methods-chart"></canvas>';
        }
        renderEnhancedChart('payment-methods-chart', 'bar', payments);
      } else {
        const msg = paymentsError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(paymentsError) : 'Unable to load payment methods data. Please try again.';
        const is403 = paymentsError && paymentsError.response && paymentsError.response.status === 403;
        paymentMethodsContainer.innerHTML = `
          <div class="flex items-center justify-center h-full min-h-[280px] ${is403 ? 'text-amber-700' : 'text-red-600'}">
            <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
          </div>
        `;
      }
    }

    const dateRange = state.filters.dateRange || '7d';
    const rangeLabelEl = document.getElementById('dashboard-date-range-label');
    if (rangeLabelEl) rangeLabelEl.textContent = getDateRangeLabel(dateRange);
    const timelineRangeEl = document.getElementById('sales-timeline-range-label');
    if (timelineRangeEl) timelineRangeEl.textContent = getDateRangeShortLabel(dateRange);

  } catch (e) {
    
  }
}

function renderBeautifulKPIs(kpis, err) {
  const container = document.getElementById('kpi-tiles');
  if (!container) return;
  if (!kpis) {
    const msg = err && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : 'Unable to load metrics. Please try again.';
    const is403 = err && err.response && err.response.status === 403;
    container.innerHTML = `
      <div class="col-span-full flex items-center justify-center p-6 ${is403 ? 'text-amber-700 rounded-2xl bg-amber-50 border border-amber-200' : 'text-red-600 rounded-2xl bg-red-50 border border-red-200'}">
        <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
      </div>
    `;
    return;
  }

  const kpiConfig = [
    { 
      key: 'totalVolume', 
      icon: 'fa-dollar-sign', 
      label: 'Total Revenue', 
      color: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500',
      prefix: '$',
      format: (v) => (v / 1000000).toFixed(2) + 'M'
    },
    { 
      key: 'totalTransactions', 
      icon: 'fa-exchange-alt', 
      label: 'Total Transactions', 
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-500',
      format: (v) => v.toLocaleString()
    },
    { 
      key: 'avgTicket', 
      icon: 'fa-ticket-alt', 
      label: 'Average Ticket', 
      color: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500',
      prefix: '$',
      format: (v) => v.toFixed(2)
    },
    { 
      key: 'successRate', 
      icon: 'fa-check-circle', 
      label: 'Success Rate', 
      color: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-500',
      suffix: '%',
      format: (v) => v.toFixed(1)
    }
  ];
  
  container.innerHTML = kpiConfig.map(config => {
    const data = kpis[config.key];
    const value = data.value;
    const change = data.change;
    const isPositive = change >= 0;
    const formattedValue = config.format(value);
    const displayValue = `${config.prefix || ''}${formattedValue}${config.suffix || ''}`;
    
    return `
      <div class="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-br ${config.color}"></div>
        <div class="relative p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="${config.iconBg} rounded-xl p-3 shadow-lg">
              <i class="fas ${config.icon} text-white text-2xl"></i>
            </div>
            <span class="px-3 py-1 ${isPositive ? 'bg-green-400' : 'bg-red-400'} text-white text-sm font-bold rounded-full shadow-lg">
              <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'} mr-1"></i>${Math.abs(change)}%
            </span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${displayValue}</div>
          <div class="text-sm text-white/80 font-medium">${config.label}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderBeautifulB2BD2C(b2b, d2c, b2bError, d2cError) {
  // B2B Metrics
  const b2bContainer = document.getElementById('b2b-metrics');
  const b2bTotal = document.getElementById('b2b-total');
  if (!b2b) {
    const msg = b2bError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(b2bError) : 'Unable to load B2B performance data. Please try again.';
    const is403 = b2bError && b2bError.response && b2bError.response.status === 403;
    if (b2bContainer) {
      b2bContainer.innerHTML = `
        <div class="flex items-center justify-center p-4 text-white/90">
          <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
        </div>
      `;
    }
    if (b2bTotal) b2bTotal.textContent = '—';
  } else {
    if (b2bContainer) {
      b2bContainer.innerHTML = `
        <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
          <span class="text-white font-semibold"><i class="fas fa-users mr-2"></i>Customers</span>
          <span class="text-white text-xl font-bold">${b2b.customers}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
          <span class="text-white font-semibold"><i class="fas fa-ticket-alt mr-2"></i>Avg Ticket</span>
          <span class="text-white text-xl font-bold">$${Number(b2b.avgTicket).toLocaleString()}</span>
        </div>
        <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
          <span class="text-white font-semibold"><i class="fas fa-chart-line mr-2"></i>Growth</span>
          <span class="${(b2b.growth >= 0 ? 'text-green-300' : 'text-red-300')} text-xl font-bold"><i class="fas fa-${b2b.growth >= 0 ? 'arrow-up' : 'arrow-down'} mr-1"></i>${Math.abs(Number(b2b.growth))}%</span>
        </div>
      `;
    }
    if (b2bTotal) {
      b2bTotal.textContent = '$' + (b2b.totalSales / 1000000).toFixed(2) + 'M';
    }
  }

  // D2C Metrics
  const d2cContainer = document.getElementById('d2c-metrics');
  const d2cTotal = document.getElementById('d2c-total');
  if (!d2c) {
    const msg = d2cError && typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(d2cError) : 'Unable to load D2C performance data. Please try again.';
    const is403 = d2cError && d2cError.response && d2cError.response.status === 403;
    if (d2cContainer) {
      d2cContainer.innerHTML = `
        <div class="flex items-center justify-center p-4 text-white/90">
          <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
        </div>
      `;
    }
    if (d2cTotal) d2cTotal.textContent = '—';
    return;
  }
  if (d2cContainer) {
    d2cContainer.innerHTML = `
      <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
        <span class="text-white font-semibold"><i class="fas fa-shopping-cart mr-2"></i>Transactions</span>
        <span class="text-white text-xl font-bold">${d2c.transactions.toLocaleString()}</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
        <span class="text-white font-semibold"><i class="fas fa-ticket-alt mr-2"></i>Avg Ticket</span>
        <span class="text-white text-xl font-bold">$${Number(d2c.avgTicket).toFixed(2)}</span>
      </div>
      <div class="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
        <span class="text-white font-semibold"><i class="fas fa-chart-line mr-2"></i>Growth</span>
        <span class="${(d2c.growth >= 0 ? 'text-green-300' : 'text-red-300')} text-xl font-bold"><i class="fas fa-${d2c.growth >= 0 ? 'arrow-up' : 'arrow-down'} mr-1"></i>${Math.abs(Number(d2c.growth))}%</span>
      </div>
    `;
  }
  if (d2cTotal) {
    d2cTotal.textContent = '$' + (d2c.totalSales / 1000).toFixed(0) + 'K';
  }
}

function renderSalesDropAlerts(alerts, err) {
  const container = document.getElementById('sales-drop-list');
  if (!container) return;
  if (err) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : 'Unable to load sales drop alerts. Please try again.';
    const is403 = err.response && err.response.status === 403;
    container.innerHTML = `
      <div class="flex items-center justify-center py-8 text-white/90">
        <p>${(msg || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}</p>
      </div>
    `;
    return;
  }
  if (!alerts || alerts.length === 0) {
    container.innerHTML = `
      <div class="flex items-center justify-center py-8 text-white/90">
        <p>No sales drop alerts for the selected period.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = alerts.map(alert => `
    <div class="bg-white/90 backdrop-blur rounded-xl p-5 shadow-lg hover:shadow-xl transition border-l-4 border-red-600">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <h4 class="text-lg font-bold text-gray-900">${alert.customer}</h4>
            <span class="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
              <i class="fas fa-arrow-down mr-1"></i>${Math.abs(alert.drop)}% Drop
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Previous:</span>
              <span class="font-semibold text-gray-900 ml-2">$${alert.previousSales.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-gray-600">Current:</span>
              <span class="font-semibold text-red-600 ml-2">$${alert.currentSales.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <button 
          onclick="window.sendDropEmail('${alert.customer}', '${alert.email}', ${alert.drop}, ${alert.previousSales}, ${alert.currentSales})"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition transform">
          <i class="fas fa-envelope mr-2"></i>Send Email
        </button>
      </div>
    </div>
  `).join('');
}

// Send email for sales drop alerts
window.sendDropEmail = function(customer, email, dropPercent, previousSales, currentSales) {
  const subject = `Sales Alert: ${customer} - ${Math.abs(dropPercent)}% Drop`;
  const body = `Dear ${customer} Team,

We noticed a significant drop in sales activity and wanted to reach out.

Sales Performance:
• Previous Period: $${previousSales.toLocaleString()}
• Current Period: $${currentSales.toLocaleString()}
• Change: ${dropPercent}% decrease

We value your partnership and would like to understand if there are any issues we can help address or opportunities to better support your business.

Could we schedule a quick call to discuss?

Best regards,
CellPay Team`;

  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Try to open email client
  try {
    window.location.href = mailtoLink;
    addNotification('success', 'Email Draft Created', `Email template prepared for ${customer}`);
  } catch (error) {
    
    addNotification('error', 'Email Failed', 'Could not open email client');
  }
};

async function loadAnalytics() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        <i class="fas fa-chart-bar mr-2"></i>Analytics Dashboard
      </h1>
      <div class="flex space-x-2">
        <button onclick="exportAnalytics('csv')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <i class="fas fa-file-csv mr-2"></i>Export CSV
        </button>
        <button onclick="exportAnalytics('pdf')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <i class="fas fa-file-pdf mr-2"></i>Export PDF
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        <i class="fas fa-filter mr-2"></i>Filters
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select id="analytics-date-range" onchange="toggleCustomDateInputs('analytics-date-range', 'analytics-custom-range-wrap'); loadAnalyticsData();" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="7d" selected>Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
            <option value="custom">Custom Range</option>
          </select>
          <div id="analytics-custom-range-wrap" class="hidden mt-2 grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" id="custom-start-date" onchange="loadAnalyticsData()" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" id="custom-end-date" onchange="loadAnalyticsData()" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select id="analytics-product" onchange="loadAnalyticsData()" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Products</option>
            <option value="1">Airtime</option>
            <option value="2">Bill Payment</option>
            <option value="3">Gift Cards</option>
            <option value="4">Crypto</option>
            <option value="5">Money Transfer</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
          <select id="analytics-customer-type" onchange="loadAnalyticsData()" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Customers</option>
            <option value="b2b">B2B Only</option>
            <option value="d2c">D2C Only</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- KPI Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-sm opacity-90 mb-1">Total Revenue</div>
        <div class="text-3xl font-bold" id="analytics-revenue">$0</div>
        <div class="text-xs opacity-75 mt-2" id="analytics-revenue-change">+0%</div>
      </div>
      <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div class="text-sm opacity-90 mb-1">Transactions</div>
        <div class="text-3xl font-bold" id="analytics-transactions">0</div>
        <div class="text-xs opacity-75 mt-2" id="analytics-transactions-change">+0%</div>
      </div>
      <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="text-sm opacity-90 mb-1">Avg Ticket Size</div>
        <div class="text-3xl font-bold" id="analytics-avg-ticket">$0</div>
        <div class="text-xs opacity-75 mt-2" id="analytics-avg-ticket-change">+0%</div>
      </div>
      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="text-sm opacity-90 mb-1">Commission Earned</div>
        <div class="text-3xl font-bold" id="analytics-commission">$0</div>
        <div class="text-xs opacity-75 mt-2" id="analytics-commission-change">+0%</div>
      </div>
    </div>
    
    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fas fa-chart-line text-blue-600 mr-2"></i>Revenue Trend
        </h3>
        <div id="analytics-revenue-chart-container" style="height: 300px;"><canvas id="analytics-revenue-chart"></canvas></div>
      </div>
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fas fa-chart-bar text-green-600 mr-2"></i>Transaction Volume
        </h3>
        <div id="analytics-transactions-chart-container" style="height: 300px;"><canvas id="analytics-transactions-chart"></canvas></div>
      </div>
    </div>
    
    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fas fa-chart-pie text-purple-600 mr-2"></i>Product Mix
        </h3>
        <div id="analytics-product-chart-container" style="height: 300px;"><canvas id="analytics-product-chart"></canvas></div>
      </div>
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fas fa-users text-orange-600 mr-2"></i>Top Customers
        </h3>
        <div id="analytics-customers-chart-container" style="height: 300px;"><canvas id="analytics-customers-chart"></canvas></div>
      </div>
    </div>
    
    <!-- Comparison Table -->
    <div class="card">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        <i class="fas fa-table text-indigo-600 mr-2"></i>Period Comparison
      </h3>
      <div class="overflow-x-auto">
        <table class="min-w-full" id="analytics-comparison-table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Period</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Period</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
            </tr>
          </thead>
          <tbody id="analytics-comparison-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>`;
  
  // Load analytics data
  loadAnalyticsData();
}

// Analytics Data Loading
window.loadAnalyticsData = async function() {
  const dateRange = document.getElementById('analytics-date-range')?.value || '7d';
  const product = document.getElementById('analytics-product')?.value || 'all';
  const customerType = document.getElementById('analytics-customer-type')?.value || 'all';
  const { startDate, endDate } = getReportDateRange(dateRange);

  // Show basic loading state in KPI texts while fetching
  const revenueEl = document.getElementById('analytics-revenue');
  const revenueChangeEl = document.getElementById('analytics-revenue-change');
  const txnEl = document.getElementById('analytics-transactions');
  const txnChangeEl = document.getElementById('analytics-transactions-change');
  const avgEl = document.getElementById('analytics-avg-ticket');
  const avgChangeEl = document.getElementById('analytics-avg-ticket-change');
  const commEl = document.getElementById('analytics-commission');
  const commChangeEl = document.getElementById('analytics-commission-change');

  if (revenueEl) revenueEl.textContent = '...';
  if (revenueChangeEl) revenueChangeEl.textContent = '';
  if (txnEl) txnEl.textContent = '...';
  if (txnChangeEl) txnChangeEl.textContent = '';
  if (avgEl) avgEl.textContent = '...';
  if (avgChangeEl) avgChangeEl.textContent = '';
  if (commEl) commEl.textContent = '...';
  if (commChangeEl) commChangeEl.textContent = '';

  const chartSpinnerHtml = '<div class="flex items-center justify-center h-full text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i><span class="ml-2 text-sm">Loading...</span></div>';
  const revContainer = document.getElementById('analytics-revenue-chart-container');
  const txnContainer = document.getElementById('analytics-transactions-chart-container');
  const prodContainer = document.getElementById('analytics-product-chart-container');
  const custContainer = document.getElementById('analytics-customers-chart-container');
  if (revContainer) revContainer.innerHTML = chartSpinnerHtml;
  if (txnContainer) txnContainer.innerHTML = chartSpinnerHtml;
  if (prodContainer) prodContainer.innerHTML = chartSpinnerHtml;
  if (custContainer) custContainer.innerHTML = chartSpinnerHtml;

  try {
    const [
      metrics,
      revenueTrendRes,
      transactionsTrendRes,
      productMixRes,
      topCustomersRes,
      periodComparisonRes
    ] = await Promise.all([
      window.fetchAnalyticsMetrics(startDate, endDate, product, customerType),
      window.fetchAnalyticsRevenueTrend(startDate, endDate, product, customerType),
      window.fetchAnalyticsTransactionTrend(startDate, endDate, product, customerType),
      window.fetchAnalyticsProductMix(startDate, endDate, product, customerType),
      window.fetchAnalyticsTopCustomers(startDate, endDate, product, customerType, 5),
      window.fetchAnalyticsPeriodComparison(startDate, endDate, product, customerType)
    ]);

    const analyticsData = {
      kpis: {
        revenue: {
          current: metrics?.totalRevenue ?? 0,
          previous: 0,
          change: metrics?.totalRevenueChangePercent ?? 0
        },
        transactions: {
          current: metrics?.totalTransactions ?? 0,
          previous: 0,
          change: metrics?.totalTransactionsChangePercent ?? 0
        },
        avgTicket: {
          current: metrics?.averageTicketSize ?? 0,
          previous: 0,
          change: metrics?.averageTicketSizeChangePercent ?? 0
        },
        commission: {
          current: metrics?.totalCommission ?? 0,
          previous: 0,
          change: metrics?.totalCommissionChangePercent ?? 0
        }
      },
      revenueTrend: revenueTrendRes?.revenueTrend ?? { labels: [], data: [] },
      transactionsTrend: transactionsTrendRes?.transactionsTrend ?? { labels: [], data: [] },
      productMix: productMixRes?.productMix ?? { labels: [], data: [] },
      topCustomers: topCustomersRes?.topCustomers ?? { labels: [], data: [] },
      comparison: Array.isArray(periodComparisonRes?.comparison) ? periodComparisonRes.comparison : []
    };

    // Update KPIs
    if (revenueEl) {
      revenueEl.textContent = `$${(analyticsData.kpis.revenue.current / 1000).toFixed(0)}K`;
      if (revenueChangeEl) {
        const ch = analyticsData.kpis.revenue.change ?? 0;
        revenueChangeEl.textContent = `${ch >= 0 ? '+' : ''}${ch}% vs previous`;
      }
    }
    if (txnEl) {
      txnEl.textContent = analyticsData.kpis.transactions.current.toLocaleString();
      if (txnChangeEl) {
        const ch = analyticsData.kpis.transactions.change ?? 0;
        txnChangeEl.textContent = `${ch >= 0 ? '+' : ''}${ch}% vs previous`;
      }
    }
    if (avgEl) {
      avgEl.textContent = `$${analyticsData.kpis.avgTicket.current.toFixed(2)}`;
      if (avgChangeEl) {
        const ch = analyticsData.kpis.avgTicket.change ?? 0;
        avgChangeEl.textContent = `${ch >= 0 ? '+' : ''}${ch}% vs previous`;
      }
    }
    if (commEl) {
      commEl.textContent = `$${(analyticsData.kpis.commission.current / 1000).toFixed(1)}K`;
      if (commChangeEl) {
        const ch = analyticsData.kpis.commission.change ?? 0;
        commChangeEl.textContent = `${ch >= 0 ? '+' : ''}${ch}% vs previous`;
      }
    }

    // Ensure canvases exist for charts (replace spinner)
    if (revContainer) revContainer.innerHTML = '<canvas id="analytics-revenue-chart"></canvas>';
    if (txnContainer) txnContainer.innerHTML = '<canvas id="analytics-transactions-chart"></canvas>';
    if (prodContainer) prodContainer.innerHTML = '<canvas id="analytics-product-chart"></canvas>';
    if (custContainer) custContainer.innerHTML = '<canvas id="analytics-customers-chart"></canvas>';

    // Render charts
    renderAnalyticsCharts(analyticsData);

    // Render comparison table
    renderComparisonTable(analyticsData.comparison);
  } catch (error) {
    const message = (typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(error) : (error.response?.data?.message || error.message || 'Unable to load analytics data. Please try again.'));
    const is403 = error.response && error.response.status === 403;
    const tbody = document.getElementById('analytics-comparison-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="px-4 py-3 text-sm ${is403 ? 'text-amber-700' : 'text-red-600'}">
            ${(message || '').replace(/</g, '&lt;')}${is403 ? ' Contact your administrator if you need access.' : ''}
          </td>
        </tr>
      `;
    }
  }
};

function renderAnalyticsCharts(data) {
  // Revenue Trend Chart - renderChart(canvasId, type, config)
  renderChart('analytics-revenue-chart', 'line', {
    data: {
      labels: data.revenueTrend.labels || [],
      datasets: [{
        label: 'Revenue ($)',
        data: data.revenueTrend.data || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) { return '$' + (value / 1000) + 'K'; }
          }
        }
      }
    }
  });

  // Transactions Chart
  renderChart('analytics-transactions-chart', 'bar', {
    data: {
      labels: data.transactionsTrend.labels || [],
      datasets: [{
        label: 'Transactions',
        data: data.transactionsTrend.data || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });

  // Product Mix Chart
  renderChart('analytics-product-chart', 'doughnut', {
    data: {
      labels: data.productMix.labels || [],
      datasets: [{
        data: data.productMix.data || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // Top Customers Chart
  renderChart('analytics-customers-chart', 'bar', {
    data: {
      labels: data.topCustomers.labels || [],
      datasets: [{
        label: 'Revenue ($)',
        data: data.topCustomers.data || [],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: {
            callback: function(value) { return '$' + (value / 1000) + 'K'; }
          }
        }
      }
    }
  });
}

function renderComparisonTable(data) {
  const tbody = document.getElementById('analytics-comparison-tbody');
  tbody.innerHTML = data.map(row => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3 font-medium text-gray-900">${row.metric}</td>
      <td class="px-4 py-3 text-gray-900">${row.current}</td>
      <td class="px-4 py-3 text-gray-500">${row.previous}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 text-xs rounded-full ${row.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${row.change}
        </span>
      </td>
    </tr>
  `).join('');
}

window.exportAnalytics = function(format) {
  addNotification('success', 'Export Started', `Exporting analytics data to ${format.toUpperCase()}...`);
  // API Ready: GET /api/analytics/export?format=csv or pdf
  
};

window.loadCustomers = async function() {
  // Redirect to CRM page (B2B Customers tab)
  
  navigateTo('crm');
}

window.viewCustomer = async function(id) {
  window.navigateTo('customer-detail', {customerId: id});
}

async function loadCustomerDetail(customerId) {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6"><div id="customer-detail"></div></div>`;
  try {
    const {data: customer} = await api.get(`/customers/${customerId}`);
    const {data: dropAnalysis} = await api.get(`/customers/${id}/drop-analysis`);
    document.getElementById("customer-detail").innerHTML = `
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">${customer.name}</h1>
        <button onclick="loadCustomers()" class="px-4 py-2 bg-gray-200 rounded-lg"><i class="fas fa-arrow-left mr-2"></i>Back</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card"><div class="text-sm text-gray-500">Total Volume</div><div class="text-2xl font-bold">$${(customer.total_volume || 0).toFixed(2)}</div></div>
        <div class="card"><div class="text-sm text-gray-500">Transactions</div><div class="text-2xl font-bold">${customer.transaction_count || 0}</div></div>
        <div class="card"><div class="text-sm text-gray-500">Avg Ticket</div><div class="text-2xl font-bold">$${(customer.avg_ticket || 0).toFixed(2)}</div></div>
        <div class="card"><div class="text-sm text-gray-500">Success Rate</div><div class="text-2xl font-bold">${(customer.success_rate || 0).toFixed(1)}%</div></div>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-4"><i class="fas fa-chart-line mr-2"></i>Drop Detector - Top Drivers</h3>
        <div class="space-y-3">
          ${dropAnalysis.top_drivers.map(d => `<div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div><div class="font-medium">${d.name}</div><div class="text-sm text-gray-500">${d.count} transactions</div></div>
            <div class="text-right"><div class="text-lg font-bold text-red-600">${d.fail_rate.toFixed(1)}%</div><div class="text-sm text-gray-500">${d.failures} failures</div></div>
          </div>`).join("") || '<p class="text-gray-500">No drop detected</p>'}
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Stores</h3>
          <div class="space-y-2">
            ${customer.stores.map(s => `<div class="p-3 border rounded"><div class="font-medium">${s.store_name}</div><div class="text-sm text-gray-500">MID: ${s.mid}</div></div>`).join("") || '<p class="text-gray-500">No stores</p>'}
          </div>
        </div>
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div class="space-y-2">
            ${customer.recent_transactions.slice(0,5).map(t => `<div class="p-3 border rounded flex justify-between">
              <div><div class="font-medium">$${t.amount.toFixed(2)}</div><div class="text-sm text-gray-500">${t.carrier_name}</div></div>
              <span class="px-2 py-1 rounded text-xs ${t.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}">${t.status}</span>
            </div>`).join("") || '<p class="text-gray-500">No transactions</p>'}
          </div>
        </div>
      </div>
    `;
  } catch (e) {}
};

async function loadTasks() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
    <div id="tasks-loading" class="text-gray-500">Loading...</div>
    <div id="tasks-content" class="hidden space-y-4"></div>
  </div>`;
  try {
    const data = await window.fetchTasks();
    const loading = document.getElementById("tasks-loading");
    const container = document.getElementById("tasks-content");
    loading.classList.add("hidden");
    container.classList.remove("hidden");
    const hasAll = Array.isArray(data.all);
    const tabs = [
      { key: 'assignedToMe', label: 'Assigned to me' },
      { key: 'openedByMe', label: 'Opened by me' }
    ];
    if (hasAll) tabs.push({ key: 'all', label: 'All' });
    const activeTab = state.tasksActiveTab || 'assignedToMe';
    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex space-x-2 flex-wrap">
          ${tabs.map(t => `
            <button type="button" class="task-tab px-4 py-2 rounded-lg ${t.key === activeTab ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-tab="${t.key}">${escapeHtml(t.label)}</button>
          `).join('')}
        </div>
        ${hasPermission('addTask') ? `<button type="button" onclick="openCreateTaskModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><i class="fas fa-plus mr-2"></i>Create task</button>` : ''}
      </div>
      <div class="card"><div id="tasks-list"></div></div>
    `;
    state.tasksBucketedData = data;
    container.querySelectorAll('.task-tab').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        state.tasksActiveTab = tab;
        loadTasks();
      });
    });
    const list = data[activeTab] || [];
    const listEl = document.getElementById("tasks-list");
    listEl.innerHTML = list.length ? list.map(t => {
      const stateClass = t.state === 'COMPLETED' ? 'bg-green-100 text-green-800' : t.state === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : t.state === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
      return `<div class="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50" data-task-id="${t.id}" role="button">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-medium">${escapeHtml(t.title)}</div>
            ${t.description ? `<div class="text-sm text-gray-500 mt-1">${escapeHtml(t.description)}</div>` : ''}
            <div class="flex items-center flex-wrap gap-x-3 mt-2 text-xs text-gray-500">
              <span><i class="fas fa-user mr-1"></i>${escapeHtml(t.assigneeName || '—')}</span>
              <span><i class="fas fa-user-edit mr-1"></i>${escapeHtml(t.creatorName || '—')}</span>
              <span><i class="fas fa-calendar mr-1"></i>${formatIsoDate(t.createdAt)}</span>
            </div>
          </div>
          <span class="px-3 py-1 rounded text-xs ${stateClass}">${escapeHtml(taskStateLabel(t.state))}</span>
        </div>
      </div>`;
    }).join('') : '<p class="text-center text-gray-500 py-8">No tasks in this view</p>';
    listEl.querySelectorAll('[data-task-id]').forEach(row => {
      row.addEventListener('click', function() {
        const id = this.getAttribute('data-task-id');
        if (id) window.navigateTo('task-detail', { id: id });
      });
    });
  } catch (err) {
    document.getElementById("tasks-loading").classList.add("hidden");
    document.getElementById("tasks-content").classList.remove("hidden");
    document.getElementById("tasks-content").innerHTML = getApiErrorDisplay(err, { title: 'Error loading tasks' });
  }
}

window.openCreateTaskModal = function() {
  const modal = document.getElementById('create-task-modal');
  if (modal) { modal.classList.remove('hidden'); return; }
  const div = document.createElement('div');
  div.id = 'create-task-modal';
  div.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  div.setAttribute('role', 'dialog');
  div.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
      <div class="p-4 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">Create task</h2>
        <button type="button" onclick="closeCreateTaskModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
      </div>
      <form id="create-task-form" class="p-6 space-y-4">
        <div id="create-task-error" class="hidden text-red-600 text-sm"></div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" id="create-task-title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Task title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="create-task-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Optional"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assign to *</label>
          <select id="create-task-assignee" required class="w-full px-3 py-2 border border-gray-300 rounded-lg"></select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeCreateTaskModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" id="create-task-submit-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
        </div>
      </form>
    </div>
  `;
  div.addEventListener('click', function(e) { if (e.target === div) closeCreateTaskModal(); });
  document.body.appendChild(div);
  (async function() {
    const users = await window.fetchAssignableUsers();
    const sel = document.getElementById('create-task-assignee');
    if (sel) sel.innerHTML = '<option value="">Select user...</option>' + users.map(u => `
      <option value="${u.id}">${escapeHtml(u.name || u.username || 'User ' + u.id)}</option>
    `).join('');
  })();
  var form = document.getElementById('create-task-form');
  var submitBtn = document.getElementById('create-task-submit-btn');
  if (form) {
    form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      window.saveNewTask(ev);
    });
  }
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      window.saveNewTask(null);
    });
  }
};

window.closeCreateTaskModal = function() {
  const modal = document.getElementById('create-task-modal');
  if (modal) modal.classList.add('hidden');
};

window.saveNewTask = async function(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();
  const titleEl = document.getElementById('create-task-title');
  const assigneeEl = document.getElementById('create-task-assignee');
  const errEl = document.getElementById('create-task-error');
  if (!errEl) return false;
  errEl.classList.add('hidden');
  const title = titleEl ? titleEl.value.trim() : '';
  const assignedTo = assigneeEl ? assigneeEl.value : '';
  if (!title) { errEl.textContent = 'Title is required.'; errEl.classList.remove('hidden'); return false; }
  if (!assignedTo) { errEl.textContent = 'Please select an assignee.'; errEl.classList.remove('hidden'); return false; }
  var payload = {
    title: title,
    description: (document.getElementById('create-task-description') || {}).value.trim() || undefined,
    assignedToUserId: Number(assignedTo)
  };
  try {
    const task = await window.createTask(payload);
    closeCreateTaskModal();
    if (titleEl) titleEl.value = '';
    const descEl = document.getElementById('create-task-description');
    if (descEl) descEl.value = '';
    addNotification('success', 'Task created', 'Task created successfully.');
    const taskId = task && (task.id !== undefined && task.id !== null) ? task.id : null;
    if (taskId != null) {
      window.navigateTo('task-detail', { id: taskId });
    } else {
      if (typeof loadTasks === 'function') loadTasks();
    }
  } catch (err) {
    if (window.AppConfig && window.AppConfig.app && window.AppConfig.app.debug) {
      console.error('[Task create] createTask failed', err);
    }
    errEl.textContent = window.getApiErrorMessage ? window.getApiErrorMessage(err) : (err && err.message) || 'Failed to create task.';
    errEl.classList.remove('hidden');
  }
  return false;
};

async function loadTaskDetail(id) {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6"><div id="task-detail-loading">Loading...</div><div id="task-detail-body" class="hidden"></div></div>`;
  try {
    const task = await window.fetchTaskById(id);
    document.getElementById("task-detail-loading").classList.add("hidden");
    const body = document.getElementById("task-detail-body");
    body.classList.remove("hidden");
    const canEdit = hasPermission('editTask');
    const isAdmin = getUserRole() === 'admin';
    const createdByAdmin = task.createdByAdmin === true || (state.adminUserIds && state.adminUserIds.indexOf(task.createdBy) !== -1);
    const canCancel = task.state !== 'CANCELLED' && (isAdmin || !createdByAdmin);
    const statesOptions = TASK_STATES.map(s => {
      if (s === 'CANCELLED' && !canCancel) return '';
      return `<option value="${s}" ${task.state === s ? 'selected' : ''}>${escapeHtml(taskStateLabel(s))}</option>`;
    }).filter(Boolean).join('');
    body.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(task.title)}</h1>
        <button type="button" onclick="window.navigateTo('tasks')" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-50"><i class="fas fa-arrow-left mr-2"></i>Back to tasks</button>
      </div>
      <div class="card space-y-4">
        ${task.description ? `<p class="text-gray-700">${escapeHtml(task.description)}</p>` : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">Created by</span> ${escapeHtml(task.creatorName || '—')}</div>
          <div><span class="text-gray-500">Assigned to</span> ${escapeHtml(task.assigneeName || '—')}</div>
          <div><span class="text-gray-500">State</span> ${escapeHtml(taskStateLabel(task.state))}</div>
          <div><span class="text-gray-500">Created</span> ${formatIsoDate(task.createdAt)}</div>
          <div><span class="text-gray-500">Updated</span> ${formatIsoDate(task.updatedAt)}</div>
        </div>
        ${canEdit ? `
        <div id="task-update-section" class="pt-4 border-t">
          <h3 class="font-semibold mb-2">Update task</h3>
          <div id="task-update-error" class="hidden text-red-600 text-sm mb-2"></div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Comment (required when changing state or assignee)</label>
            <textarea id="task-update-comment" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2" placeholder="Comment"></textarea>
            <div class="flex flex-wrap gap-4 items-center">
              <div>
                <label class="block text-sm text-gray-500">State</label>
                <select id="task-update-state" class="px-3 py-2 border border-gray-300 rounded-lg">${statesOptions}</select>
              </div>
              <div>
                <label class="block text-sm text-gray-500">Assign to</label>
                <select id="task-update-assignee" class="px-3 py-2 border border-gray-300 rounded-lg"></select>
              </div>
              <div class="self-end"><button type="button" id="task-update-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button></div>
            </div>
          </div>
        </div>
        ` : ''}
        <div class="pt-4 border-t">
          <h3 class="font-semibold mb-2">Comments</h3>
          <div id="task-comments-list">${(task.comments || []).length ? (task.comments || []).map(c => `
            <div class="py-2 border-b last:border-b-0 text-sm">
              <div class="text-gray-500">${escapeHtml(c.userName)} · ${formatIsoDate(c.createdAt)}${c.stateAfter ? ' → ' + escapeHtml(taskStateLabel(c.stateAfter)) : ''}</div>
              <div class="mt-1">${escapeHtml(c.commentText)}</div>
            </div>
          `).join('') : '<p class="text-gray-500">No comments yet.</p>'}</div>
        </div>
      </div>
    `;
    if (canEdit) {
      (async function() {
        const users = await window.fetchAssignableUsers();
        const sel = document.getElementById('task-update-assignee');
        sel.innerHTML = users.map(u => `
          <option value="${u.id}" ${task.assignedTo === u.id ? 'selected' : ''}>${escapeHtml(u.name || u.username || 'User ' + u.id)}</option>
        `).join('');
      })();
      document.getElementById('task-update-btn').addEventListener('click', async function() {
        const comment = document.getElementById('task-update-comment').value.trim();
        const newState = document.getElementById('task-update-state').value;
        const newAssignee = document.getElementById('task-update-assignee').value;
        const stateChanged = newState !== task.state;
        const assigneeChanged = Number(newAssignee) !== Number(task.assignedTo);
        const errEl = document.getElementById('task-update-error');
        errEl.classList.add('hidden');
        if ((stateChanged || assigneeChanged) && !comment) {
          errEl.textContent = 'Comment is required when changing state or reassigning.';
          errEl.classList.remove('hidden');
          return;
        }
        try {
          const payload = {};
          if (comment) payload.comment = comment;
          if (stateChanged) payload.state = newState;
          if (assigneeChanged) payload.assignedToUserId = Number(newAssignee);
          if (Object.keys(payload).length === 0) return;
          const updated = await window.updateTask(id, payload);
          Object.assign(task, updated);
          addNotification('success', 'Task updated', 'Task updated successfully.');
          loadTaskDetail(id);
        } catch (err) {
          errEl.textContent = window.getApiErrorMessage ? window.getApiErrorMessage(err) : err.message || 'Update failed.';
          errEl.classList.remove('hidden');
        }
      });
    }
  } catch (err) {
    document.getElementById("task-detail-loading").classList.add("hidden");
    document.getElementById("main-content").innerHTML = `
      <div class="space-y-6">
        ${getApiErrorDisplay(err, { title: 'Error loading task' })}
        <button type="button" onclick="window.navigateTo('tasks')" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-50">Back to tasks</button>
      </div>
    `;
  }
};

async function loadTickets() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-900">Tickets</h1>
    <div id="tickets-loading" class="text-gray-500">Loading...</div>
    <div id="tickets-content" class="hidden space-y-4"></div>
  </div>`;
  try {
    const data = await window.fetchTickets();
    const loading = document.getElementById("tickets-loading");
    const container = document.getElementById("tickets-content");
    loading.classList.add("hidden");
    container.classList.remove("hidden");
    const hasAll = Array.isArray(data.all);
    const tabs = [
      { key: 'assignedToMe', label: 'Assigned to me' },
      { key: 'openedByMe', label: 'Opened by me' }
    ];
    if (hasAll) tabs.push({ key: 'all', label: 'All' });
    const activeTab = state.ticketsActiveTab || 'assignedToMe';
    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex space-x-2 flex-wrap">
          ${tabs.map(t => `
            <button type="button" class="ticket-tab px-4 py-2 rounded-lg ${t.key === activeTab ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-tab="${t.key}">${escapeHtml(t.label)}</button>
          `).join('')}
        </div>
        ${hasPermission('addTicket') ? `<button type="button" onclick="openCreateTicketModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><i class="fas fa-plus mr-2"></i>Create ticket</button>` : ''}
      </div>
      <div class="card"><div id="tickets-list"></div></div>
    `;
    state.ticketsBucketedData = data;
    container.querySelectorAll('.ticket-tab').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        state.ticketsActiveTab = tab;
        loadTickets();
      });
    });
    const list = data[activeTab] || [];
    const listEl = document.getElementById("tickets-list");
    const priorityClass = p => p === 'CRITICAL' ? 'bg-red-100 text-red-800' : p === 'HIGH' ? 'bg-orange-100 text-orange-800' : p === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
    listEl.innerHTML = list.length ? list.map(t => {
      const stateClass = t.state === 'COMPLETED' ? 'bg-green-100 text-green-800' : t.state === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : t.state === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
      return `<div class="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50" data-ticket-id="${t.id}" role="button">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-medium">${escapeHtml(t.title)}</div>
            ${t.description ? `<div class="text-sm text-gray-500 mt-1">${escapeHtml(t.description)}</div>` : ''}
            <div class="flex items-center flex-wrap gap-x-3 mt-2 text-xs text-gray-500">
              <span><i class="fas fa-user mr-1"></i>${escapeHtml(t.assigneeName || '—')}</span>
              <span><i class="fas fa-user-edit mr-1"></i>${escapeHtml(t.creatorName || '—')}</span>
              <span><i class="fas fa-calendar mr-1"></i>${formatIsoDate(t.createdAt)}</span>
              ${t.resolvedAt ? `<span><i class="fas fa-check-circle mr-1"></i>Resolved ${formatIsoDate(t.resolvedAt)}</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded text-xs ${priorityClass(t.priority || 'MEDIUM')}">${escapeHtml(t.priority || 'MEDIUM')}</span>
            <span class="px-3 py-1 rounded text-xs ${stateClass}">${escapeHtml(taskStateLabel(t.state))}</span>
          </div>
        </div>
      </div>`;
    }).join('') : '<p class="text-center text-gray-500 py-8">No tickets in this view</p>';
    listEl.querySelectorAll('[data-ticket-id]').forEach(row => {
      row.addEventListener('click', function() {
        const id = this.getAttribute('data-ticket-id');
        if (id) window.navigateTo('ticket-detail', { id: id });
      });
    });
  } catch (err) {
    document.getElementById("tickets-loading").classList.add("hidden");
    document.getElementById("tickets-content").classList.remove("hidden");
    document.getElementById("tickets-content").innerHTML = getApiErrorDisplay(err, { title: 'Error loading tickets' });
  }
}

window.openCreateTicketModal = function() {
  const modal = document.getElementById('create-ticket-modal');
  if (modal) { modal.classList.remove('hidden'); return; }
  const div = document.createElement('div');
  div.id = 'create-ticket-modal';
  div.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  div.setAttribute('role', 'dialog');
  div.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
      <div class="p-4 border-b flex items-center justify-between">
        <h2 class="text-xl font-semibold">Create ticket</h2>
        <button type="button" onclick="closeCreateTicketModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
      </div>
      <form id="create-ticket-form" class="p-6 space-y-4">
        <div id="create-ticket-error" class="hidden text-red-600 text-sm"></div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" id="create-ticket-title" required class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ticket title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="create-ticket-description" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Optional"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assign to *</label>
          <select id="create-ticket-assignee" required class="w-full px-3 py-2 border border-gray-300 rounded-lg"></select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select id="create-ticket-priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
            ${TICKET_PRIORITIES.map(p => `<option value="${p}" ${p === 'MEDIUM' ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('')}
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeCreateTicketModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
        </div>
      </form>
    </div>
  `;
  div.addEventListener('click', function(e) { if (e.target === div) closeCreateTicketModal(); });
  document.body.appendChild(div);
  (async function() {
    const users = await window.fetchAssignableUsers();
    const sel = document.getElementById('create-ticket-assignee');
    sel.innerHTML = '<option value="">Select user...</option>' + users.map(u => `
      <option value="${u.id}">${escapeHtml(u.name || u.username || 'User ' + u.id)}</option>
    `).join('');
  })();
  document.getElementById('create-ticket-form').addEventListener('submit', saveNewTicket);
};

window.closeCreateTicketModal = function() {
  const modal = document.getElementById('create-ticket-modal');
  if (modal) modal.classList.add('hidden');
};

window.saveNewTicket = async function(e) {
  e.preventDefault();
  const title = document.getElementById('create-ticket-title').value.trim();
  const assignedTo = document.getElementById('create-ticket-assignee').value;
  const errEl = document.getElementById('create-ticket-error');
  errEl.classList.add('hidden');
  if (!title) { errEl.textContent = 'Title is required.'; errEl.classList.remove('hidden'); return; }
  if (!assignedTo) { errEl.textContent = 'Please select an assignee.'; errEl.classList.remove('hidden'); return; }
  try {
    const ticket = await window.createTicket({
      title: title,
      description: document.getElementById('create-ticket-description').value.trim() || undefined,
      assignedToUserId: Number(assignedTo),
      priority: document.getElementById('create-ticket-priority').value || 'MEDIUM'
    });
    closeCreateTicketModal();
    document.getElementById('create-ticket-title').value = '';
    document.getElementById('create-ticket-description').value = '';
    addNotification('success', 'Ticket created', 'Ticket created successfully.');
    window.navigateTo('ticket-detail', { id: ticket.id });
  } catch (err) {
    errEl.textContent = window.getApiErrorMessage ? window.getApiErrorMessage(err) : err.message || 'Failed to create ticket.';
    errEl.classList.remove('hidden');
  }
};

async function loadTicketDetail(id) {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6"><div id="ticket-detail-loading">Loading...</div><div id="ticket-detail-body" class="hidden"></div></div>`;
  try {
    const ticket = await window.fetchTicketById(id);
    document.getElementById("ticket-detail-loading").classList.add("hidden");
    const body = document.getElementById("ticket-detail-body");
    body.classList.remove("hidden");
    const canEdit = hasPermission('editTicket');
    const isAdmin = getUserRole() === 'admin';
    const createdByAdmin = ticket.createdByAdmin === true || (state.adminUserIds && state.adminUserIds.indexOf(ticket.createdBy) !== -1);
    const canCancel = ticket.state !== 'CANCELLED' && (isAdmin || !createdByAdmin);
    const statesOptions = TASK_STATES.map(s => {
      if (s === 'CANCELLED' && !canCancel) return '';
      return `<option value="${s}" ${ticket.state === s ? 'selected' : ''}>${escapeHtml(taskStateLabel(s))}</option>`;
    }).filter(Boolean).join('');
    const priorityOptions = TICKET_PRIORITIES.map(p => `<option value="${p}" ${(ticket.priority || 'MEDIUM') === p ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('');
    body.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h1 class="text-3xl font-bold text-gray-900">${escapeHtml(ticket.title)}</h1>
        <button type="button" onclick="window.navigateTo('tickets')" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-50"><i class="fas fa-arrow-left mr-2"></i>Back to tickets</button>
      </div>
      <div class="card space-y-4">
        ${ticket.description ? `<p class="text-gray-700">${escapeHtml(ticket.description)}</p>` : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">Created by</span> ${escapeHtml(ticket.creatorName || '—')}</div>
          <div><span class="text-gray-500">Assigned to</span> ${escapeHtml(ticket.assigneeName || '—')}</div>
          <div><span class="text-gray-500">State</span> ${escapeHtml(taskStateLabel(ticket.state))}</div>
          <div><span class="text-gray-500">Priority</span> ${escapeHtml(ticket.priority || 'MEDIUM')}</div>
          <div><span class="text-gray-500">Created</span> ${formatIsoDate(ticket.createdAt)}</div>
          <div><span class="text-gray-500">Updated</span> ${formatIsoDate(ticket.updatedAt)}</div>
          ${ticket.resolvedAt ? `<div><span class="text-gray-500">Resolved</span> ${formatIsoDate(ticket.resolvedAt)}</div>` : ''}
        </div>
        ${canEdit ? `
        <div id="ticket-update-section" class="pt-4 border-t">
          <h3 class="font-semibold mb-2">Update ticket</h3>
          <div id="ticket-update-error" class="hidden text-red-600 text-sm mb-2"></div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Comment (required when changing state or assignee)</label>
            <textarea id="ticket-update-comment" class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="2" placeholder="Comment"></textarea>
            <div class="flex flex-wrap gap-4 items-center">
              <div>
                <label class="block text-sm text-gray-500">State</label>
                <select id="ticket-update-state" class="px-3 py-2 border border-gray-300 rounded-lg">${statesOptions}</select>
              </div>
              <div>
                <label class="block text-sm text-gray-500">Assign to</label>
                <select id="ticket-update-assignee" class="px-3 py-2 border border-gray-300 rounded-lg"></select>
              </div>
              <div>
                <label class="block text-sm text-gray-500">Priority</label>
                <select id="ticket-update-priority" class="px-3 py-2 border border-gray-300 rounded-lg">${priorityOptions}</select>
              </div>
              <div class="self-end"><button type="button" id="ticket-update-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button></div>
            </div>
          </div>
        </div>
        ` : ''}
        <div class="pt-4 border-t">
          <h3 class="font-semibold mb-2">Comments</h3>
          <div id="ticket-comments-list">${(ticket.comments || []).length ? (ticket.comments || []).map(c => `
            <div class="py-2 border-b last:border-b-0 text-sm">
              <div class="text-gray-500">${escapeHtml(c.userName)} · ${formatIsoDate(c.createdAt)}${c.stateAfter ? ' → ' + escapeHtml(taskStateLabel(c.stateAfter)) : ''}</div>
              <div class="mt-1">${escapeHtml(c.commentText)}</div>
            </div>
          `).join('') : '<p class="text-gray-500">No comments yet.</p>'}</div>
        </div>
      </div>
    `;
    if (canEdit) {
      (async function() {
        const users = await window.fetchAssignableUsers();
        const sel = document.getElementById('ticket-update-assignee');
        sel.innerHTML = users.map(u => `
          <option value="${u.id}" ${ticket.assignedTo === u.id ? 'selected' : ''}>${escapeHtml(u.name || u.username || 'User ' + u.id)}</option>
        `).join('');
      })();
      document.getElementById('ticket-update-btn').addEventListener('click', async function() {
        const comment = document.getElementById('ticket-update-comment').value.trim();
        const newState = document.getElementById('ticket-update-state').value;
        const newAssignee = document.getElementById('ticket-update-assignee').value;
        const newPriority = document.getElementById('ticket-update-priority').value;
        const stateChanged = newState !== ticket.state;
        const assigneeChanged = Number(newAssignee) !== Number(ticket.assignedTo);
        const priorityChanged = newPriority !== (ticket.priority || 'MEDIUM');
        const errEl = document.getElementById('ticket-update-error');
        errEl.classList.add('hidden');
        if ((stateChanged || assigneeChanged) && !comment) {
          errEl.textContent = 'Comment is required when changing state or reassigning.';
          errEl.classList.remove('hidden');
          return;
        }
        try {
          const payload = {};
          if (comment) payload.comment = comment;
          if (stateChanged) payload.state = newState;
          if (assigneeChanged) payload.assignedToUserId = Number(newAssignee);
          if (priorityChanged) payload.priority = newPriority;
          if (Object.keys(payload).length === 0) return;
          const updated = await window.updateTicket(id, payload);
          Object.assign(ticket, updated);
          addNotification('success', 'Ticket updated', 'Ticket updated successfully.');
          loadTicketDetail(id);
        } catch (err) {
          errEl.textContent = window.getApiErrorMessage ? window.getApiErrorMessage(err) : err.message || 'Update failed.';
          errEl.classList.remove('hidden');
        }
      });
    }
  } catch (err) {
    document.getElementById("ticket-detail-loading").classList.add("hidden");
    document.getElementById("main-content").innerHTML = `
      <div class="space-y-6">
        ${getApiErrorDisplay(err, { title: 'Error loading ticket' })}
        <button type="button" onclick="window.navigateTo('tickets')" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-50">Back to tickets</button>
      </div>
    `;
  }
};

// ============================================
// EMPLOYEE MANAGEMENT
// ============================================
// Map backend user ({ id, userName, name, email, role, enabled }) to UI employee shape
function mapAuthUserToEmployee(u) {
  const roleStr = (u.role != null ? String(u.role) : '').toLowerCase().replace(/^role_/, '');
  const role = roleStr === 'admin' ? 'admin' : roleStr === 'manager' ? 'manager' : roleStr === 'sales' ? 'sales' : roleStr || 'sales';
  const rolesDisplay = role === 'sales' ? 'Sales' : role.charAt(0).toUpperCase() + role.slice(1);
  return {
    id: u.id,
    name: u.name || u.userName || '—',
    username: u.userName,
    email: (u.email != null && u.email !== '') ? u.email : (u.userName ? u.userName + '@cellpay.net' : '—'),
    role,
    rolesDisplay,
    enabled: u.enabled !== false
  };
}

async function loadEmployees() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">
        <i class="fas fa-user-tie mr-2"></i>Employee Management
      </h1>
      ${hasPermission('addEmployee') ? `<button type="button" onclick="showAddEmployee()" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        <i class="fas fa-plus mr-2"></i>Add Employee
      </button>` : ''}
    </div>
    <div class="card">
      <div id="employees-list"><div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div></div>
    </div>
  </div>`;
  try {
    const users = await window.fetchAuthUsers();
    state.employees = users.map(mapAuthUserToEmployee);
    loadEmployeesList();
  } catch (err) {
    const message = (typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.response?.data?.message || err.message || 'Please try again.'));
    const safeMessage = (message || 'Failed to load users.').replace(/</g, '&lt;');
    const isAccessDenied = err.response?.status === 403;
    document.getElementById("employees-list").innerHTML = `
      <div class="${isAccessDenied ? 'bg-amber-50 border-l-4 border-amber-500' : 'bg-red-50 border-l-4 border-red-500'} p-4">
        <p class="${isAccessDenied ? 'text-amber-800' : 'text-red-600'}"><i class="fas ${isAccessDenied ? 'fa-lock' : 'fa-exclamation-circle'} mr-2"></i>${safeMessage}</p>
        ${isAccessDenied ? '<p class="text-amber-700 text-sm mt-1">Contact your administrator if you need access to the user list.</p>' : ''}
      </div>`;
  }
}

// Employee data store (populated from GET /api/auth/users when viewing Employee Management)
if (!state.employees) {
  state.employees = [];
}

function loadEmployeesList() {
  const employees = state.employees || [];
  const roleBadgeClass = (emp) => {
    const r = emp.role;
    if (r === 'admin') return 'bg-purple-100 text-purple-800';
    if (r === 'manager') return 'bg-blue-100 text-blue-800';
    if (r === 'sales') return 'bg-emerald-100 text-emerald-800';
    return 'bg-gray-100 text-gray-800';
  };
  const canEdit = hasPermission('editEmployee');
  const html = employees.length === 0
    ? '<p class="text-gray-500 text-center py-8">No users found.</p>'
    : `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            ${canEdit ? '<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>' : ''}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${employees.map(emp => `
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-medium">${(emp.name || '').charAt(0) || '?'}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">${(emp.name || '—').replace(/</g, '&lt;')}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${(emp.username || '—').replace(/</g, '&lt;')}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${(emp.email || '—').replace(/</g, '&lt;')}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass(emp)}">
                  ${(emp.rolesDisplay != null ? emp.rolesDisplay : (emp.role || '—').charAt(0).toUpperCase() + (emp.role || '').slice(1)).replace(/</g, '&lt;')}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  ${emp.enabled !== false ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              ${canEdit ? `
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <button type="button" class="text-indigo-600 hover:text-indigo-900 mr-3" data-employee-id="${emp.id}" data-action="edit" title="Edit">Edit</button>
                <button type="button" class="text-amber-600 hover:text-amber-900" data-employee-id="${emp.id}" data-action="reset-password" title="Reset password">Reset password</button>
              </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  const el = document.getElementById("employees-list");
  if (el) {
    el.innerHTML = html;
    if (canEdit) {
      el.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', function () { editEmployee(Number(this.getAttribute('data-employee-id'))); });
      });
      el.querySelectorAll('[data-action="reset-password"]').forEach(btn => {
        btn.addEventListener('click', function () { resetEmployeePassword(Number(this.getAttribute('data-employee-id'))); });
      });
    }
  }
}

window.showAddEmployee = function() {
  if (!hasPermission('addEmployee')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to add employees');
    return;
  }
  
  showEmployeeModal();
};

window.editEmployee = function(id) {
  if (!hasPermission('editEmployee')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to edit employees');
    return;
  }
  
  const employee = state.employees.find(e => e.id === id);
  if (employee) {
    showEmployeeModal(employee);
  }
};

window.deleteEmployee = function(id) {
  if (!hasPermission('deleteEmployee')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to delete employees');
    return;
  }
  
  const employee = state.employees.find(e => e.id === id);
  if (employee && confirm(`Are you sure you want to delete ${employee.name}?`)) {
    state.employees = state.employees.filter(e => e.id !== id);
    loadEmployeesList();
    addNotification('success', 'Employee Deleted', `${employee.name} has been removed from the system`);
  }
};

window.resetEmployeePassword = function(id) {
  if (!hasPermission('editEmployee')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to reset passwords');
    return;
  }
  
  const employee = state.employees.find(e => e.id === id);
  if (!employee) return;
  
  // Show password reset modal
  showPasswordResetForm(employee);
};

// Show password reset form
window.showPasswordResetForm = function(employee) {
  const modalHTML = `
    <div id="password-reset-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-500 to-yellow-600">
          <h2 class="text-2xl font-bold text-white">
            <i class="fas fa-key mr-2"></i>Reset Password
          </h2>
        </div>
        
        <form id="reset-password-form" class="p-6 space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 text-sm">
              <i class="fas fa-info-circle mr-2"></i>
              Resetting password for <strong>${employee.name}</strong>
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
            <div class="bg-gray-50 px-4 py-3 rounded-lg">
              <p class="font-medium text-gray-900">${employee.name}</p>
              <p class="text-sm text-gray-600">${employee.email}</p>
              <p class="text-xs text-gray-500 mt-1">Username: ${employee.username || 'Not set'}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
            <div class="relative">
              <input type="password" id="new-password" required
                placeholder="Enter new password (min 8 characters)"
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <button type="button" onclick="togglePasswordVisibility('new-password')" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <div class="relative">
              <input type="password" id="confirm-password" required
                placeholder="Confirm new password"
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <button type="button" onclick="togglePasswordVisibility('confirm-password')" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="button" onclick="closePasswordResetModal()" 
              class="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" 
              class="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium">
              <i class="fas fa-key mr-2"></i>Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      addNotification('error', 'Password Mismatch', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      addNotification('error', 'Password Too Short', 'Password must be at least 8 characters');
      return;
    }

    try {
      await window.updateAuthUser({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        enabled: employee.enabled !== false,
        password: newPassword
      });
      closePasswordResetModal();
      showPasswordResetSuccess(employee, newPassword);
      addNotification('success', 'Password Reset', `Password reset for ${employee.name}`);
    } catch (err) {
      const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Password reset failed.');
      addNotification('error', 'Password Reset Failed', msg);
    }
  });
};

// Show password reset success with new credentials
window.showPasswordResetSuccess = function(employee, newPassword) {
  const modalHTML = `
    <div id="reset-success-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <h2 class="text-2xl font-bold text-white">
            <i class="fas fa-check-circle mr-2"></i>Password Reset Complete!
          </h2>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 text-sm">
              Password has been reset for <strong>${employee.name}</strong>. Share these new credentials:
            </p>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">EMPLOYEE</label>
              <div class="bg-gray-50 px-4 py-3 rounded-lg">
                <p class="font-medium text-gray-900">${employee.name}</p>
                <p class="text-sm text-gray-600">${employee.email}</p>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">USERNAME</label>
              <div class="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="font-mono font-semibold text-blue-900">${employee.username}</span>
                <button onclick="copyToClipboard('${employee.username}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">NEW PASSWORD</label>
              <div class="bg-yellow-50 border border-yellow-300 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="font-mono font-semibold text-yellow-900">${newPassword}</span>
                <button onclick="copyToClipboard('${newPassword}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
          
          <button onclick="copyEmployeeCredentials('${employee.name}', '${employee.email}', '${employee.username}', '${newPassword}')" 
            class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <i class="fas fa-copy mr-2"></i>Copy All Credentials
          </button>
          
          <button onclick="closeResetSuccessModal()" 
            class="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Done
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closePasswordResetModal = function() {
  const modal = document.getElementById('password-reset-modal');
  if (modal) modal.remove();
};

window.closeResetSuccessModal = function() {
  const modal = document.getElementById('reset-success-modal');
  if (modal) modal.remove();
};

window.showEmployeeModal = function(employee = null) {
  const isEdit = employee !== null;
  const enabled = employee == null || employee.enabled !== false;
  const modalHTML = `
    <div id="employee-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target===this) closeEmployeeModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-user-tie mr-2"></i>${isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <button onclick="closeEmployeeModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <form id="employee-form" class="p-6 space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <i class="fas fa-user mr-2 text-indigo-600"></i>Basic Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" id="emp-name" value="${(employee?.name || '').replace(/"/g, '&quot;')}" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" id="emp-email" value="${(employee?.email || '').replace(/"/g, '&quot;')}" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
          </div>
          
          ${!isEdit ? `
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <i class="fas fa-key mr-2 text-indigo-600"></i>Login Credentials
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" id="emp-username" required placeholder="e.g., john.doe"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <p class="text-xs text-gray-500 mt-1">Employee will use this to login</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div class="relative">
                  <input type="password" id="emp-password" required placeholder="Min 8 characters" minlength="8"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <button type="button" onclick="togglePasswordVisibility('emp-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Share this with the employee</p>
              </div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p class="text-sm text-blue-800"><i class="fas fa-info-circle mr-2"></i>You'll see the credentials after creating the employee. Share them securely.</p>
            </div>
          </div>
          ` : `
          <div class="border-t pt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Change password (optional)</label>
            <div class="relative">
              <input type="password" id="emp-password" placeholder="Leave blank to keep current"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <button type="button" onclick="togglePasswordVisibility('emp-password')" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          `}
          
          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <i class="fas fa-shield-alt mr-2 text-indigo-600"></i>Role & Status
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select id="emp-role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Role</option>
                  <option value="admin" ${employee?.role === 'admin' ? 'selected' : ''}>Admin (Full Access)</option>
                  <option value="manager" ${employee?.role === 'manager' ? 'selected' : ''}>Manager (Sales & Reports)</option>
                  <option value="sales" ${employee?.role === 'sales' ? 'selected' : ''}>Sales (Basic Access)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="emp-enabled" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="1" ${enabled ? 'selected' : ''}>Enabled (Can login)</option>
                  <option value="0" ${!enabled ? 'selected' : ''}>Disabled (Cannot login)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onclick="closeEmployeeModal()" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <i class="fas fa-save mr-2"></i>${isEdit ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('employee-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveEmployee(employee?.id);
  });
};

window.saveEmployee = async function(id) {
  const name = document.getElementById('emp-name').value.trim();
  const email = document.getElementById('emp-email').value.trim();
  const role = document.getElementById('emp-role').value;
  const enabledEl = document.getElementById('emp-enabled');
  const enabled = enabledEl ? enabledEl.value === '1' : true;

  if (id) {
    // Update existing user via PUT /api/auth/users
    const payload = { id: Number(id), name, email, role, enabled };
    const passwordEl = document.getElementById('emp-password');
    const newPassword = passwordEl && passwordEl.value ? passwordEl.value : undefined;
    if (newPassword) payload.password = newPassword;

    try {
      await window.updateAuthUser(payload);
      const users = await window.fetchAuthUsers();
      state.employees = users.map(mapAuthUserToEmployee);
      closeEmployeeModal();
      loadEmployeesList();
      addNotification('success', 'Employee Updated', `${name} has been updated successfully`);
    } catch (err) {
      const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Update failed.');
      addNotification('error', 'Update Failed', msg);
    }
    return;
  }

  // Create new user via POST /api/auth/users
  const username = document.getElementById('emp-username').value.trim();
  const password = document.getElementById('emp-password').value;
  if (!username || !password) {
    addNotification('error', 'Missing fields', 'Username and password are required.');
    return;
  }
  if (password.length < 8) {
    addNotification('error', 'Password too short', 'Password must be at least 8 characters.');
    return;
  }

  try {
    const created = await window.createAuthUser({ username, password, role, name, email });
    closeEmployeeModal();
    const newEmployee = mapAuthUserToEmployee(created);
    newEmployee.password = password;
    const users = await window.fetchAuthUsers();
    state.employees = users.map(mapAuthUserToEmployee);
    loadEmployeesList();
    addNotification('success', 'Employee Created', created.message || `${name} has been added.`);
    showSimpleCredentialsModal(newEmployee);
  } catch (err) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Create failed.');
    addNotification('error', 'Create Failed', msg);
  }
};

// Toggle password visibility
window.togglePasswordVisibility = function(fieldId) {
  const field = document.getElementById(fieldId);
  const icon = field.nextElementSibling?.querySelector('i');
  if (field.type === 'password') {
    field.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash';
  } else {
    field.type = 'password';
    if (icon) icon.className = 'fas fa-eye';
  }
};

// Simple credentials modal (no email, just copy)
window.showSimpleCredentialsModal = function(employee) {
  const modalHTML = `
    <div id="credentials-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <h2 class="text-2xl font-bold text-white">
            <i class="fas fa-check-circle mr-2"></i>Employee Added!
          </h2>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 text-sm">
              <strong>${employee.name}</strong> has been added. Share these credentials with them:
            </p>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">EMPLOYEE NAME</label>
              <div class="bg-gray-50 px-4 py-3 rounded-lg">
                <span class="font-medium text-gray-900">${employee.name}</span>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">EMAIL</label>
              <div class="bg-gray-50 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="text-gray-900">${employee.email}</span>
                <button onclick="copyToClipboard('${employee.email}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">USERNAME</label>
              <div class="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="font-mono font-semibold text-blue-900">${employee.username}</span>
                <button onclick="copyToClipboard('${employee.username}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">PASSWORD</label>
              <div class="bg-yellow-50 border border-yellow-300 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="font-mono font-semibold text-yellow-900">${employee.password}</span>
                <button onclick="copyToClipboard('${employee.password}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">PORTAL URL</label>
              <div class="bg-gray-50 px-4 py-3 rounded-lg flex justify-between items-center">
                <span class="text-sm font-mono text-gray-700">${window.location.origin}</span>
                <button onclick="copyToClipboard('${window.location.origin}')" class="text-indigo-600 hover:text-indigo-800">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
          
          <button onclick="copyEmployeeCredentials('${employee.name}', '${employee.email}', '${employee.username}', '${employee.password}')" 
            class="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <i class="fas fa-copy mr-2"></i>Copy All Credentials
          </button>
          
          <button onclick="closeCredentialsModal()" 
            class="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Done
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Copy employee credentials
window.copyEmployeeCredentials = function(name, email, username, password) {
  const text = `
CellPay Portal - Employee Login
================================

Employee: ${name}
Email: ${email}

Portal URL: ${window.location.origin}

Login Credentials:
Username: ${username}
Password: ${password}

Instructions:
1. Go to the portal URL above
2. Click "Login" and enter your username and password

For support, contact your administrator.
  `.trim();
  
  navigator.clipboard.writeText(text).then(() => {
    addNotification('success', 'Copied!', 'All credentials copied to clipboard');
  });
};

// Remove auto-generation functions (not needed anymore)
// generateTempPassword(), emailCredentials(), copyAllCredentials() removed

window.closeEmployeeModal = function() {
  const modal = document.getElementById('employee-modal');
  if (modal) modal.remove();
};

window.closeCredentialsModal = function() {
  const modal = document.getElementById('credentials-modal');
  if (modal) modal.remove();
};

// ============================================
// CRM + ERP SYSTEM
// ============================================
async function loadCRM() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        <i class="fas fa-store mr-2"></i>Customer & Business Management
      </h1>
      ${hasPermission('addB2BClient') ? `<button onclick="showAddCustomer()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        <i class="fas fa-plus mr-2"></i>Add B2B Customer
      </button>` : ''}
    </div>
    
    <!-- Customers Content -->
    <div id="crm-content"></div>
  </div>`;
  
  loadCRMCustomers();
}

window.loadCRMTab = function(tab, clickedButton) {
  // Update active tab
  document.querySelectorAll('.crm-tab').forEach(btn => {
    btn.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });
  
  // If called from button click, update the active state
  if (clickedButton) {
    const tabButton = clickedButton.closest ? clickedButton.closest('.crm-tab') : clickedButton;
    if (tabButton) {
      tabButton.classList.add('active', 'border-indigo-500', 'text-indigo-600');
      tabButton.classList.remove('border-transparent', 'text-gray-500');
    }
  } else {
    // If called programmatically (on load), activate the first matching tab
    const tabButton = document.querySelector(`.crm-tab[onclick*="'${tab}'"]`);
    if (tabButton) {
      tabButton.classList.add('active', 'border-indigo-500', 'text-indigo-600');
      tabButton.classList.remove('border-transparent', 'text-gray-500');
    }
  }
  
  switch(tab) {
    case 'customers': loadCRMCustomers(); break;
    case 'tasks': loadCRMTasks(); break;
    case 'alerts': loadCRMAlerts(); break;
    case 'products': loadCRMProducts(); break;
  }
};

// ============================================
// API-READY DATA STRUCTURES (Dummy Data)
// ============================================

// Product Catalog
if (!state.products) {
  state.products = [
    { id: 1, name: "Airtime", category: "Mobile", enabled: true, commission: 2.5 },
    { id: 2, name: "Bill Payment", category: "Utilities", enabled: true, commission: 1.8 },
    { id: 3, name: "Gift Cards", category: "Retail", enabled: true, commission: 3.0 },
    { id: 4, name: "Crypto", category: "Digital", enabled: true, commission: 1.5 },
    { id: 5, name: "Money Transfer", category: "Financial", enabled: true, commission: 2.0 }
  ];
}

// B2B Customers (Stores/Businesses)
// API Endpoint: GET /api/customers
// POST /api/customers (add new)
// PUT /api/customers/:id (update)
// DELETE /api/customers/:id (delete)
if (!state.crmCustomers) {
  state.crmCustomers = [
    {
      id: 1,
      businessName: "Downtown Convenience Store",
      contactPerson: "John Smith",
      email: "john@downtown.com",
      phone: "+1-555-1001",
      storeId: "STORE-001",
      isoId: "ISO-10",
      subIsoId: "SUB-ISO-25",
      status: "active",
      riskLevel: "low",
      products: [1, 2, 3], // Product IDs enabled
      salesLast7Days: 45230,
      salesLast30Days: 185400,
      salesTrend: "+12%",
      lastTransaction: "2026-02-07",
      assignedEmployee: 2, // Employee ID
      creditLimit: 100000,
      creditBalance: 15230,
      notes: "Top performer, reliable payment"
    },
    {
      id: 2,
      businessName: "Quick Mart Express",
      contactPerson: "Sarah Johnson",
      email: "sarah@quickmart.com",
      phone: "+1-555-1002",
      storeId: "STORE-002",
      isoId: "ISO-12",
      subIsoId: "SUB-ISO-30",
      status: "active",
      riskLevel: "medium",
      products: [1, 2],
      salesLast7Days: 28500,
      salesLast30Days: 98200,
      salesTrend: "-8%",
      lastTransaction: "2026-02-06",
      assignedEmployee: 2,
      creditLimit: 50000,
      creditBalance: 8500,
      notes: "Sales dropped recently - follow up needed"
    },
    {
      id: 3,
      businessName: "City Center Mall Kiosk",
      contactPerson: "Mike Rodriguez",
      email: "mike@citycenter.com",
      phone: "+1-555-1003",
      storeId: "STORE-003",
      isoId: "ISO-15",
      subIsoId: "SUB-ISO-45",
      status: "active",
      riskLevel: "low",
      products: [1, 2, 3, 4],
      salesLast7Days: 62100,
      salesLast30Days: 242500,
      salesTrend: "+18%",
      lastTransaction: "2026-02-08",
      assignedEmployee: 3,
      creditLimit: 150000,
      creditBalance: 22100,
      notes: "High volume, expanding product line"
    },
    {
      id: 4,
      businessName: "Corner Store 24/7",
      contactPerson: "Lisa Chen",
      email: "lisa@corner247.com",
      phone: "+1-555-1004",
      storeId: "STORE-004",
      isoId: "ISO-10",
      subIsoId: "SUB-ISO-25",
      status: "at_risk",
      riskLevel: "high",
      products: [1],
      salesLast7Days: 3200,
      salesLast30Days: 18500,
      salesTrend: "-45%",
      lastTransaction: "2026-01-28",
      assignedEmployee: 2,
      creditLimit: 25000,
      creditBalance: 1200,
      notes: "No transactions in 10 days - urgent follow-up"
    },
    {
      id: 5,
      businessName: "Metro Gas & Convenience",
      contactPerson: "David Park",
      email: "david@metrogas.com",
      phone: "+1-555-1005",
      storeId: "STORE-005",
      isoId: "ISO-18",
      subIsoId: "SUB-ISO-52",
      status: "active",
      riskLevel: "low",
      products: [1, 2, 5],
      salesLast7Days: 38700,
      salesLast30Days: 156200,
      salesTrend: "+5%",
      lastTransaction: "2026-02-07",
      assignedEmployee: 3,
      creditLimit: 80000,
      creditBalance: 12700,
      notes: "Steady performer, considering crypto"
    }
  ];
}

// Tasks & Follow-ups
// API Endpoint: GET /api/tasks
// POST /api/tasks (create)
// PUT /api/tasks/:id (update)
// PATCH /api/tasks/:id/complete (mark complete)
if (!state.crmTasks) {
  state.crmTasks = [
    {
      id: 1,
      customerId: 4,
      customerName: "Corner Store 24/7",
      taskType: "call",
      priority: "urgent",
      title: "Call about sales drop",
      description: "No transactions in 10 days. Check if they need support or have issues.",
      assignedTo: 2,
      assignedToName: "John Manager",
      dueDate: "2026-02-09",
      status: "open",
      createdAt: "2026-02-08"
    },
    {
      id: 2,
      customerId: 2,
      customerName: "Quick Mart Express",
      taskType: "visit",
      priority: "high",
      title: "Store visit to discuss expansion",
      description: "Sales down 8%. Discuss adding Gift Cards and Crypto products.",
      assignedTo: 2,
      assignedToName: "John Manager",
      dueDate: "2026-02-10",
      status: "open",
      createdAt: "2026-02-07"
    },
    {
      id: 3,
      customerId: 3,
      customerName: "City Center Mall Kiosk",
      taskType: "email",
      priority: "normal",
      title: "Send monthly performance report",
      description: "Great performance this month - send congratulations and upsell crypto.",
      assignedTo: 3,
      assignedToName: "Sarah Sales",
      dueDate: "2026-02-11",
      status: "open",
      createdAt: "2026-02-08"
    },
    {
      id: 4,
      customerId: 1,
      customerName: "Downtown Convenience Store",
      taskType: "support",
      priority: "normal",
      title: "Train on new crypto feature",
      description: "Schedule training session for crypto transactions.",
      assignedTo: 4,
      assignedToName: "Mike Support",
      dueDate: "2026-02-12",
      status: "completed",
      createdAt: "2026-02-05",
      completedAt: "2026-02-08"
    }
  ];
}

// Smart Alerts (Auto-generated based on business rules)
// API Endpoint: GET /api/alerts (auto-generated by backend)
if (!state.crmAlerts) {
  state.crmAlerts = [
    {
      id: 1,
      type: "sales_drop",
      severity: "critical",
      customerId: 4,
      customerName: "Corner Store 24/7",
      title: "No transactions for 10+ days",
      message: "Last transaction: 2026-01-28. Sales dropped 45% in 30 days.",
      actionRequired: "Immediate call required",
      createdAt: "2026-02-08"
    },
    {
      id: 2,
      type: "sales_drop",
      severity: "warning",
      customerId: 2,
      customerName: "Quick Mart Express",
      title: "Sales declined 8% in last 30 days",
      message: "Sales: $28,500 (7d) vs $98,200 (30d). Trend: -8%",
      actionRequired: "Follow-up call recommended",
      createdAt: "2026-02-07"
    },
    {
      id: 3,
      type: "credit_limit",
      severity: "warning",
      customerId: 3,
      customerName: "City Center Mall Kiosk",
      title: "Credit balance approaching limit",
      message: "Credit used: $22,100 / $150,000 (14.7%). Monitor for next week.",
      actionRequired: "Review credit if needed",
      createdAt: "2026-02-08"
    },
    {
      id: 4,
      type: "growth_opportunity",
      severity: "info",
      customerId: 1,
      customerName: "Downtown Convenience Store",
      title: "High growth potential",
      message: "Sales up 12%. Customer is performing well. Consider upselling.",
      actionRequired: "Offer premium products",
      createdAt: "2026-02-06"
    },
    {
      id: 5,
      type: "product_disabled",
      severity: "warning",
      customerId: 4,
      customerName: "Corner Store 24/7",
      title: "Limited product access",
      message: "Only 1 product enabled (Airtime). Consider enabling Bill Payment.",
      actionRequired: "Discuss product expansion",
      createdAt: "2026-02-08"
    }
  ];
}

async function loadCRMCustomers() {
  const container = document.getElementById('crm-content');
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
      <span class="ml-3 text-gray-600">Loading B2B customers...</span>
    </div>`;
  try {
    const [summary, clients] = await Promise.all([
      window.fetchB2BCRMSummary(),
      window.fetchB2BCRMClients()
    ]);
    const totalCustomers = Number(summary.totalCustomers) ?? 0;
    const totalActive = Number(summary.totalActive) ?? 0;
    const atRisk = Number(summary.atRisk) ?? 0;
    const sales30 = Number(summary['30DaysSales']) ?? 0;
    const statusColors = (s) => {
      const v = (s || '').toLowerCase();
      if (v === 'active') return 'bg-green-100 text-green-800';
      if (v === 'at risk' || v === 'at_risk') return 'bg-red-100 text-red-800';
      return 'bg-gray-100 text-gray-800';
    };
    const formatTrend = (n) => {
      const num = Number(n);
      if (num == null || isNaN(num)) return '—';
      const sign = num >= 0 ? '+' : '';
      return `${sign}${num.toFixed(2)}%`;
    };
    const canUpdateClient = hasPermission('updateB2BClient');
    const clientsRows = (Array.isArray(clients) ? clients : []).map(c => {
      const trendNum = Number(c['7DaysTrend']);
      const trendColor = trendNum >= 0 ? 'text-green-600' : 'text-red-600';
      const trendIcon = trendNum >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
      const sevenDay = Number(c['7DaySales']) || 0;
      const thirtyDay = Number(c['30DaySales']) || 0;
      const creditLimit = Number(c.creditLimit) || 0;
      const clientCode = (c.clientCode ?? '').replace(/"/g, '&quot;');
      const partnerName = (c.partnerName ?? '').replace(/"/g, '&quot;');
      const emailTo = (c.emailTo ?? '').replace(/"/g, '&quot;');
      const statusVal = (c.status ?? 'active').replace(/"/g, '&quot;');
      const clientId = (c.clientId ?? c.id) != null ? String(c.clientId ?? c.id) : '';
      const actionsCell = canUpdateClient ? `<td class="px-4 py-3 text-sm">
        <button type="button" class="b2b-crm-edit-client-btn text-indigo-600 hover:text-indigo-800" data-client-id="${clientId}" data-partner-name="${partnerName}" data-email-to="${emailTo}" data-status="${statusVal}" data-credit-limit="${creditLimit}" title="Edit client">Edit</button>
      </td>` : '';
      return `
        <tr class="b2b-crm-client-row hover:bg-gray-50 cursor-pointer" data-client-code="${clientCode}" data-partner-name="${partnerName}" data-client-id="${clientId}" title="Click to view details">
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${(c.partnerName ?? '—').replace(/</g, '&lt;')}</td>
          <td class="px-4 py-3 text-sm text-gray-900">${(c.emailTo ?? '—').replace(/</g, '&lt;')}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-1 text-xs rounded-full ${statusColors(c.status)}">${(c.status ?? '—').replace(/</g, '&lt;')}</span>
          </td>
          <td class="px-4 py-3 text-sm font-mono text-gray-900">${(c.partnerStoreNumber ?? '—').replace(/</g, '&lt;')}</td>
          <td class="px-4 py-3 text-sm text-gray-900 text-right">$${creditLimit.toLocaleString()}</td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">$${sevenDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">$${thirtyDay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="px-4 py-3 text-sm font-medium ${trendColor}">
            <i class="fas ${trendIcon} mr-1"></i>${formatTrend(c['7DaysTrend'])}
          </td>
          ${actionsCell}
        </tr>`;
    }).join('');
    const html = `
    <!-- KPI Cards (from GET /api/b2b/crm/summary) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Total Customers</div>
        <div class="text-2xl font-bold text-gray-900">${totalCustomers.toLocaleString()}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Active</div>
        <div class="text-2xl font-bold text-green-600">${totalActive.toLocaleString()}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">At Risk</div>
        <div class="text-2xl font-bold text-red-600">${atRisk.toLocaleString()}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">30-Day Sales</div>
        <div class="text-2xl font-bold text-indigo-600">$${sales30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    </div>
    
    <!-- Client list (from GET /api/b2b/crm/clients; clientCode not displayed) -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store ID</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">7 Day Sales</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">30 Day Sales</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">7 Day Trend</th>
              ${canUpdateClient ? '<th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${clientsRows || '<tr><td colspan="' + (canUpdateClient ? 9 : 8) + '" class="px-4 py-8 text-center text-gray-500">No clients found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    `;
    container.innerHTML = html;
    // Row click: show client details popup (GET /api/b2b/crm/clients/:clientCode)
    container.querySelectorAll('.b2b-crm-client-row').forEach(tr => {
      tr.addEventListener('click', function(e) {
        if (e.target.closest('.b2b-crm-edit-client-btn')) return;
        const code = this.getAttribute('data-client-code');
        const name = (this.getAttribute('data-partner-name') || '').replace(/&quot;/g, '"');
        const cid = this.getAttribute('data-client-id') || '';
        if (code) window.showB2BCRMClientDetailsModal(code, name, cid ? parseInt(cid, 10) : undefined);
      });
    });
    container.querySelectorAll('.b2b-crm-edit-client-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const clientId = this.getAttribute('data-client-id');
        const partnerName = (this.getAttribute('data-partner-name') || '').replace(/&quot;/g, '"');
        const emailTo = (this.getAttribute('data-email-to') || '').replace(/&quot;/g, '"');
        const status = (this.getAttribute('data-status') || 'active').replace(/&quot;/g, '"');
        const creditLimit = this.getAttribute('data-credit-limit') || '0';
        if (clientId) window.showB2BCRMEditClientModal(Number(clientId), partnerName, emailTo, status, Number(creditLimit));
      });
    });
  } catch (err) {
    container.innerHTML = getApiErrorDisplay(err, { title: 'Error Loading B2B Customers' });
  }
}

// B2B CRM client details popup: Carrier Margin (view + create/update/delete for admin only)
window.showB2BCRMClientDetailsModal = async function(clientCode, partnerName, clientId) {
  if (!clientCode) return;
  const modalId = 'b2b-crm-client-details-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();
  window._b2bCrmModalState = { clientCode, partnerName, clientId };
  const safeName = (partnerName || 'Client').replace(/</g, '&lt;');
  const modalHTML = `
    <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) window.closeB2BCRMClientDetailsModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-store mr-2 text-indigo-600"></i>${safeName} - Carrier Margin
          </h3>
          <button type="button" onclick="window.closeB2BCRMClientDetailsModal()" class="text-gray-400 hover:text-gray-600 p-1"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div id="b2b-crm-client-details-body" class="p-6 overflow-auto flex-1">
          <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const bodyEl = document.getElementById('b2b-crm-client-details-body');
  try {
    const result = await window.fetchB2BCRMClientDetails(clientCode);
    const rows = result.rows ?? result;
    const list = Array.isArray(rows) ? rows : [];
    if (result.clientId != null && (window._b2bCrmModalState.clientId == null || window._b2bCrmModalState.clientId === '')) {
      window._b2bCrmModalState.clientId = result.clientId;
    }
    window._renderB2BCRMMarginTable(bodyEl, list, clientCode);
  } catch (err) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Failed to load details.');
    const is403 = err.response && err.response.status === 403;
    bodyEl.innerHTML = `
      <div class="card ${is403 ? 'bg-amber-50 border-l-4 border-amber-500' : 'bg-red-50 border-l-4 border-red-500'} p-4">
        <p class="${is403 ? 'text-amber-800' : 'text-red-600'}"><i class="fas ${is403 ? 'fa-lock' : 'fa-exclamation-circle'} mr-2"></i>${(msg || '').replace(/</g, '&lt;')}</p>
        ${is403 ? '<p class="text-amber-700 text-sm mt-1">Contact your administrator if you need access.</p>' : ''}
      </div>`;
  }
};

window._renderB2BCRMMarginTable = async function(bodyEl, rows, clientCode) {
  const state = window._b2bCrmModalState || {};
  const canManage = hasPermission('manageCarrierMargins');
  const formatDiscount = (r) => (r.discountType || '').toLowerCase() === 'percentage' ? (Number(r.discount) || 0) + '%' : '$' + (Number(r.discount) || 0).toFixed(2);
  const formatFee = (r) => (r.feeType || '').toLowerCase() === 'percentage' ? (Number(r.fee) || 0) + '%' : '$' + (Number(r.fee) || 0).toFixed(2);
  const hasRows = rows && rows.length > 0;
  const marginId = (r) => r.clientCarrierMarginId ?? r.id ?? r.carrierMarginId ?? r.marginId;
  const addBtn = canManage ? `<button type="button" onclick="window._showB2BCRMMarginCreateForm()" class="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"><i class="fas fa-plus mr-2"></i>Add carrier margin</button>` : '';
  const actionsCol = canManage ? '<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>' : '';
  const attrEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const actionsCell = (r) => {
    const mid = marginId(r);
    if (!canManage || mid == null) return '';
    return `<td class="px-4 py-2 text-sm">
        <button type="button" onclick="event.stopPropagation(); window._editB2BCRMMarginRow(this.closest('tr'))" class="text-indigo-600 hover:text-indigo-800 mr-2" title="Edit"><i class="fas fa-edit"></i></button>
        <button type="button" onclick="event.stopPropagation(); window._deleteB2BCRMMargin(${mid})" class="text-red-600 hover:text-red-800" title="Delete"><i class="fas fa-trash"></i></button>
      </td>`;
  };
  if (!hasRows && !canManage) {
    bodyEl.innerHTML = '<p class="text-gray-500 text-center py-6">No carrier margins for this client.</p>';
    return;
  }
  bodyEl.innerHTML = addBtn + `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Fee</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated On</th>
            ${actionsCol}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${(rows || []).map(r => {
            const mid = (r.clientCarrierMarginId ?? r.id ?? r.carrierMarginId ?? r.marginId) ?? '';
            const d = Number(r.discount) || 0;
            const dt = ((r.discountType || 'percentage') + '').toLowerCase();
            const f = Number(r.fee) || 0;
            const ft = ((r.feeType || 'fixed') + '').toLowerCase();
            const nameAttr = attrEsc(r.carrierName || '');
            return `
            <tr class="hover:bg-gray-50" data-margin-id="${mid}" data-carrier-name="${nameAttr}" data-discount="${d}" data-discount-type="${dt}" data-fee="${f}" data-fee-type="${ft}">
              <td class="px-4 py-3 text-sm text-gray-900">${(r.carrierName ?? '—').replace(/</g, '&lt;')}</td>
              <td class="px-4 py-3 text-sm text-gray-900 text-right">${formatDiscount(r)}</td>
              <td class="px-4 py-3 text-sm text-gray-900 text-right">${formatFee(r)}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${(r.updatedOn ?? '—').replace(/</g, '&lt;')}</td>
              ${actionsCell(r)}
            </tr>
          `;
          }).join('')}
          ${!hasRows ? '<tr><td colspan="' + (canManage ? 5 : 4) + '" class="px-4 py-6 text-center text-gray-500">No carrier margins. ' + (canManage ? 'Click "Add carrier margin" to create one.' : '') + '</td></tr>' : ''}
        </tbody>
      </table>
    </div>`;
};

window._refreshB2BCRMMarginTable = async function() {
  const state = window._b2bCrmModalState;
  const bodyEl = document.getElementById('b2b-crm-client-details-body');
  if (!bodyEl || !state || !state.clientCode) return;
  bodyEl.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  try {
    const result = await window.fetchB2BCRMClientDetails(state.clientCode);
    const rows = Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : []);
    if (result.clientId != null && (state.clientId == null || state.clientId === '')) {
      state.clientId = result.clientId;
    }
    await window._renderB2BCRMMarginTable(bodyEl, rows, state.clientCode);
  } catch (e) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(e) : (e.message || 'Failed to refresh.');
    bodyEl.innerHTML = '<p class="text-red-600">' + (msg || '').replace(/</g, '&lt;') + '</p>';
  }
};

window._showB2BCRMMarginCreateForm = async function() {
  const state = window._b2bCrmModalState;
  const bodyEl = document.getElementById('b2b-crm-client-details-body');
  if (!bodyEl || !state) return;
  if (state.clientId == null || state.clientId === '') {
    addNotification('warning', 'Cannot add', 'Client ID is required to add a carrier margin. Ensure the clients list returns clientId.');
    return;
  }
  bodyEl.innerHTML = '<div class="text-center py-6"><i class="fas fa-spinner fa-spin text-2xl text-indigo-600"></i> Loading carriers...</div>';
  let carriers = [];
  try {
    carriers = await window.fetchB2BCarriers();
  } catch (e) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(e) : 'Failed to load carriers.';
    bodyEl.innerHTML = '<p class="text-red-600">' + (msg || '').replace(/</g, '&lt;') + '</p><button type="button" onclick="window._refreshB2BCRMMarginTable()" class="mt-2 text-indigo-600">Back to list</button>';
    return;
  }
  const options = (carriers || []).map(c => `<option value="${c.carrierId}">${(c.carrierName || '').replace(/</g, '&lt;')}</option>`).join('');
  bodyEl.innerHTML = `
    <div class="space-y-4 max-w-md">
      <h4 class="font-semibold text-gray-900">Add carrier margin</h4>
      <input type="hidden" id="b2b-crm-create-clientId" value="${state.clientId}">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
        <select id="b2b-crm-create-carrierId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${options || '<option value="">No carriers</option>'}</select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Discount</label>
        <input type="number" id="b2b-crm-create-discount" step="0.01" value="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Discount type</label>
        <select id="b2b-crm-create-discountType" class="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="percentage">percentage</option><option value="fixed">fixed</option></select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fee</label>
        <input type="number" id="b2b-crm-create-fee" step="0.01" value="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fee type</label>
        <select id="b2b-crm-create-feeType" class="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="fixed">fixed</option><option value="percentage">percentage</option></select>
      </div>
      <div class="flex gap-2">
        <button type="button" onclick="window._submitB2BCRMMarginCreate()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
        <button type="button" onclick="window._refreshB2BCRMMarginTable()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </div>`;
};

window._submitB2BCRMMarginCreate = async function() {
  const clientIdRaw = document.getElementById('b2b-crm-create-clientId')?.value;
  const clientId = clientIdRaw != null && clientIdRaw !== '' ? parseInt(String(clientIdRaw), 10) : NaN;
  const carrierIdRaw = document.getElementById('b2b-crm-create-carrierId')?.value;
  const carrierId = carrierIdRaw != null && carrierIdRaw !== '' ? parseInt(String(carrierIdRaw), 10) : NaN;
  const discount = parseFloat(document.getElementById('b2b-crm-create-discount')?.value) || 0;
  const discountType = (document.getElementById('b2b-crm-create-discountType')?.value || 'percentage').toLowerCase();
  const fee = parseFloat(document.getElementById('b2b-crm-create-fee')?.value) || 0;
  const feeType = (document.getElementById('b2b-crm-create-feeType')?.value || 'fixed').toLowerCase();
  if (Number.isNaN(clientId)) {
    addNotification('warning', 'Validation', 'Client ID is missing. Close and reopen the client details.');
    return;
  }
  if (Number.isNaN(carrierId)) {
    addNotification('warning', 'Validation', 'Please select a carrier.');
    return;
  }
  if (discountType !== 'percentage' && discountType !== 'fixed') return;
  if (feeType !== 'percentage' && feeType !== 'fixed') return;
  try {
    const res = await window.createClientCarrierMargin({ clientId, carrierId, discount, discountType, fee, feeType });
    if (res.success !== false) {
      addNotification('success', 'Created', res.message || 'Carrier margin created.');
      await window._refreshB2BCRMMarginTable();
    } else {
      addNotification('error', 'Create failed', res.message || 'Could not create.');
    }
  } catch (e) {
    addNotification('error', 'Error', (typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(e) : 'Failed to create.'));
  }
};

window._editB2BCRMMarginRow = function(tr) {
  if (!tr || !tr.getAttribute) return;
  const id = tr.getAttribute('data-margin-id');
  if (id == null || id === '') return;
  const carrierName = (tr.getAttribute('data-carrier-name') || '—').replace(/</g, '&lt;');
  const discount = parseFloat(tr.getAttribute('data-discount')) || 0;
  const discountType = (tr.getAttribute('data-discount-type') || 'percentage').toLowerCase();
  const fee = parseFloat(tr.getAttribute('data-fee')) || 0;
  const feeType = (tr.getAttribute('data-fee-type') || 'fixed').toLowerCase();
  const canManage = hasPermission('manageCarrierMargins');
  const actionsCol = canManage ? `<td class="px-4 py-2">
      <button type="button" onclick="window._saveB2BCRMMarginEdit(${id})" class="text-green-600 hover:text-green-800 mr-2"><i class="fas fa-check"></i> Save</button>
      <button type="button" onclick="window._refreshB2BCRMMarginTable()" class="text-gray-600 hover:text-gray-800"><i class="fas fa-times"></i> Cancel</button>
    </td>` : '';
  tr.innerHTML = `
    <td class="px-4 py-2 text-sm text-gray-900">${carrierName}</td>
    <td class="px-4 py-2 text-right"><input type="number" step="0.01" value="${discount}" id="b2b-edit-discount-${id}" class="w-20 px-2 py-1 border rounded text-sm mr-1"><select id="b2b-edit-discountType-${id}" class="px-2 py-1 border rounded text-sm"><option value="percentage" ${discountType === 'percentage' ? 'selected' : ''}>%</option><option value="fixed" ${discountType === 'fixed' ? 'selected' : ''}>$</option></select></td>
    <td class="px-4 py-2 text-right"><input type="number" step="0.01" value="${fee}" id="b2b-edit-fee-${id}" class="w-20 px-2 py-1 border rounded text-sm mr-1"><select id="b2b-edit-feeType-${id}" class="px-2 py-1 border rounded text-sm"><option value="fixed" ${feeType === 'fixed' ? 'selected' : ''}>$</option><option value="percentage" ${feeType === 'percentage' ? 'selected' : ''}>%</option></select></td>
    <td class="px-4 py-2 text-sm text-gray-500">—</td>
    ${actionsCol}`;
};

window._saveB2BCRMMarginEdit = async function(id) {
  const mid = id != null ? (typeof id === 'number' ? id : parseInt(String(id), 10)) : NaN;
  if (Number.isNaN(mid)) {
    addNotification('error', 'Error', 'Invalid margin id.');
    return;
  }
  const discount = parseFloat(document.getElementById(`b2b-edit-discount-${id}`)?.value) || 0;
  const discountType = (document.getElementById(`b2b-edit-discountType-${id}`)?.value || 'percentage').toLowerCase();
  const fee = parseFloat(document.getElementById(`b2b-edit-fee-${id}`)?.value) || 0;
  const feeType = (document.getElementById(`b2b-edit-feeType-${id}`)?.value || 'fixed').toLowerCase();
  if (discountType !== 'percentage' && discountType !== 'fixed') return;
  if (feeType !== 'percentage' && feeType !== 'fixed') return;
  try {
    const res = await window.updateClientCarrierMargin({ id: mid, discount, discountType, fee, feeType });
    if (res && res.success === false) {
      addNotification('error', 'Update failed', res.message || 'Could not update.');
      return;
    }
    addNotification('success', 'Updated', (res && res.message) || 'Carrier margin updated.');
    await window._refreshB2BCRMMarginTable();
  } catch (e) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(e) : 'Failed to update.';
    addNotification('error', 'Error', msg);
  }
};

window._deleteB2BCRMMargin = async function(id) {
  if (!confirm('Remove this carrier margin?')) return;
  try {
    const res = await window.deleteClientCarrierMargin(id);
    if (res.success !== false) {
      addNotification('success', 'Deleted', res.message || 'Carrier margin deleted.');
      await window._refreshB2BCRMMarginTable();
    } else {
      addNotification('error', 'Delete failed', res.message || 'Could not delete.');
    }
  } catch (e) {
    const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(e) : 'Failed to delete.';
    addNotification('error', 'Error', msg);
  }
};

window.closeB2BCRMClientDetailsModal = function() {
  window._b2bCrmModalState = null;
  const m = document.getElementById('b2b-crm-client-details-modal');
  if (m) m.remove();
};

// Edit B2B CRM client (admin only): partnerName, emailTo, status (enable/disable), creditLimit
window.showB2BCRMEditClientModal = function(clientId, partnerName, emailTo, status, creditLimit) {
  if (!hasPermission('updateB2BClient')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to update clients.');
    return;
  }
  const modalId = 'b2b-crm-edit-client-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();
  const safeName = (partnerName || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const safeEmail = (emailTo || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const statusVal = (status || 'active').toLowerCase();
  const isActive = statusVal === 'active' || statusVal === 'enabled';
  const modalHTML = `
    <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) window.closeB2BCRMEditClientModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900"><i class="fas fa-edit mr-2 text-indigo-600"></i>Edit Client</h3>
        </div>
        <form id="b2b-crm-edit-client-form" class="p-6 space-y-4">
          <input type="hidden" id="b2b-edit-client-id" value="${clientId}">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
            <input type="text" id="b2b-edit-partner-name" value="${safeName}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" id="b2b-edit-email-to" value="${safeEmail}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="b2b-edit-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="active" ${isActive ? 'selected' : ''}>Active (Enabled)</option>
              <option value="inactive" ${!isActive ? 'selected' : ''}>Inactive (Disabled)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
            <input type="number" id="b2b-edit-credit-limit" value="${Number(creditLimit) || 0}" min="0" step="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" onclick="window.closeB2BCRMEditClientModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('b2b-crm-edit-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number(document.getElementById('b2b-edit-client-id').value);
    const payload = {
      clientId: id,
      partnerName: document.getElementById('b2b-edit-partner-name').value.trim(),
      emailTo: document.getElementById('b2b-edit-email-to').value.trim(),
      status: document.getElementById('b2b-edit-status').value,
      creditLimit: Number(document.getElementById('b2b-edit-credit-limit').value) || 0
    };
    try {
      await window.updateB2BCRMClient(payload);
      window.closeB2BCRMEditClientModal();
      addNotification('success', 'Client Updated', 'Client has been updated successfully.');
      loadCRMCustomers();
    } catch (err) {
      const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Update failed.');
      addNotification('error', 'Update Failed', msg);
    }
  });
};

window.closeB2BCRMEditClientModal = function() {
  const m = document.getElementById('b2b-crm-edit-client-modal');
  if (m) m.remove();
};

// Load Tasks & Follow-ups
function loadCRMTasks() {
  const tasks = state.crmTasks;
  const openTasks = tasks.filter(t => t.status === 'open');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status === 'open');
  
  const html = `
    <!-- Header with Add Task Button -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">
        <i class="fas fa-tasks mr-2"></i>Tasks & Follow-ups
      </h2>
      <button onclick="showAddTaskModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        <i class="fas fa-plus mr-2"></i>Add Task
      </button>
    </div>
    
    <!-- Task KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Open Tasks</div>
        <div class="text-2xl font-bold text-orange-600">${openTasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Urgent</div>
        <div class="text-2xl font-bold text-red-600">${urgentTasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Completed</div>
        <div class="text-2xl font-bold text-green-600">${completedTasks.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Total</div>
        <div class="text-2xl font-bold text-gray-900">${tasks.length}</div>
      </div>
    </div>
    
    <!-- Open Tasks -->
    <div class="card mb-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">
        <i class="fas fa-tasks mr-2"></i>Open Tasks
      </h3>
      <div class="space-y-3">
        ${openTasks.length === 0 ? `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-check-circle text-4xl mb-2"></i>
            <p>No open tasks! Great job! 🎉</p>
          </div>
        ` : openTasks.map(task => {
          const priorityColors = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            normal: 'bg-blue-100 text-blue-800 border-blue-200'
          };
          const taskIcons = {
            call: 'fa-phone',
            visit: 'fa-store',
            email: 'fa-envelope',
            support: 'fa-life-ring'
          };
          
          return `
            <div class="border ${priorityColors[task.priority]} rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <i class="fas ${taskIcons[task.taskType]} text-lg"></i>
                    <h4 class="font-medium text-gray-900">${task.title}</h4>
                    <span class="px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}">
                      ${task.priority}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">${task.description}</p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span><i class="fas fa-user mr-1"></i>${task.assignedToName}</span>
                    <span><i class="fas fa-store mr-1"></i>${task.customerName}</span>
                    <span><i class="fas fa-calendar mr-1"></i>Due: ${task.dueDate}</span>
                  </div>
                </div>
                <button onclick="completeTask(${task.id})" class="ml-4 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  <i class="fas fa-check mr-1"></i>Complete
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- Completed Tasks -->
    ${completedTasks.length > 0 ? `
      <div class="card">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          <i class="fas fa-check-circle text-green-600 mr-2"></i>Completed Tasks
        </h3>
        <div class="space-y-3">
          ${completedTasks.map(task => `
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900 mb-1">${task.title}</h4>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span><i class="fas fa-user mr-1"></i>${task.assignedToName}</span>
                    <span><i class="fas fa-store mr-1"></i>${task.customerName}</span>
                    <span><i class="fas fa-check mr-1"></i>${task.completedAt}</span>
                  </div>
                </div>
                <i class="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
  
  document.getElementById("crm-content").innerHTML = html;
}

// Load Smart Alerts
function loadCRMAlerts() {
  const alerts = state.crmAlerts;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');
  
  const html = `
    <!-- Alert KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Critical</div>
        <div class="text-2xl font-bold text-red-600">${criticalAlerts.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Warnings</div>
        <div class="text-2xl font-bold text-orange-600">${warningAlerts.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Info</div>
        <div class="text-2xl font-bold text-blue-600">${infoAlerts.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Total Alerts</div>
        <div class="text-2xl font-bold text-gray-900">${alerts.length}</div>
      </div>
    </div>
    
    <!-- Alerts List -->
    <div class="space-y-4">
      ${alerts.map(alert => {
        const severityConfig = {
          critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' },
          warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' },
          info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' }
        };
        const config = severityConfig[alert.severity];
        
        const typeIcons = {
          sales_drop: 'fa-arrow-down',
          credit_limit: 'fa-credit-card',
          growth_opportunity: 'fa-chart-line',
          product_disabled: 'fa-box'
        };
        
        return `
          <div class="card ${config.bg} border ${config.border}">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <i class="fas ${typeIcons[alert.type]} ${config.icon} text-2xl"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-bold text-gray-900">${alert.title}</h4>
                  <span class="px-2 py-1 text-xs rounded-full ${config.badge}">
                    ${alert.severity}
                  </span>
                </div>
                <p class="text-sm text-gray-700 mb-2">${alert.message}</p>
                <div class="flex items-center justify-between">
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-store mr-1"></i>${alert.customerName}
                    <span class="mx-2">•</span>
                    <i class="fas fa-clock mr-1"></i>${alert.createdAt}
                  </div>
                  <button onclick="handleAlert(${alert.id}, ${alert.customerId})" class="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                    <i class="fas fa-tasks mr-1"></i>${alert.actionRequired}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  document.getElementById("crm-content").innerHTML = html;
}

// Load Products
function loadCRMProducts() {
  const products = state.products;
  const enabledCount = products.filter(p => p.enabled).length;
  
  const html = `
    <!-- Product KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Total Products</div>
        <div class="text-2xl font-bold text-gray-900">${products.length}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Enabled</div>
        <div class="text-2xl font-bold text-green-600">${enabledCount}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Categories</div>
        <div class="text-2xl font-bold text-indigo-600">${new Set(products.map(p => p.category)).size}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-500">Avg Commission</div>
        <div class="text-2xl font-bold text-blue-600">${(products.reduce((sum, p) => sum + p.commission, 0) / products.length).toFixed(1)}%</div>
      </div>
    </div>
    
    <!-- Products Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${products.map(product => `
        <div class="card ${product.enabled ? 'border-green-200' : 'border-gray-200'}">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">${product.name}</h3>
              <p class="text-sm text-gray-500">${product.category}</p>
            </div>
            <span class="px-2 py-1 text-xs rounded-full ${product.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
              ${product.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Commission:</span>
              <span class="font-medium text-gray-900">${product.commission}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Customers Using:</span>
              <span class="font-medium text-gray-900">${state.crmCustomers.filter(c => c.products.includes(product.id)).length}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  document.getElementById("crm-content").innerHTML = html;
}

// Add B2B Customer (admin only): partnerName, emailTo, status, storeId, creditLimit — POST /api/b2b/crm/clients
window.showAddCustomer = function() {
  if (!hasPermission('addB2BClient')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to add B2B customers.');
    return;
  }
  const modalId = 'b2b-crm-add-client-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();
  const modalHTML = `
    <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) window.closeB2BCRMAddClientModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900"><i class="fas fa-plus mr-2 text-indigo-600"></i>Add B2B Customer</h3>
        </div>
        <form id="b2b-crm-add-client-form" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
            <input type="text" id="b2b-add-partner-name" required placeholder="e.g., Acme Corp" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" id="b2b-add-email-to" required placeholder="e.g., billing@acme.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="b2b-add-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="active">Active (Enabled)</option>
              <option value="inactive">Inactive (Disabled)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Store ID *</label>
            <input type="text" id="b2b-add-store-id" required placeholder="e.g., STORE-001" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
            <input type="number" id="b2b-add-credit-limit" value="0" min="0" step="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" onclick="window.closeB2BCRMAddClientModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Customer</button>
          </div>
        </form>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.getElementById('b2b-crm-add-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      partnerName: document.getElementById('b2b-add-partner-name').value.trim(),
      emailTo: document.getElementById('b2b-add-email-to').value.trim(),
      status: document.getElementById('b2b-add-status').value,
      storeId: document.getElementById('b2b-add-store-id').value.trim(),
      creditLimit: Number(document.getElementById('b2b-add-credit-limit').value) || 0
    };
    try {
      await window.createB2BCRMClient(payload);
      window.closeB2BCRMAddClientModal();
      addNotification('success', 'Customer Added', 'B2B customer has been added successfully.');
      loadCRMCustomers();
    } catch (err) {
      const msg = typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Create failed.');
      addNotification('error', 'Add Failed', msg);
    }
  });
};

window.closeB2BCRMAddClientModal = function() {
  const m = document.getElementById('b2b-crm-add-client-modal');
  if (m) m.remove();
};

window.closeCustomerModal = function() {
  const modal = document.getElementById('customer-modal');
  if (modal) modal.remove();
};

window.saveNewCustomer = function(event) {
  event.preventDefault();
  
  const employeeId = parseInt(document.getElementById('customer-assigned-employee').value);
  const employee = state.employees?.find(e => e.id === employeeId);
  
  // Default values for backend-managed fields
  const defaultProducts = [1]; // Default to Airtime only
  const defaultCreditLimit = 50000; // Default $50k credit limit
  
  const newCustomer = {
    id: Date.now(),
    businessName: document.getElementById('customer-business-name').value,
    contactPerson: document.getElementById('customer-contact-person').value,
    email: document.getElementById('customer-email').value,
    phone: document.getElementById('customer-phone').value,
    storeId: document.getElementById('customer-store-id').value,
    isoId: document.getElementById('customer-iso-id').value,
    subIsoId: document.getElementById('customer-sub-iso-id').value,
    status: 'active',
    riskLevel: 'low',
    products: defaultProducts, // Backend will manage this via API
    salesLast7Days: 0,
    salesLast30Days: 0,
    salesTrend: 'New',
    lastTransaction: new Date().toISOString().split('T')[0],
    assignedEmployee: employeeId,
    creditLimit: defaultCreditLimit, // Backend will manage this via API
    creditBalance: 0,
    notes: document.getElementById('customer-notes').value
  };
  
  state.crmCustomers.push(newCustomer);
  closeCustomerModal();
  loadCRMCustomers();
  addNotification('success', 'Customer Added', `${newCustomer.businessName} added successfully! Assigned to ${employee?.name || 'Unknown'}. Products & credit will be configured by backend.`);
};

window.viewCustomerDetail = function(customerId) {
  const customer = state.crmCustomers.find(c => c.id === customerId);
  if (!customer) return;
  
  const products = customer.products.map(pid => state.products.find(p => p.id === pid)?.name || 'Unknown').join(', ');
  const employee = state.employees?.find(e => e.id === customer.assignedEmployee)?.name || 'Unassigned';
  
  addNotification('info', customer.businessName, `
    Contact: ${customer.contactPerson}<br>
    Products: ${products}<br>
    Sales (7d): $${customer.salesLast7Days.toLocaleString()}<br>
    Sales (30d): $${customer.salesLast30Days.toLocaleString()}<br>
    Assigned to: ${employee}
  `);
};

window.editCustomer = function(customerId) {
  if (!hasPermission('editContact')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to edit customers');
    return;
  }
  addNotification('info', 'Coming Soon', 'Edit customer form will be available soon');
};

window.createCRMTaskForCustomer = function(customerId) {
  const customer = state.crmCustomers.find(c => c.id === customerId);
  if (!customer) return;
  
  addNotification('success', 'Task Created', `Task created for ${customer.businessName}`);
};

window.completeTask = function(taskId) {
  const task = state.crmTasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString().split('T')[0];
    loadCRMTasks();
    addNotification('success', 'Task Completed', `"${task.title}" marked as complete`);
  }
};

window.handleAlert = function(alertId, customerId) {
  const alert = state.crmAlerts.find(a => a.id === alertId);
  if (alert) {
    window.createCRMTaskForCustomer(customerId);
  }
};

// Add Task Modal (CRM) - uses assignable users only, not /api/auth/users
window.showAddTaskModal = function() {
  const customers = state.crmCustomers || [];
  
  const modalHTML = `
    <div id="task-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) closeTaskModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-tasks mr-2"></i>Add New Task
            </h2>
            <button onclick="closeTaskModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <form id="task-form" class="p-6 space-y-4" onsubmit="saveNewCRMTask(event)">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select id="task-customer" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Select Customer</option>
                ${customers.map(c => `<option value="${c.id}">${c.businessName}</option>`).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Task Type *</label>
              <select id="task-type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="call">📞 Call</option>
                <option value="visit">🏪 Store Visit</option>
                <option value="email">📧 Email</option>
                <option value="support">🛟 Support</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select id="task-priority" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" id="task-title" required placeholder="e.g., Follow up on sales drop"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea id="task-description" required rows="3" placeholder="Describe what needs to be done..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
              <select id="task-assigned" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Loading...</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" id="task-due-date" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onclick="closeTaskModal()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <i class="fas fa-check mr-2"></i>Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('task-due-date').value = tomorrow.toISOString().split('T')[0];
  
  // Populate assignee dropdown from assignable users (not /api/auth/users)
  (async function() {
    const sel = document.getElementById('task-assigned');
    if (!sel) return;
    try {
      const users = await window.fetchAssignableUsers();
      const displayName = (u) => (u.name || u.username || 'User ' + u.id);
      sel.innerHTML = '<option value="">Select user...</option>' + users.map(u => 
        `<option value="${u.id}" data-name="${escapeHtml(displayName(u))}">${escapeHtml(displayName(u))}</option>`
      ).join('');
    } catch (e) {
      sel.innerHTML = '<option value="">Failed to load users</option>';
    }
  })();
};

window.closeTaskModal = function() {
  const modal = document.getElementById('task-modal');
  if (modal) modal.remove();
};

window.saveNewCRMTask = function(event) {
  event.preventDefault();
  
  const customerId = parseInt(document.getElementById('task-customer').value);
  const customer = state.crmCustomers.find(c => c.id === customerId);
  const assignedEl = document.getElementById('task-assigned');
  const employeeId = parseInt(assignedEl.value);
  const assignedToName = assignedEl.options[assignedEl.selectedIndex]?.getAttribute('data-name') || assignedEl.options[assignedEl.selectedIndex]?.textContent || 'Unknown';
  
  const newTask = {
    id: Date.now(),
    customerId: customerId,
    customerName: customer?.businessName || 'Unknown',
    taskType: document.getElementById('task-type').value,
    priority: document.getElementById('task-priority').value,
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-description').value,
    assignedTo: employeeId,
    assignedToName: assignedToName,
    dueDate: document.getElementById('task-due-date').value,
    status: 'open',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  state.crmTasks.push(newTask);
  closeTaskModal();
  loadCRMTasks();
  addNotification('success', 'Task Created', `New task "${newTask.title}" created successfully!`);
};

window.showAddContact = function() {
  if (!hasPermission('addContact')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to add contacts');
    return;
  }
  showContactModal();
};

window.editContact = function(id) {
  if (!hasPermission('editContact')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to edit contacts');
    return;
  }
  const contact = state.crmContacts.find(c => c.id === id);
  if (contact) showContactModal(contact);
};

window.deleteContact = function(id) {
  if (!hasPermission('deleteContact')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to delete contacts');
    return;
  }
  const contact = state.crmContacts.find(c => c.id === id);
  if (contact && confirm(`Delete contact ${contact.name}?`)) {
    state.crmContacts = state.crmContacts.filter(c => c.id !== id);
    loadCRMContacts();
    addNotification('success', 'Contact Deleted', `${contact.name} removed from CRM`);
  }
};

window.showContactModal = function(contact = null) {
  const isEdit = contact !== null;
  const modalHTML = `
    <div id="contact-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target===this) closeContactModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-address-book mr-2"></i>${isEdit ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <button onclick="closeContactModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <form id="contact-form" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
              <input type="text" id="contact-name" value="${contact?.name || ''}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input type="text" id="contact-company" value="${contact?.company || ''}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" id="contact-email" value="${contact?.email || ''}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" id="contact-phone" value="${contact?.phone || ''}" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select id="contact-status" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="prospect" ${contact?.status === 'prospect' ? 'selected' : ''}>Prospect</option>
                <option value="active" ${!contact || contact?.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${contact?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
              <input type="date" id="contact-lastContact" value="${contact?.lastContact || new Date().toISOString().split('T')[0]}"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="contact-notes" rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">${contact?.notes || ''}</textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" onclick="closeContactModal()" 
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <i class="fas fa-save mr-2"></i>${isEdit ? 'Update' : 'Add'} Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveContact(contact?.id);
  });
};

window.saveContact = function(id) {
  const formData = {
    name: document.getElementById('contact-name').value,
    company: document.getElementById('contact-company').value,
    email: document.getElementById('contact-email').value,
    phone: document.getElementById('contact-phone').value,
    status: document.getElementById('contact-status').value,
    lastContact: document.getElementById('contact-lastContact').value,
    notes: document.getElementById('contact-notes').value
  };
  
  if (id) {
    const index = state.crmContacts.findIndex(c => c.id === id);
    if (index !== -1) {
      state.crmContacts[index] = { ...state.crmContacts[index], ...formData };
      addNotification('success', 'Contact Updated', `${formData.name} updated successfully`);
    }
  } else {
    const newContact = {
      id: Math.max(...state.crmContacts.map(c => c.id)) + 1,
      ...formData
    };
    state.crmContacts.push(newContact);
    addNotification('success', 'Contact Added', `${formData.name} added to CRM`);
  }
  
  closeContactModal();
  loadCRMContacts();
};

window.closeContactModal = function() {
  const modal = document.getElementById('contact-modal');
  if (modal) modal.remove();
};

function loadCRMDeals() {
  // Dummy deals data
  const deals = [
    {id: 1, title: "DT One - Enterprise Plan", value: "$150K", stage: "negotiation", probability: 75, company: "DT One"},
    {id: 2, title: "SurePays - API Integration", value: "$80K", stage: "proposal", probability: 60, company: "SurePays"},
    {id: 3, title: "EZPay - Volume Discount", value: "$120K", stage: "qualified", probability: 40, company: "EZPay"}
  ];
  
  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];
  
  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      ${stages.map(stage => `
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-medium text-gray-900 mb-3 capitalize">
            <i class="fas fa-circle text-xs mr-2"></i>${stage}
          </h3>
          <div class="space-y-3">
            ${deals.filter(d => d.stage === stage).map(deal => `
              <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition">
                <h4 class="font-medium text-sm text-gray-900 mb-2">${deal.title}</h4>
                <p class="text-xs text-gray-500 mb-2">${deal.company}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-green-600">${deal.value}</span>
                  <span class="text-gray-500">${deal.probability}%</span>
                </div>
              </div>
            `).join('') || '<p class="text-sm text-gray-400">No deals</p>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  document.getElementById("crm-content").innerHTML = html;
}

function loadCRMActivities() {
  // Dummy activities data
  const activities = [
    {id: 1, type: "call", contact: "DT One", description: "Discussed quarterly pricing", date: "2026-02-07 14:30", user: "Admin"},
    {id: 2, type: "email", contact: "SurePays", description: "Sent proposal document", date: "2026-02-07 10:15", user: "Sales"},
    {id: 3, type: "meeting", contact: "EZPay", description: "Demo presentation", date: "2026-02-06 15:00", user: "Admin"},
    {id: 4, type: "note", contact: "TeleRecharge", description: "Follow up next week", date: "2026-02-06 09:00", user: "Sales"}
  ];
  
  const html = `
    <div class="card">
      <div class="flow-root">
        <ul class="-mb-8">
          ${activities.map((activity, idx) => `
            <li>
              <div class="relative pb-8">
                ${idx !== activities.length - 1 ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>' : ''}
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      activity.type === 'call' ? 'bg-blue-500' :
                      activity.type === 'email' ? 'bg-green-500' :
                      activity.type === 'meeting' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }">
                      <i class="fas fa-${
                        activity.type === 'call' ? 'phone' :
                        activity.type === 'email' ? 'envelope' :
                        activity.type === 'meeting' ? 'users' :
                        'sticky-note'
                      } text-white text-xs"></i>
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-900">${activity.contact}</p>
                      <p class="text-xs text-gray-500">${activity.date}</p>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${activity.description}</p>
                    <p class="text-xs text-gray-500 mt-1">by ${activity.user}</p>
                  </div>
                </div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  document.getElementById("crm-content").innerHTML = html;
}

async function loadAIReports() {
  const content = document.getElementById("main-content");
  content.innerHTML = `<div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900"><i class="fas fa-chart-bar mr-2"></i>Reports</h1>
      <select id="report-type" onchange="loadReportData(this.value)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
        <option value="vendor">Vendor (Cellpay)</option>
        <option value="b2b-sales">B2B Sales</option>
        <option value="mid-volume">MID Volume</option>
        <option value="others-volume">Payin (Others Volume)</option>
        <option value="mastercard">Virtual Card</option>
        <option value="d2c-carrier">D2C Sales - Carrier</option>
        <option value="arb">ARB</option>
        <option value="payouts">Payouts</option>
        <option value="d2c-payment">D2C Sales - Payment Method</option>
        <option value="sales-carrier">Sales - Carrier</option>
        <option value="arb-count">ARB Count</option>
        <option value="manual-spender">Manual Spender</option>
        <option value="smart-safe">Smart Safe</option>
      </select>
    </div>
    
    <!-- Date Range Filter & Actions -->
    <div class="card">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2 flex-wrap gap-2">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <select id="report-date-range" onchange="toggleCustomDateInputs('report-date-range', 'report-custom-range-wrap'); loadReportData(document.getElementById('report-type').value);" class="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="lastday" selected>Last Day</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="january">January 2026</option>
            <option value="custom">Custom Range</option>
          </select>
          <div id="report-custom-range-wrap" class="hidden flex items-center gap-2">
            <label class="text-sm text-gray-600">From</label>
            <input type="date" id="custom-start-date" onchange="loadReportData(document.getElementById('report-type').value)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <label class="text-sm text-gray-600">To</label>
            <input type="date" id="custom-end-date" onchange="loadReportData(document.getElementById('report-type').value)" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
        </div>
        
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <input type="text" id="report-search" placeholder="Search in report..." 
              onkeyup="filterReportTable()" 
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        
        <button onclick="exportReport()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <i class="fas fa-download mr-2"></i>Export CSV
        </button>
        <button onclick="printReport()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <i class="fas fa-print mr-2"></i>Print
        </button>
      </div>
    </div>
    
    <!-- Report Content -->
    <div id="report-content">
      <div class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i>
        <p class="mt-4 text-gray-600">Loading report...</p>
      </div>
    </div>
  </div>`;
  
  // Load default report
  loadReportData('vendor');
}

window.askAI = async function() {
  const query = document.getElementById("ai-query").value;
  if (!query) return;
  document.getElementById("ai-results").classList.remove("hidden");
  document.getElementById("ai-content").innerHTML = `<div class="animate-pulse"><div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div class="h-4 bg-gray-200 rounded w-1/2"></div></div>`;
  setTimeout(() => {
    document.getElementById("ai-content").innerHTML = `<p class="text-gray-700">Based on the analysis: <strong>${query}</strong></p><ul class="mt-2 space-y-1 list-disc list-inside"><li>Top performing carrier: T-Mobile with 45% success rate</li><li>Recommended action: Review Sprint API connection</li><li>Peak transaction time: 2-4 PM EST</li></ul>`;
  }, 1000);
};

window.askAIQuick = function(query) {
  document.getElementById("ai-query").value = query;
  askAI();
};

// Report date range: convert UI value (lastday, today, 7d, 30d, january, custom) to startDate/endDate (YYYY-MM-DD).
window.getReportDateRange = function(dateRangeValue) {
  const v = (dateRangeValue || 'lastday').toLowerCase();
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (v === 'lastday') {
    return { startDate: yesterdayStr, endDate: yesterdayStr };
  }
  if (v === 'today' || v === '1d') {
    return { startDate: todayStr, endDate: todayStr };
  }
  if (v === '7d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const s = start.toISOString().slice(0, 10);
    return { startDate: s, endDate: yesterdayStr };
  }
  if (v === '30d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    const s = start.toISOString().slice(0, 10);
    return { startDate: s, endDate: yesterdayStr };
  }
  if (v === 'january') {
    const year = today.getMonth() >= 1 ? y : y - 1;
    return { startDate: `${year}-01-01`, endDate: `${year}-01-31` };
  }
  if (v === 'custom') {
    const startEl = document.getElementById('custom-start-date');
    const endEl = document.getElementById('custom-end-date');
    if (startEl?.value && endEl?.value) {
      return { startDate: startEl.value, endDate: endEl.value };
    }
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { startDate: start.toISOString().slice(0, 10), endDate: yesterdayStr };
  }
  const days = parseInt(v.replace(/\D/g, ''), 10) || 7;
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { startDate: start.toISOString().slice(0, 10), endDate: yesterdayStr };
};

// Report Loading Functions
window.loadReportData = async function(reportType) {
  
  const content = document.getElementById('report-content');
  
  try {
    const dateRange = document.getElementById('report-date-range')?.value || 'lastday';
    
    switch(reportType) {
      case 'vendor':
        await loadVendorReport(content, dateRange);
        break;
      case 'b2b-sales':
        await loadB2BSalesReport(content, dateRange);
        break;
      case 'mid-volume':
        await loadMIDVolumeReport(content, dateRange);
        break;
      case 'sales-carrier':
        await loadSalesCarrierReport(content, dateRange);
        break;
      case 'd2c-carrier':
        await loadD2CCarrierReport(content, dateRange);
        break;
      case 'mastercard':
        await loadMasterCardReport(content, dateRange);
        break;
      case 'd2c-payment':
        await loadD2CPaymentReport(content, dateRange);
        break;
      case 'arb':
        await loadARBReport(content, dateRange);
        break;
      case 'arb-count':
        await loadARBCountReport(content, dateRange);
        break;
      case 'payouts':
        await loadPayoutsReport(content, dateRange);
        break;
      case 'manual-spender':
        await loadManualSpenderReport(content, dateRange);
        break;
      case 'smart-safe':
        await loadSmartSafeReport(content, dateRange);
        break;
      case 'others-volume':
        await loadOthersVolumeReport(content, dateRange);
        break;
      default:
        content.innerHTML = '<div class="card"><p class="text-gray-500">Report type not implemented yet</p></div>';
    }
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
};

// Vendor Report - Shows YOUR suppliers (where YOU buy products from)
async function loadVendorReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const vendors = await window.fetchBusinessReport('vendor', startDate, endDate);
    
    let totalVolume = 0;
    let totalSales = 0;
    let totalCommission = 0;
    
    (vendors || []).forEach(v => {
      totalVolume += Number(v.volume) || 0;
      totalSales += Number(v.sales) || 0;
      totalCommission += Number(v.commission) || 0;
    });
    
    const sortedVendors = [...(vendors || [])].sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0));
    const totalVolumeForPct = totalVolume || 1;
    
    if (!vendors || vendors.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-truck mr-2"></i>Vendor Report
          </h3>
          <p class="text-gray-700">Shows where you BUY products from vendors</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No vendor data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-truck mr-2"></i>Vendor Report
          </h3>
          <p class="text-gray-700">Shows where you BUY products from vendors</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Volume</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalVolume.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-indigo-600"></i>
            </div>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Purchases</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</h3>
              </div>
              <i class="fas fa-box text-3xl text-green-600"></i>
            </div>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Commissions Paid</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalCommission.toFixed(2)}</h3>
              </div>
              <i class="fas fa-hand-holding-usd text-3xl text-blue-600"></i>
            </div>
          </div>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Vendor Performance</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Commission</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedVendors.map((vendor, index) => {
                  const vol = Number(vendor.volume) || 0;
                  const percentage = ((vol / totalVolumeForPct) * 100).toFixed(1);
                  const name = vendor.name || '';
                  const isCombined = name.endsWith('++');
                  const displayName = isCombined ? name.slice(0, -2) : name;
                  const combinedMsg = isCombined ? `<div class="text-xs text-gray-500">All ${displayName} products combined</div>` : '';
                  return `
                    <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''}">
                      <td class="px-6 py-4">
                        <div>
                          <div class="text-sm font-medium text-gray-900">${displayName}</div>
                          ${combinedMsg}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm">${vendor.sales ?? ''}</td>
                      <td class="px-6 py-4 text-sm font-medium">$${vol.toFixed(2)}</td>
                      <td class="px-6 py-4 text-sm">$${(Number(vendor.commission) || 0).toFixed(2)}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <span class="text-sm mr-2">${percentage}%</span>
                          <div class="w-16 bg-gray-200 rounded-full h-2">
                            <div class="bg-indigo-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm">TOTAL</td>
                  <td class="px-6 py-4 text-sm">${totalSales}</td>
                  <td class="px-6 py-4 text-sm">$${totalVolume.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm">$${totalCommission.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top Vendors</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="vendor-chart"></canvas>
          </div>
        </div>
        
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <p class="text-sm text-blue-900">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>Vendor Report:</strong> Shows YOUR suppliers. All CSQ entries consolidated into one row.
          </p>
        </div>
      </div>
    `;
    
    renderChart('vendor-chart', 'bar', {
      labels: sortedVendors.slice(0, 5).map(v => v.name),
      datasets: [{
        label: 'Volume ($)',
        data: sortedVendors.slice(0, 5).map(v => Number(v.volume) || 0),
        backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981']
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}
// Opens a modal with B2B sales details by carrier for a given client (provider). Uses fetchB2BSalesDetails from api.js.
window.showB2BSalesDetailsModal = async function(providerName, clientCode, startDate, endDate) {
  if (!clientCode) return;
  const modalId = 'b2b-sales-details-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();
  const safeName = (providerName || 'Provider').replace(/</g, '&lt;');
  const modalHTML = `
    <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target===this) window.closeB2BSalesDetailsModal()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">
            <i class="fas fa-users mr-2 text-indigo-600"></i>B2B Sales Details – ${safeName}
          </h3>
          <button type="button" onclick="window.closeB2BSalesDetailsModal()" class="text-gray-400 hover:text-gray-600 p-1"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div id="b2b-details-modal-body" class="p-6 overflow-auto flex-1">
          <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const bodyEl = document.getElementById('b2b-details-modal-body');
  try {
    const rows = await window.fetchB2BSalesDetails(startDate, endDate, clientCode);
    if (rows.length === 0) {
      bodyEl.innerHTML = '<p class="text-gray-500 text-center py-6">No carrier details for this provider in the selected date range.</p>';
    } else {
      const totalCount = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
      const totalAmount = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
      const totalCommission = rows.reduce((s, r) => s + (Number(r.commission) || 0), 0);
      bodyEl.innerHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${rows.map(r => `
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">${(r.carrierName ?? r.carrier ?? '').replace(/</g, '&lt;')}</td>
                  <td class="px-4 py-3 text-sm text-gray-900 text-right">${(Number(r.count) || 0).toLocaleString()}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">$${(Number(r.amount) || 0).toFixed(2)}</td>
                  <td class="px-4 py-3 text-sm text-gray-900 text-right">$${(Number(r.commission) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot class="bg-gray-100 font-bold">
              <tr>
                <td class="px-4 py-3 text-sm text-gray-900">Total</td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">${totalCount.toLocaleString()}</td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">$${totalAmount.toFixed(2)}</td>
                <td class="px-4 py-3 text-sm text-gray-900 text-right">$${totalCommission.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`;
    }
  } catch (err) {
    const is403 = err.response && err.response.status === 403;
    const message = (typeof window.getApiErrorMessage === 'function' ? window.getApiErrorMessage(err) : (err.message || 'Please try again.'));
    const safeMessage = (message || '').replace(/</g, '&lt;');
    bodyEl.innerHTML = is403
      ? `<div class="card bg-amber-50 border-l-4 border-amber-500 p-4">
          <p class="text-amber-800"><i class="fas fa-lock mr-2"></i>${safeMessage}</p>
          <p class="text-amber-700 text-sm mt-1">Contact your administrator if you need access.</p>
        </div>`
      : `<div class="card bg-red-50 border-l-4 border-red-500 p-4">
          <p class="text-red-600"><i class="fas fa-exclamation-circle mr-2"></i>${safeMessage}</p>
        </div>`;
  }
};
window.closeB2BSalesDetailsModal = function() {
  const m = document.getElementById('b2b-sales-details-modal');
  if (m) m.remove();
};

async function loadB2BSalesReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('b2b-sales', startDate, endDate);
    
    // Map API response (provider, clientCode, count, amount, commission_received, commission_given) to original UI shape; clientCode kept for detail API, not shown in UI
    const b2bCustomers = (Array.isArray(rows) ? rows : []).map(row => ({
      name: row.provider ?? '',
      clientCode: row.clientCode ?? '',
      service_type: row.service_type ?? 'ALL',
      total_sales: Number(row.count) || 0,
      total_amount: Number(row.amount) || 0,
      client_discount: Number(row.commission_given) || 0,
      vendor_commission: Number(row.commission_received) || 0
    }));
    
    let totalSales = 0;
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalCommission = 0;
    b2bCustomers.forEach(c => {
      totalSales += c.total_sales;
      totalAmount += c.total_amount;
      totalDiscount += c.client_discount;
      totalCommission += c.vendor_commission;
    });
    
    if (b2bCustomers.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-users mr-2"></i>B2B Sales Report
          </h3>
          <p class="text-gray-700">Shows YOUR CUSTOMERS who buy from you (B2B clients)</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No B2B sales data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-users mr-2"></i>B2B Sales Report
          </h3>
          <p class="text-gray-700">Shows YOUR CUSTOMERS who buy from you (B2B clients)</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Sales</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</h3>
              </div>
              <i class="fas fa-shopping-cart text-3xl text-blue-600"></i>
            </div>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Client Discount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalDiscount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-tag text-3xl text-orange-600"></i>
            </div>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Your Commission</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalCommission.toFixed(2)}</h3>
              </div>
              <i class="fas fa-hand-holding-usd text-3xl text-indigo-600"></i>
            </div>
          </div>
        </div>
        
        <!-- B2B Customer Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">B2B Customer Performance</h3>
          <p class="text-sm text-gray-600 mb-4">Your customers who buy products from you</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Client Discount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Vendor Commission</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${b2bCustomers.sort((a, b) => b.total_amount - a.total_amount).map((customer, index) => `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''}">
                    <td class="px-6 py-4">
                      <button type="button" class="b2b-provider-link text-left text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:underline" data-client-code="${(customer.clientCode || '').replace(/"/g, '&quot;')}" data-start-date="${startDate}" data-end-date="${endDate}" data-provider-name="${(customer.name || '').replace(/"/g, '&quot;')}">${customer.name || '—'}</button>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">${customer.service_type}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${customer.total_sales.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">$${customer.total_amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${customer.client_discount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${customer.vendor_commission.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900" colspan="2">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalSales.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalDiscount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalCommission.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top Customers Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top 10 B2B Customers by Amount</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="b2b-volume-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="space-y-2">
            <p class="text-sm text-blue-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>B2B Sales Report:</strong> Shows YOUR CUSTOMERS who buy products from you.
            </p>
            <p class="text-sm text-blue-900">
              <i class="fas fa-shopping-cart mr-2"></i>
              Total Amount = Revenue from B2B customers purchasing through your platform.
            </p>
            <p class="text-sm text-blue-900">
              <i class="fas fa-hand-holding-usd mr-2"></i>
              Total Vendor Commission = Your earnings from these B2B sales.
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Render chart
    const topCustomers = b2bCustomers.sort((a, b) => b.total_amount - a.total_amount).slice(0, 10);
    renderChart('b2b-volume-chart', 'bar', {
      labels: topCustomers.map(c => c.name),
      datasets: [{
        label: 'Total Amount ($)',
        data: topCustomers.map(c => c.total_amount),
        backgroundColor: '#3B82F6'
      }]
    });
    
    // Delegated click: open B2B sales details modal when provider is clicked
    content.addEventListener('click', function onB2BProviderClick(e) {
      const btn = e.target.closest('.b2b-provider-link');
      if (!btn) return;
      e.preventDefault();
      const providerName = (btn.getAttribute('data-provider-name') || '').replace(/&quot;/g, '"');
      const clientCode = (btn.getAttribute('data-client-code') || '').replace(/&quot;/g, '"');
      const startDate = btn.getAttribute('data-start-date') || '';
      const endDate = btn.getAttribute('data-end-date') || '';
      if (clientCode) window.showB2BSalesDetailsModal(providerName, clientCode, startDate, endDate);
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading B2B Sales Report' });
  }
}
// Sales by Carrier Report - API: reportType=sales-carrier, response: companyName, amount, fee, volume, commission, totalProfit
async function loadSalesCarrierReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('sales-carrier', startDate, endDate);
    
    // Map API (companyName, amount, fee, volume, commission, totalProfit) to UI shape (carrier, amount, fee, volume, commission, profit)
    const carriers = (Array.isArray(rows) ? rows : []).map(row => ({
      carrier: row.companyName ?? row.carrier ?? '',
      volume: Number(row.volume) || 0,
      amount: Number(row.amount) || 0,
      fee: Number(row.fee) || 0,
      commission: Number(row.commission) || 0,
      profit: Number(row.totalProfit ?? row.profit) || 0
    }));

    let totalVolume = 0;
    let totalAmount = 0;
    let totalFee = 0;
    let totalCommission = 0;
    let totalProfit = 0;
    carriers.forEach(c => {
      totalVolume += c.volume;
      totalAmount += c.amount;
      totalFee += c.fee;
      totalCommission += c.commission;
      totalProfit += c.profit;
    });

    if (carriers.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-chart-line mr-2"></i>Sales-Carrier Report (Complete Platform Profit)
          </h3>
          <p class="text-gray-700">Combined B2B + D2C profit breakdown by carrier</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No sales-carrier data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }

    const sortedCarriers = [...carriers].sort((a, b) => b.profit - a.profit);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-chart-line mr-2"></i>Sales-Carrier Report (Complete Platform Profit)
          </h3>
          <p class="text-gray-700">Combined B2B + D2C profit breakdown by carrier</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
            <p class="text-sm text-gray-600">Net Profit</p>
            <h3 class="text-2xl font-bold text-green-600">$${totalProfit.toFixed(2)}</h3>
          </div>
          <div class="card bg-gradient-to-r from-blue-50 to-cyan-50">
            <p class="text-sm text-gray-600">Total Volume</p>
            <h3 class="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</h3>
          </div>
          <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
            <p class="text-sm text-gray-600">Total Amount</p>
            <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
          </div>
          <div class="card bg-gradient-to-r from-yellow-50 to-orange-50">
            <p class="text-sm text-gray-600">Total Fees</p>
            <h3 class="text-2xl font-bold text-gray-900">$${totalFee.toFixed(2)}</h3>
          </div>
          <div class="card bg-gradient-to-r from-pink-50 to-rose-50">
            <p class="text-sm text-gray-600">Total Commission</p>
            <h3 class="text-2xl font-bold text-gray-900">$${totalCommission.toFixed(2)}</h3>
          </div>
        </div>

        <!-- Carriers Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Carrier Performance Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedCarriers.map((carrier, index) => `
                  <tr class="${index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${carrier.carrier}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">${carrier.volume.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${carrier.amount.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${carrier.fee.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${carrier.commission.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${carrier.profit > 0 ? 'text-green-600' : 'text-gray-900'}">$${carrier.profit.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="bg-gray-100 font-bold">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">${totalVolume.toLocaleString()}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${totalFee.toFixed(2)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">$${totalCommission.toFixed(2)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">$${totalProfit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top 10 Carriers Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top 10 Carriers by Profit</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="sales-carrier-chart"></canvas>
          </div>
        </div>

        <!-- Info Box -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">About This Report</h4>
              <p class="text-sm text-gray-700">
                This report combines <strong>both B2B and D2C sales</strong> to show your complete platform profit by carrier.
                Total Profit = Fee + Commission from all sales channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const topCarriers = sortedCarriers.slice(0, 10);
    renderChart('sales-carrier-chart', 'bar', {
      labels: topCarriers.map(c => c.carrier),
      datasets: [{
        label: 'Total Profit',
        data: topCarriers.map(c => c.profit),
        backgroundColor: '#10B981'
      }]
    });

  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}
// MID Volume Report - API: reportType=mid-volume, response: provider, totalSales, totalAmount, startDate, endDate
async function loadMIDVolumeReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const midTransactions = await window.fetchBusinessReport('mid-volume', startDate, endDate);
    
    const rows = Array.isArray(midTransactions) ? midTransactions : [];
    let totalSales = 0;
    let totalAmount = 0;
    rows.forEach(row => {
      totalSales += Number(row.totalSales ?? row.total_sales) || 0;
      totalAmount += Number(row.totalAmount ?? row.total_amount) || 0;
    });
    
    const sortedRows = [...rows].sort((a, b) => (Number(b.totalAmount ?? b.total_amount) || 0) - (Number(a.totalAmount ?? a.total_amount) || 0));
    
    if (rows.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-credit-card mr-2"></i>MID Volume Report
          </h3>
          <p class="text-gray-700">Merchant service processing volume (separated for accounting purposes)</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No MID volume data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-credit-card mr-2"></i>MID Volume Report
          </h3>
          <p class="text-gray-700">Merchant service processing volume (separated for accounting purposes)</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Providers</p>
                <h3 class="text-2xl font-bold text-gray-900">${rows.length}</h3>
              </div>
              <i class="fas fa-store text-3xl text-purple-600"></i>
            </div>
            <p class="text-sm text-gray-600">Active providers</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Sales</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</h3>
              </div>
              <i class="fas fa-shopping-cart text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">All transactions</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-indigo-600"></i>
            </div>
            <p class="text-sm text-gray-600">Processing volume</p>
          </div>
        </div>
        
        <!-- MID Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">MID Transaction Volume</h3>
          <p class="text-sm text-gray-600 mb-4">Merchant service processing separated for accounting (${startDate} to ${endDate})</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedRows.map((row, index) => {
                  const sales = Number(row.totalSales ?? row.total_sales) || 0;
                  const amt = Number(row.totalAmount ?? row.total_amount) || 0;
                  const rowStart = row.startDate ?? row.start_date ?? startDate;
                  const rowEnd = row.endDate ?? row.end_date ?? endDate;
                  return `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-purple-50' : ''}">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${row.provider ?? ''}</div>
                      ${index === 0 ? '<div class="text-xs text-gray-500">Highest volume</div>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${sales.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">$${amt.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${rowStart}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${rowEnd}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalSales.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900" colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top MIDs Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top 5 by Volume</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="mid-volume-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-purple-50 border-l-4 border-purple-500">
          <div class="space-y-2">
            <p class="text-sm text-purple-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>MID Volume Report:</strong> Shows merchant service processing volume.
            </p>
            <p class="text-sm text-purple-900">
              <i class="fas fa-credit-card mr-2"></i>
              Each provider represents a payment method or processing channel for the selected period.
            </p>
          </div>
        </div>
      </div>
    `;
    
    const topMIDs = sortedRows.slice(0, 5);
    renderChart('mid-volume-chart', 'bar', {
      labels: topMIDs.map(m => m.provider || ''),
      datasets: [{
        label: 'Total Amount ($)',
        data: topMIDs.map(m => Number(m.totalAmount ?? m.total_amount) || 0),
        backgroundColor: '#9333EA'
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading MID Volume Report' });
  }
}
// D2C Sales - Carrier Report - API: reportType=d2c-carrier, response: companyName, amount, fee, volume, commission, totalProfit
async function loadD2CCarrierReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('d2c-carrier', startDate, endDate);
    
    // Map API (companyName, amount, fee, volume, commission, totalProfit) to UI shape (carrier, total_profit)
    const d2cCarriers = (Array.isArray(rows) ? rows : []).map(row => ({
      carrier: row.companyName ?? row.carrier ?? '',
      volume: Number(row.volume) || 0,
      amount: Number(row.amount) || 0,
      fee: Number(row.fee) || 0,
      commission: Number(row.commission) || 0,
      total_profit: Number(row.totalProfit ?? row.profit) || 0
    }));
    
    let totalVolume = 0;
    let totalAmount = 0;
    let totalFee = 0;
    let totalCommission = 0;
    let totalProfit = 0;
    d2cCarriers.forEach(c => {
      totalVolume += c.volume;
      totalAmount += c.amount;
      totalFee += c.fee;
      totalCommission += c.commission;
      totalProfit += c.total_profit;
    });
    
    const netProfit = totalProfit;
    
    if (d2cCarriers.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-mobile-alt mr-2"></i>D2C Sales - Carrier
          </h3>
          <p class="text-gray-700">Direct to Consumer: Products sold and your fees & commission</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No D2C carrier data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    const sortedCarriers = [...d2cCarriers].sort((a, b) => b.total_profit - a.total_profit);
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header with Net Profit -->
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-mobile-alt mr-2"></i>D2C Sales - Carrier
          </h3>
          <p class="text-gray-700 mb-3">Direct to Consumer: Products sold and your fees & commission</p>
          <div class="bg-white rounded-lg p-4 inline-block">
            <p class="text-sm text-gray-600 mb-1">Net Profit</p>
            <h3 class="text-3xl font-bold text-green-600">$${netProfit.toFixed(1)}</h3>
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Volume</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</h3>
              </div>
              <i class="fas fa-shopping-cart text-3xl text-blue-600"></i>
            </div>
            <p class="text-sm text-gray-600">Sales transactions</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">Revenue</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Fees</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalFee.toFixed(2)}</h3>
              </div>
              <i class="fas fa-tag text-3xl text-orange-600"></i>
            </div>
            <p class="text-sm text-gray-600">Processing fees</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Commission</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalCommission.toFixed(2)}</h3>
              </div>
              <i class="fas fa-hand-holding-usd text-3xl text-indigo-600"></i>
            </div>
            <p class="text-sm text-gray-600">Your earnings</p>
          </div>
        </div>
        
        <!-- D2C Carrier Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">D2C Sales by Carrier</h3>
          <p class="text-sm text-gray-600 mb-4">Direct consumer sales - products bought and your profit per carrier</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedCarriers.map((carrier, index) => `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${carrier.carrier}</div>
                      ${index === 0 ? '<div class="text-xs text-gray-500">Highest profit</div>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${carrier.volume.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${carrier.amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${carrier.fee.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${carrier.commission.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm font-medium text-green-600">$${carrier.total_profit.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalVolume.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalFee.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalCommission.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-green-600">$${totalProfit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top Carriers Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top 10 Carriers by Profit</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="d2c-carrier-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-green-50 border-l-4 border-green-500">
          <div class="space-y-2">
            <p class="text-sm text-green-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>D2C Sales Report:</strong> Shows YOUR direct-to-consumer sales.
            </p>
            <p class="text-sm text-green-900">
              <i class="fas fa-mobile-alt mr-2"></i>
              Carrier = Mobile carrier products customers bought (T-Mobile, AT&T, Verizon, etc.)
            </p>
            <p class="text-sm text-green-900">
              <i class="fas fa-dollar-sign mr-2"></i>
              Fee = Processing fees | Commission = Your earnings | Total Profit = Fee + Commission
            </p>
            <p class="text-sm text-green-900">
              <i class="fas fa-chart-line mr-2"></i>
              Net Profit: $${netProfit.toFixed(2)} - Total earnings from D2C sales
            </p>
          </div>
        </div>
      </div>
    `;
    
    const topCarriers = sortedCarriers.slice(0, 10);
    renderChart('d2c-carrier-chart', 'bar', {
      labels: topCarriers.map(c => c.carrier),
      datasets: [{
        label: 'Total Profit ($)',
        data: topCarriers.map(c => c.total_profit),
        backgroundColor: '#10B981'
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading D2C Carrier Report' });
  }
}
// D2C Sales - Payment Method Report - API: reportType=d2c-payment, response: paymentType, volume, amount
async function loadD2CPaymentReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('d2c-payment', startDate, endDate);
    
    // Map API (paymentType, volume, amount) to UI shape (payment_type, volume, amount)
    const paymentMethods = (Array.isArray(rows) ? rows : []).map(row => ({
      payment_type: row.paymentType ?? row.payment_type ?? '',
      volume: Number(row.volume) || 0,
      amount: Number(row.amount) || 0
    }));
    
    let totalVolume = 0;
    let totalAmount = 0;
    paymentMethods.forEach(p => {
      totalVolume += p.volume;
      totalAmount += p.amount;
    });
    
    const sortedMethods = [...paymentMethods].sort((a, b) => b.volume - a.volume);
    const totalForPct = totalVolume || 1;
    const topMethod = sortedMethods[0];
    
    if (paymentMethods.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-pink-50 to-purple-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-credit-card mr-2"></i>D2C Sales - Payment Method
          </h3>
          <p class="text-gray-700">What payment methods customers use to pay you</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No payment method data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    const topMethodLine = topMethod
      ? `Most Popular: ${topMethod.payment_type} (${topMethod.volume.toLocaleString()} transactions, ${((topMethod.volume / totalForPct) * 100).toFixed(1)}%)`
      : 'Most Popular: —';
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-pink-50 to-purple-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-credit-card mr-2"></i>D2C Sales - Payment Method
          </h3>
          <p class="text-gray-700">What payment methods customers use to pay you</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Payment Types</p>
                <h3 class="text-2xl font-bold text-gray-900">${paymentMethods.length}</h3>
              </div>
              <i class="fas fa-credit-card text-3xl text-purple-600"></i>
            </div>
            <p class="text-sm text-gray-600">Methods available</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Volume</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</h3>
              </div>
              <i class="fas fa-shopping-cart text-3xl text-blue-600"></i>
            </div>
            <p class="text-sm text-gray-600">Transactions</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">Revenue</p>
          </div>
        </div>
        
        <!-- Payment Method Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
          <p class="text-sm text-gray-600 mb-4">Customer payment preferences - which methods they use most</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedMethods.map((method, index) => {
                  const percentage = ((method.volume / totalForPct) * 100).toFixed(1);
                  return `
                    <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-pink-50' : ''}">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class="fas fa-credit-card text-purple-600 mr-2"></i>
                          <div>
                            <div class="text-sm font-medium text-gray-900">${method.payment_type}</div>
                            ${index === 0 ? '<div class="text-xs text-gray-500">Most popular</div>' : ''}
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">${method.volume.toLocaleString()}</td>
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">$${method.amount.toFixed(2)}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <span class="text-sm font-medium text-gray-900 mr-2">${percentage}%</span>
                          <div class="w-16 bg-gray-200 rounded-full h-2">
                            <div class="bg-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalVolume.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top Methods Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Payment Method Distribution</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="payment-method-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-purple-50 border-l-4 border-purple-500">
          <div class="space-y-2">
            <p class="text-sm text-purple-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>D2C Payment Method Report:</strong> Shows customer payment preferences.
            </p>
            <p class="text-sm text-purple-900">
              <i class="fas fa-credit-card mr-2"></i>
              Payment Types: Card, Apple Pay, Google Pay, PayPal, Klarna, Venmo, CashApp, Zelle, POCKYT, Plaid
            </p>
            <p class="text-sm text-purple-900">
              <i class="fas fa-chart-pie mr-2"></i>
              ${topMethodLine}
            </p>
            <p class="text-sm text-purple-900">
              <i class="fas fa-dollar-sign mr-2"></i>
              Understanding payment preferences helps optimize checkout and reduce abandonment.
            </p>
          </div>
        </div>
      </div>
    `;
    
    const chartColors = ['#EC4899', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#6366F1', '#F97316', '#14B8A6', '#EF4444', '#A855F7', '#84CC16'];
    renderChart('payment-method-chart', 'pie', {
      labels: sortedMethods.map(p => p.payment_type),
      datasets: [{
        data: sortedMethods.map(p => p.volume),
        backgroundColor: sortedMethods.map((_, i) => chartColors[i % chartColors.length])
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Payment Method Report' });
  }
}
// MasterCard Report - API: reportType=mastercard, response: type, amountSpent, startDate, endDate
async function loadMasterCardReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('mastercard', startDate, endDate);
    
    // Map API (type, amountSpent, startDate, endDate) to UI shape (card_type, total_amount, start_date, end_date)
    const virtualCards = (Array.isArray(rows) ? rows : []).map(row => ({
      card_type: row.type ?? row.card_type ?? '',
      total_amount: Number(row.amountSpent ?? row.total_amount) || 0,
      start_date: row.startDate ?? row.start_date ?? startDate,
      end_date: row.endDate ?? row.end_date ?? endDate
    }));
    const totalAmount = virtualCards.reduce((sum, card) => sum + card.total_amount, 0);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-red-50 to-orange-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-credit-card mr-2 text-red-600"></i>Virtual Card Report
          </h3>
          <p class="text-gray-700">Virtual cards used to make customer payments</p>
        </div>

        <!-- Summary Card -->
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <p class="text-sm text-gray-600">Total Amount Spent</p>
          <h3 class="text-3xl font-bold text-green-600">$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          <p class="text-xs text-gray-600 mt-1">${virtualCards.length} virtual card${virtualCards.length > 1 ? 's' : ''} active</p>
        </div>

        <!-- Card Details Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Card Details</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Details</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount Spent</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${virtualCards.map((card, index) => `
                  <tr class="${index === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <i class="fab fa-cc-mastercard text-red-600 text-xl mr-3"></i>
                        <div>
                          <div class="text-sm font-medium text-gray-900">${card.card_type}</div>
                          <div class="text-xs text-gray-500">${card.start_date} to ${card.end_date}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-sm font-semibold text-gray-900">$${card.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </td>
                  </tr>
                `).join('')}
                <tr class="bg-gray-100 font-bold">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Virtual Card Types Info -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Virtual Card Types</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 border-l-4 border-red-500 bg-red-50">
              <div class="flex items-center">
                <i class="fab fa-cc-mastercard text-red-600 text-2xl mr-3"></i>
                <div>
                  <p class="font-medium text-red-900">Master Card</p>
                  <p class="text-sm text-red-700 mt-1">Primary payment card</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
              <div class="flex items-center">
                <i class="fab fa-cc-visa text-blue-600 text-2xl mr-3"></i>
                <div>
                  <p class="font-medium text-blue-900">Visa Cards</p>
                  <p class="text-sm text-blue-700 mt-1">Alternative payment method</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-green-500 bg-green-50">
              <div class="flex items-center">
                <i class="fas fa-credit-card text-green-600 text-2xl mr-3"></i>
                <div>
                  <p class="font-medium text-green-900">Virtual Cards</p>
                  <p class="text-sm text-green-700 mt-1">Secure one-time use cards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">About Virtual Cards</h4>
              <p class="text-sm text-gray-700">
                Virtual cards are used to make secure payments to customers and vendors. 
                Each card tracks spending for specific purposes to help with accounting and reconciliation.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}
// ARB Report - API: reportType=arb, response: companyName, amount, fee, volume, commission, totalProfit
async function loadARBReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('arb', startDate, endDate);
    
    // Map API (companyName, amount, fee, volume, commission, totalProfit) to UI shape (carrier, total_profit)
    const arbCustomers = (Array.isArray(rows) ? rows : []).map(row => ({
      carrier: row.companyName ?? row.carrier ?? '',
      volume: Number(row.volume) || 0,
      amount: Number(row.amount) || 0,
      fee: Number(row.fee) || 0,
      commission: Number(row.commission) || 0,
      total_profit: Number(row.totalProfit ?? row.profit) || 0
    }));
    
    let totalVolume = 0;
    let totalAmount = 0;
    let totalFee = 0;
    let totalCommission = 0;
    let totalProfit = 0;
    arbCustomers.forEach(c => {
      totalVolume += c.volume;
      totalAmount += c.amount;
      totalFee += c.fee;
      totalCommission += c.commission;
      totalProfit += c.total_profit;
    });
    
    const netProfit = totalProfit;
    
    if (arbCustomers.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-redo-alt mr-2"></i>ARB (Automatic Recurring Billing)
          </h3>
          <p class="text-gray-700">Monthly recurring customers and products they bought from you</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No ARB data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    const sortedCustomers = [...arbCustomers].sort((a, b) => b.total_profit - a.total_profit);
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header with Net Profit -->
        <div class="card bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-redo-alt mr-2"></i>ARB (Automatic Recurring Billing)
          </h3>
          <p class="text-gray-700 mb-3">Monthly recurring customers and products they bought from you</p>
          <div class="bg-white rounded-lg p-4 inline-block">
            <p class="text-sm text-gray-600 mb-1">Net Profit</p>
            <h3 class="text-3xl font-bold text-indigo-600">$${netProfit.toFixed(1)}</h3>
          </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Volume</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</h3>
              </div>
              <i class="fas fa-sync-alt text-3xl text-blue-600"></i>
            </div>
            <p class="text-sm text-gray-600">Recurring transactions</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">Monthly revenue</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Fees</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalFee.toFixed(2)}</h3>
              </div>
              <i class="fas fa-tag text-3xl text-orange-600"></i>
            </div>
            <p class="text-sm text-gray-600">Processing fees</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Commission</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalCommission.toFixed(2)}</h3>
              </div>
              <i class="fas fa-hand-holding-usd text-3xl text-indigo-600"></i>
            </div>
            <p class="text-sm text-gray-600">Your earnings</p>
          </div>
        </div>
        
        <!-- ARB Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ARB Recurring Customers by Carrier</h3>
          <p class="text-sm text-gray-600 mb-4">Monthly recurring billing - products customers buy automatically</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedCustomers.map((customer, index) => `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-indigo-50' : ''}">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${customer.carrier}</div>
                      ${index === 0 ? '<div class="text-xs text-gray-500">Highest ARB profit</div>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${customer.volume.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${customer.amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${customer.fee.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${customer.commission.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm font-medium text-indigo-600">$${customer.total_profit.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalVolume.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalFee.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalCommission.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-indigo-600">$${totalProfit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top ARB Carriers Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top 10 ARB Carriers by Profit</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="arb-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-indigo-50 border-l-4 border-indigo-500">
          <div class="space-y-2">
            <p class="text-sm text-indigo-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>ARB Report:</strong> Automatic Recurring Billing - monthly recurring customers.
            </p>
            <p class="text-sm text-indigo-900">
              <i class="fas fa-sync-alt mr-2"></i>
              ARB = Customers who automatically buy products monthly (subscriptions).
            </p>
            <p class="text-sm text-indigo-900">
              <i class="fas fa-mobile-alt mr-2"></i>
              Carrier = Mobile carrier products they buy each month (T-Mobile, AT&T, etc.)
            </p>
            <p class="text-sm text-indigo-900">
              <i class="fas fa-dollar-sign mr-2"></i>
              Total Profit = Fee + Commission = YOUR monthly recurring revenue
            </p>
            <p class="text-sm text-indigo-900">
              <i class="fas fa-chart-line mr-2"></i>
              Net Profit: $${netProfit.toFixed(2)} - Predictable monthly income from ARB
            </p>
          </div>
        </div>
      </div>
    `;
    
    const topCarriers = sortedCustomers.slice(0, 10);
    renderChart('arb-chart', 'bar', {
      labels: topCarriers.map(c => c.carrier),
      datasets: [{
        label: 'Total Profit ($)',
        data: topCarriers.map(c => c.total_profit),
        backgroundColor: '#6366F1'
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading ARB Report' });
  }
}
// ARB Count Report - API: reportType=arb-count, response: { arbCount: number }
async function loadARBCountReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const response = await window.api.get('/business-report/reports', {
      params: { reportType: 'arb-count', startDate, endDate }
    });
    const data = response.data || {};
    const totalCount = Number(data.arbCount ?? data.total_count) || 0;

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-teal-50 to-cyan-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-sync-alt mr-2 text-teal-600"></i>ARB Count Report
          </h3>
          <p class="text-gray-700">Number of customers using recurring payments (subscriptions)</p>
        </div>

        <!-- Summary Card -->
        <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
          <p class="text-sm text-gray-600">Total ARB Subscribers</p>
          <h3 class="text-4xl font-bold text-purple-600">${totalCount.toLocaleString()}</h3>
          <p class="text-xs text-gray-600 mt-1">Active recurring payment profiles</p>
        </div>

        <!-- ARB Count Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ARB Profile Details</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Count</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-purple-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <i class="fas fa-users text-purple-600 text-lg mr-3"></i>
                      <div class="text-sm font-medium text-gray-900">ARB Customer Profiles</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-2xl font-bold text-purple-600">${totalCount.toLocaleString()}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${startDate}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${endDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Active Profiles</p>
                <h4 class="text-2xl font-bold text-green-600">${totalCount}</h4>
                <p class="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <i class="fas fa-check-circle text-4xl text-green-600"></i>
            </div>
          </div>
          
          <div class="card bg-gradient-to-r from-blue-50 to-cyan-50">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Growth Rate</p>
                <h4 class="text-2xl font-bold text-blue-600">+12%</h4>
                <p class="text-xs text-gray-500 mt-1">vs last month</p>
              </div>
              <i class="fas fa-chart-line text-4xl text-blue-600"></i>
            </div>
          </div>
          
          <div class="card bg-gradient-to-r from-orange-50 to-red-50">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Retention Rate</p>
                <h4 class="text-2xl font-bold text-orange-600">94%</h4>
                <p class="text-xs text-gray-500 mt-1">Customer retention</p>
              </div>
              <i class="fas fa-heart text-4xl text-orange-600"></i>
            </div>
          </div>
        </div>

        <!-- ARB Benefits Info -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ARB Program Benefits</h3>
          <div class="space-y-3">
            <div class="p-4 border-l-4 border-purple-500 bg-purple-50">
              <div class="flex items-start">
                <i class="fas fa-calendar-check text-purple-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-purple-900">Predictable Revenue</p>
                  <p class="text-sm text-purple-700 mt-1">Recurring payments provide stable monthly income</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
              <div class="flex items-start">
                <i class="fas fa-user-shield text-blue-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-blue-900">Customer Retention</p>
                  <p class="text-sm text-blue-700 mt-1">Subscribers stay longer than one-time purchasers</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-green-500 bg-green-50">
              <div class="flex items-start">
                <i class="fas fa-robot text-green-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-green-900">Automated Billing</p>
                  <p class="text-sm text-green-700 mt-1">Reduces manual payment processing and errors</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">About ARB Count</h4>
              <p class="text-sm text-gray-700">
                ARB (Automatic Recurring Billing) Count tracks the number of customers enrolled in subscription-based 
                recurring payments. This metric helps measure the health and growth of your subscription business.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}
// Payouts Report - API: reportType=payouts, response: accountType, totalTransactions, totalTransactionFee, totalVendorFee, totalAmount, totalProfit
async function loadPayoutsReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('payouts', startDate, endDate);
    
    // Map API (accountType, totalTransactions, totalTransactionFee, totalVendorFee, totalAmount, totalProfit) to UI shape
    const payoutAccounts = (Array.isArray(rows) ? rows : []).map(row => ({
      account_type: row.accountType ?? row.account_type ?? '',
      transactions: Number(row.totalTransactions ?? row.transactions) || 0,
      transaction_fee: Number(row.totalTransactionFee ?? row.transaction_fee) || 0,
      vendor_fee: Number(row.totalVendorFee ?? row.vendor_fee) || 0,
      total_amount: Number(row.totalAmount ?? row.total_amount) || 0,
      total_profit: Number(row.totalProfit ?? row.total_profit) || 0
    }));
    
    let totalTransactions = 0;
    let totalVendorFee = 0;
    let totalTransactionFee = 0;
    let totalAmount = 0;
    let totalProfit = 0;
    payoutAccounts.forEach(p => {
      totalTransactions += p.transactions;
      totalVendorFee += p.vendor_fee;
      totalTransactionFee += p.transaction_fee;
      totalAmount += p.total_amount;
      totalProfit += p.total_profit;
    });
    
    if (payoutAccounts.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-emerald-50 to-green-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-exchange-alt mr-2"></i>Payout Report
          </h3>
          <p class="text-gray-700">P2P (Peer-to-Peer) payments - monthly volume by payment method and profit</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No payout data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    const sortedAccounts = [...payoutAccounts].sort((a, b) => b.total_profit - a.total_profit);
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-emerald-50 to-green-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-exchange-alt mr-2"></i>Payout Report
          </h3>
          <p class="text-gray-700">P2P (Peer-to-Peer) payments - monthly volume by payment method and profit</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Transactions</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalTransactions.toLocaleString()}</h3>
              </div>
              <i class="fas fa-exchange-alt text-3xl text-blue-600"></i>
            </div>
            <p class="text-sm text-gray-600">P2P payments</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">Payout volume</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Payment Methods</p>
                <h3 class="text-2xl font-bold text-gray-900">${payoutAccounts.length}</h3>
              </div>
              <i class="fas fa-credit-card text-3xl text-purple-600"></i>
            </div>
            <p class="text-sm text-gray-600">Account types</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Profit</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalProfit.toFixed(2)}</h3>
              </div>
              <i class="fas fa-hand-holding-usd text-3xl text-emerald-600"></i>
            </div>
            <p class="text-sm text-gray-600">Your earnings</p>
          </div>
        </div>
        
        <!-- Payout Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Payout by Payment Method</h3>
          <p class="text-sm text-gray-600 mb-4">P2P payments by account type and your profit</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Fee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Fee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedAccounts.map((account, index) => `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-emerald-50' : ''}">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${account.account_type}</div>
                      ${index === 0 ? '<div class="text-xs text-gray-500">Highest profit</div>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${account.transactions.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${account.vendor_fee.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${account.transaction_fee.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">$${account.total_amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm font-medium text-emerald-600">$${account.total_profit.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalTransactions.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalVendorFee.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalTransactionFee.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-emerald-600">$${totalProfit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Payment Methods Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Profit by Payment Method</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="payout-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-emerald-50 border-l-4 border-emerald-500">
          <div class="space-y-2">
            <p class="text-sm text-emerald-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>Payout Report:</strong> P2P (Peer-to-Peer) payment transactions.
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-exchange-alt mr-2"></i>
              Shows monthly P2P payment volume by payment method (Card, Crypto, PayPal, Venmo, etc.)
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-credit-card mr-2"></i>
              Account Types: CARD, CRYPTO, PAYPAL, VENMO, ZELLE, CASHAPP
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-dollar-sign mr-2"></i>
              Total Profit = Your earnings from P2P payment processing fees
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-chart-line mr-2"></i>
              Monthly P2P Volume: $${totalAmount.toFixed(2)} | Your Profit: $${totalProfit.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    `;
    
    renderChart('payout-chart', 'bar', {
      labels: sortedAccounts.map(p => p.account_type),
      datasets: [{
        label: 'Total Profit ($)',
        data: sortedAccounts.map(p => p.total_profit),
        backgroundColor: '#10B981'
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Payout Report' });
  }
}
// Manual Spender Report - API: reportType=manual-spender, response: provider, serviceType, totalSales, totalAmount, createdDate (when card was created)
async function loadManualSpenderReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('manual-spender', startDate, endDate);
    
    const manualTransactions = (Array.isArray(rows) ? rows : []).map(row => ({
      provider: row.provider ?? row.bot_name ?? '',
      serviceType: row.serviceType ?? row.card_number ?? row.service_type ?? '',
      totalSales: Number(row.totalSales ?? row.transactions) || 0,
      totalAmount: Number(row.totalAmount ?? row.total_amount) || 0,
      createdDate: row.createdDate ?? row.created_date ?? ''
    }));
    
    let totalTransactions = 0;
    let totalAmount = 0;
    manualTransactions.forEach(t => {
      totalTransactions += t.totalSales;
      totalAmount += t.totalAmount;
    });
    
    if (manualTransactions.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-amber-50 to-yellow-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-hand-pointer mr-2 text-amber-600"></i>Manual Spender Report
          </h3>
          <p class="text-gray-700">B2B customer cards used on their behalf (manual transactions)</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No manual spender data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-amber-50 to-yellow-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-hand-pointer mr-2 text-amber-600"></i>Manual Spender Report
          </h3>
          <p class="text-gray-700">B2B customer cards used on their behalf (manual transactions)</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="card bg-gradient-to-r from-purple-50 to-indigo-50">
            <p class="text-sm text-gray-600">Total Transactions</p>
            <h3 class="text-3xl font-bold text-purple-600">${totalTransactions}</h3>
          </div>
          <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
            <p class="text-sm text-gray-600">Total Amount</p>
            <h3 class="text-3xl font-bold text-green-600">$${totalAmount.toFixed(2)}</h3>
          </div>
          <div class="card bg-gradient-to-r from-blue-50 to-cyan-50">
            <p class="text-sm text-gray-600">Manual Entries</p>
            <h3 class="text-3xl font-bold text-blue-600">${manualTransactions.length}</h3>
          </div>
        </div>

        <!-- Manual Spender Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Manual Transaction Details</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Number</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${manualTransactions.map((txn, index) => `
                  <tr class="${index === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'}">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <i class="fas fa-robot text-amber-600 text-lg mr-3"></i>
                        <div class="text-sm font-medium text-gray-900">${txn.provider}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <i class="fas fa-credit-card text-blue-600 text-lg mr-3"></i>
                        <div class="text-sm font-mono text-gray-900">${txn.serviceType}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${txn.createdDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">${txn.totalSales}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">$${txn.totalAmount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="bg-gray-100 font-bold">
                  <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">${totalTransactions}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">$${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Manual Entry Reason Codes -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Common Manual Entry Scenarios</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <div class="flex items-start">
                <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-yellow-900">Card Declined - Manual Retry</p>
                  <p class="text-sm text-yellow-700 mt-1">Customer card failed, processed manually on their behalf</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
              <div class="flex items-start">
                <i class="fas fa-phone text-blue-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-blue-900">Phone Order Entry</p>
                  <p class="text-sm text-blue-700 mt-1">Customer placed order over phone, card processed manually</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-orange-500 bg-orange-50">
              <div class="flex items-start">
                <i class="fas fa-clock text-orange-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-orange-900">System Timeout Recovery</p>
                  <p class="text-sm text-orange-700 mt-1">Transaction timed out, recovered and processed manually</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-green-500 bg-green-50">
              <div class="flex items-start">
                <i class="fas fa-user-shield text-green-600 text-xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-green-900">Customer Service Override</p>
                  <p class="text-sm text-green-700 mt-1">Manual override by support team for customer assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">About Manual Spender</h4>
              <p class="text-sm text-gray-700">
                Manual Spender tracks transactions where you used B2B customer cards on their behalf. 
                This typically happens when automated processing fails or when providing customer service assistance.
                Monitor these entries to identify automation opportunities and reduce manual processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}

// Smart Safe Report - Cash deposits made inside stores (no bank trips)
async function loadSmartSafeReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('smart-safe', startDate, endDate);
    const smartSafeDeposits = (Array.isArray(rows) ? rows : []).map(row => ({
      transaction_date: row.entry_date ?? row.txnDate ?? row.transaction_date ?? '',
      transactions_amount: Number(row.amount ?? row.txnAmount ?? row.transactions_amount ?? 0),
      region_display: row.region_display != null ? String(row.region_display) : '',
      start_date: startDate,
      end_date: endDate
    }));

    // Calculate total
    const totalAmount = smartSafeDeposits.reduce((sum, d) => sum + d.transactions_amount, 0);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-vault mr-2 text-green-600"></i>Smart Safe Report
          </h3>
          <p class="text-gray-700">Cash deposits made inside stores (no bank trips needed)</p>
        </div>

        <!-- Summary Card -->
        <div class="card bg-gradient-to-r from-blue-50 to-cyan-50">
          <p class="text-sm text-gray-600">Total Deposits</p>
          <h3 class="text-4xl font-bold text-blue-600">$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</h3>
          <p class="text-xs text-gray-600 mt-1">${smartSafeDeposits.length} deposit${smartSafeDeposits.length > 1 ? 's' : ''} recorded</p>
        </div>

        <!-- Smart Safe Deposits Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Deposit History</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions Amount</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${smartSafeDeposits.map((deposit, index) => `
                  <tr class="${index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <i class="fas fa-calendar-check text-green-600 text-lg mr-3"></i>
                        <div class="text-sm font-medium text-gray-900">${deposit.transaction_date}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${(deposit.region_display || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <div class="text-lg font-bold text-green-600">$${deposit.transactions_amount.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</div>
                    </td>
                  </tr>
                `).join('')}
                <tr class="bg-gray-100 font-bold">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colspan="2">TOTAL</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-lg text-green-600">$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Smart Safe Benefits -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Smart Safe Benefits</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border-l-4 border-green-500 bg-green-50">
              <div class="flex items-start">
                <i class="fas fa-clock text-green-600 text-2xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-green-900">Save Time</p>
                  <p class="text-sm text-green-700 mt-1">No need to visit bank - deposit cash right in your store</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-blue-500 bg-blue-50">
              <div class="flex items-start">
                <i class="fas fa-shield-alt text-blue-600 text-2xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-blue-900">Secure Storage</p>
                  <p class="text-sm text-blue-700 mt-1">Bank-grade security with armored pickup service</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-purple-500 bg-purple-50">
              <div class="flex items-start">
                <i class="fas fa-money-check-alt text-purple-600 text-2xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-purple-900">Instant Credit</p>
                  <p class="text-sm text-purple-700 mt-1">Funds credited to your account immediately upon deposit</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-l-4 border-orange-500 bg-orange-50">
              <div class="flex items-start">
                <i class="fas fa-chart-line text-orange-600 text-2xl mt-1 mr-3"></i>
                <div>
                  <p class="font-medium text-orange-900">Better Cash Flow</p>
                  <p class="text-sm text-orange-700 mt-1">Daily deposits improve your business cash flow management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- How It Works -->
        <div class="card bg-blue-50 border-l-4 border-blue-500">
          <div class="flex">
            <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">How Smart Safe Works</h4>
              <ol class="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                <li><strong>Deposit Cash:</strong> Store employees deposit cash directly into the smart safe device</li>
                <li><strong>Automatic Count:</strong> Smart safe counts and verifies the cash amount automatically</li>
                <li><strong>Instant Credit:</strong> Your account is credited immediately (no waiting for bank deposit)</li>
                <li><strong>Armored Pickup:</strong> Armored car service picks up cash on schedule</li>
                <li><strong>Reconciliation:</strong> All transactions tracked and reported for easy accounting</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Report' });
  }
}

// Payin Report (Others Volume - Retailers using your service for customer payments)
// API: reportType=others-volume, response: provider, totalSales, totalAmount, startDate, endDate
async function loadOthersVolumeReport(content, dateRange) {
  content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i></div>';
  
  try {
    const { startDate, endDate } = getReportDateRange(dateRange);
    const rows = await window.fetchBusinessReport('others-volume', startDate, endDate);
    
    const payinTransactions = Array.isArray(rows) ? rows : [];
    let totalSales = 0;
    let totalAmount = 0;
    payinTransactions.forEach(p => {
      totalSales += Number(p.totalSales ?? p.total_sales) || 0;
      totalAmount += Number(p.totalAmount ?? p.total_amount) || 0;
    });
    
    const sortedRows = [...payinTransactions].sort((a, b) =>
      (Number(b.totalAmount ?? b.total_amount) || 0) - (Number(a.totalAmount ?? a.total_amount) || 0)
    );
    
    if (payinTransactions.length === 0) {
      content.innerHTML = `
      <div class="space-y-6">
        <div class="card bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-arrow-down mr-2"></i>Payin Report (Others Volume)
          </h3>
          <p class="text-gray-700">Retailers use your service for customer payments (separated for accounting)</p>
        </div>
        <div class="card">
          <p class="text-gray-500 text-center py-8">No payin data for the selected date range (${startDate} to ${endDate}).</p>
        </div>
      </div>`;
      return;
    }
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="card bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 class="text-xl font-bold text-gray-900 mb-2">
            <i class="fas fa-arrow-down mr-2"></i>Payin Report (Others Volume)
          </h3>
          <p class="text-gray-700">Retailers use your service for customer payments (separated for accounting)</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Providers</p>
                <h3 class="text-2xl font-bold text-gray-900">${payinTransactions.length}</h3>
              </div>
              <i class="fas fa-building text-3xl text-emerald-600"></i>
            </div>
            <p class="text-sm text-gray-600">Payment channels</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Sales</p>
                <h3 class="text-2xl font-bold text-gray-900">${totalSales.toLocaleString()}</h3>
              </div>
              <i class="fas fa-receipt text-3xl text-teal-600"></i>
            </div>
            <p class="text-sm text-gray-600">Customer payments</p>
          </div>
          
          <div class="card kpi-gradient">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-sm text-gray-600">Total Amount</p>
                <h3 class="text-2xl font-bold text-gray-900">$${totalAmount.toFixed(2)}</h3>
              </div>
              <i class="fas fa-dollar-sign text-3xl text-green-600"></i>
            </div>
            <p class="text-sm text-gray-600">Payin volume</p>
          </div>
        </div>
        
        <!-- Payin Table -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Payin Transaction Volume</h3>
          <p class="text-sm text-gray-600 mb-4">Retailers using your service for customer payments (${startDate} to ${endDate})</p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${sortedRows.map((payin, index) => {
                  const sales = Number(payin.totalSales ?? payin.total_sales) || 0;
                  const amount = Number(payin.totalAmount ?? payin.total_amount) || 0;
                  const rowStart = payin.startDate ?? payin.start_date ?? startDate;
                  const rowEnd = payin.endDate ?? payin.end_date ?? endDate;
                  const serviceType = payin.service_type ?? payin.serviceType ?? 'ALL';
                  return `
                  <tr class="hover:bg-gray-50 ${index === 0 ? 'bg-emerald-50' : ''}">
                    <td class="px-6 py-4">
                      <div class="text-sm font-medium text-gray-900">${payin.provider ?? ''}</div>
                      ${index === 0 ? '<div class="text-xs text-gray-500">Highest volume</div>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">${serviceType}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${sales.toLocaleString()}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">$${amount.toFixed(2)}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${rowStart}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${rowEnd}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
              <tfoot class="bg-gray-100 font-bold">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-900" colspan="2">TOTAL</td>
                  <td class="px-6 py-4 text-sm text-gray-900">${totalSales.toLocaleString()}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">$${totalAmount.toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-gray-900" colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Top Providers Chart -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Top Payment Providers by Volume</h3>
          <div class="relative w-full" style="min-height: 250px; max-height: 400px;">
            <canvas id="payin-volume-chart"></canvas>
          </div>
        </div>
        
        <!-- Info Box -->
        <div class="card bg-emerald-50 border-l-4 border-emerald-500">
          <div class="space-y-2">
            <p class="text-sm text-emerald-900">
              <i class="fas fa-info-circle mr-2"></i>
              <strong>Payin Report:</strong> Shows retailers using your service for customer payments.
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-arrow-down mr-2"></i>
              Payin = Money coming IN from retail customers through your platform.
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-calculator mr-2"></i>
              Separated for accounting purposes to track retail payment volume independently.
            </p>
            <p class="text-sm text-emerald-900">
              <i class="fas fa-credit-card mr-2"></i>
              Payment methods include: Apple Pay, Google Pay, PayPal, Amazon Pay, POCKYT gateways.
            </p>
          </div>
        </div>
      </div>
    `;
    
    const topProviders = sortedRows.slice(0, 7);
    renderChart('payin-volume-chart', 'bar', {
      labels: topProviders.map(p => p.provider ?? ''),
      datasets: [{
        label: 'Total Amount ($)',
        data: topProviders.map(p => Number(p.totalAmount ?? p.total_amount) || 0),
        backgroundColor: '#10B981'
      }]
    });
    
  } catch (error) {
    content.innerHTML = getApiErrorDisplay(error, { title: 'Error Loading Payin Report' });
  }
}
window.exportReport = function() {
  if (!hasPermission('exportReports')) {
    addNotification('error', 'Permission Denied', 'You do not have permission to export reports');
    return;
  }
  
  const reportType = document.getElementById('report-type')?.value;
  const dateRange = document.getElementById('report-date-range')?.value || 'lastday';
  
  // Get current report data from the table
  const reportContent = document.getElementById('report-content');
  if (!reportContent) {
    addNotification('error', 'Export Failed', 'No report data to export');
    return;
  }
  
  // Find the table in the report
  const table = reportContent.querySelector('table');
  if (!table) {
    addNotification('warning', 'No Data', 'No table data found to export');
    return;
  }
  
  // Extract table data
  const headers = [];
  const rows = [];
  
  // Get headers
  table.querySelectorAll('thead th').forEach(th => {
    headers.push(th.textContent.trim());
  });
  
  // Get rows
  table.querySelectorAll('tbody tr').forEach(tr => {
    const row = [];
    tr.querySelectorAll('td').forEach(td => {
      // Clean the text content
      row.push(td.textContent.trim().replace(/,/g, ';')); // Replace commas with semicolons
    });
    if (row.length) rows.push(row);
  });
  
  // Build CSV content
  let csv = headers.join(',') + '\\n';
  rows.forEach(row => {
    csv += row.join(',') + '\\n';
  });
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const fileName = `${reportType || 'report'}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  addNotification('success', 'Report Exported', `${fileName} downloaded successfully`);
};

window.filterReportTable = function() {
  const searchInput = document.getElementById('report-search');
  if (!searchInput) return;
  
  const filter = searchInput.value.toLowerCase();
  const reportContent = document.getElementById('report-content');
  if (!reportContent) return;
  
  const table = reportContent.querySelector('table');
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(filter)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Show message if no results
  let noResultsRow = tbody.querySelector('.no-results-row');
  if (visibleCount === 0 && filter) {
    if (!noResultsRow) {
      const colspan = table.querySelectorAll('thead th').length;
      noResultsRow = document.createElement('tr');
      noResultsRow.className = 'no-results-row';
      noResultsRow.innerHTML = `<td colspan="${colspan}" class="text-center py-8 text-gray-500">No results found for "${filter}"</td>`;
      tbody.appendChild(noResultsRow);
    }
  } else if (noResultsRow) {
    noResultsRow.remove();
  }
};

window.printReport = function() {
  window.print();
};

// Provider Detail Page
async function loadProviderDetail(provider) {
  
  const content = document.getElementById("main-content");
  
  content.innerHTML = `<div class="space-y-6">
    <div class="flex items-center space-x-4">
      <button onclick="window.navigateTo('customers')" class="text-gray-600 hover:text-gray-900">
        <i class="fas fa-arrow-left"></i> Back to Customers
      </button>
    </div>
    <div>
      <h1 class="text-3xl font-bold text-gray-900">${provider}</h1>
      <p class="text-gray-500 mt-1">Provider Details & Transactions</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" id="provider-kpis">
      <div class="card"><div class="text-sm text-gray-500">Loading...</div></div>
    </div>
    <div class="card">
      <h3 class="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div id="provider-transactions">Loading...</div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">By Carrier</h3>
        <div class="relative w-full" style="min-height: 250px; max-height: 400px;"><canvas id="provider-carrier-chart"></canvas></div>
      </div>
      <div class="card">
        <h3 class="text-lg font-semibold mb-4">By Payment Method</h3>
        <div class="relative w-full" style="min-height: 250px; max-height: 400px;"><canvas id="provider-payment-chart"></canvas></div>
      </div>
    </div>
  </div>`;
  
  // Load provider data
  try {
    // For now, use mock data - you'll replace this with real API calls
    const providerData = {
      totalVolume: 2863367,
      totalSales: 56720,
      avgTicket: 50.48,
      successRate: 87.5
    };
    
    document.getElementById('provider-kpis').innerHTML = `
      <div class="card"><div class="text-sm text-gray-500">Total Volume</div><div class="text-2xl font-bold">$${providerData.totalVolume.toLocaleString()}</div></div>
      <div class="card"><div class="text-sm text-gray-500">Total Sales</div><div class="text-2xl font-bold">${providerData.totalSales.toLocaleString()}</div></div>
      <div class="card"><div class="text-sm text-gray-500">Avg Ticket</div><div class="text-2xl font-bold">$${providerData.avgTicket.toFixed(2)}</div></div>
      <div class="card"><div class="text-sm text-gray-500">Success Rate</div><div class="text-2xl font-bold">${providerData.successRate.toFixed(1)}%</div></div>
    `;
    
    document.getElementById('provider-transactions').innerHTML = '<p class="text-gray-500">Transaction list coming soon...</p>';
    
    // Sample charts
    renderChart("provider-carrier-chart", "bar", {
      labels: ["t mobile", "MetroPCS", "simple mobile", "a t and t"],
      datasets: [{label: "Volume", data: [800000, 650000, 720000, 693367], backgroundColor: "#667eea"}]
    });
    
    renderChart("provider-payment-chart", "pie", {
      labels: ["Card", "Apple Pay", "Google Pay", "PayPal"],
      datasets: [{data: [70, 15, 10, 5], backgroundColor: ["#667eea", "#764ba2", "#f59e0b", "#10b981"]}]
    });
    
  } catch (e) {
    
  }
}


document.addEventListener("DOMContentLoaded", () => {
  
  
  // Setup navigation links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      
      if (window.navigateTo) {
        window.navigateTo(page);
      } else {
        
      }
    });
  });
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('#logout-btn-top, #logout-btn-sidebar');
  logoutButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (window.logout) {
          window.logout();
        } else {
          
          // Fallback
          localStorage.clear();
          window.location.href = (window.APP_BASE || '') + '/login.html';
        }
      });
    }
  });
  
  init();
});

// ============================================
// FLOATING AI ASSISTANT
// ============================================
window.toggleAIAssistant = function() {
  const panel = document.getElementById('ai-assistant-panel');
  const button = document.getElementById('ai-assistant-toggle');
  
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    panel.classList.add('flex');
    button.innerHTML = '<i class="fas fa-times text-2xl"></i>';
  } else {
    panel.classList.add('hidden');
    panel.classList.remove('flex');
    button.innerHTML = '<i class="fas fa-robot text-2xl"></i>';
  }
};

window.sendAIMessage = function() {
  const input = document.getElementById('ai-chat-input');
  const messagesContainer = document.getElementById('ai-chat-messages');
  
  if (!input || !messagesContainer) return;
  
  const message = input.value.trim();
  if (!message) return;
  
  // Add user message
  const userMessageHTML = `
    <div class="flex items-start space-x-2 justify-end">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-3 shadow-sm max-w-[80%]">
        <p class="text-sm">${message}</p>
      </div>
      <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
        <i class="fas fa-user text-gray-600 text-sm"></i>
      </div>
    </div>
  `;
  
  messagesContainer.insertAdjacentHTML('beforeend', userMessageHTML);
  input.value = '';
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Simulate AI response (dummy for now)
  setTimeout(() => {
    const aiResponse = getAIResponse(message.toLowerCase());
    
    const aiMessageHTML = `
      <div class="flex items-start space-x-2">
        <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
          <p class="text-sm text-gray-800">${aiResponse}</p>
        </div>
      </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', aiMessageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 500);
};

function getAIResponse(message) {
  // Dummy AI responses based on keywords
  if (message.includes('sales') || message.includes('revenue')) {
    return "📊 Based on our data, total revenue is <strong>$12.96M</strong> with a <strong>15.5% increase</strong>. B2B accounts for $1.50M and D2C for $906K. Would you like to see a detailed breakdown?";
  } else if (message.includes('top') || message.includes('best') || message.includes('performing')) {
    return "🌟 Top performing areas: <br>• B2B customers: 20 active<br>• D2C transactions: 8,329<br>• Success rate: 98.5%<br>• Average ticket: $189.87";
  } else if (message.includes('alert') || message.includes('drop') || message.includes('problem')) {
    return "⚠️ We have <strong>3 active sales drop alerts</strong>:<br>• SurePays: -25%<br>• DT One: -20%<br>• EZPay: -18.2%<br>You can send pre-drafted emails from the dashboard.";
  } else if (message.includes('report') || message.includes('export')) {
    return "📄 You can access <strong>13 comprehensive reports</strong> from the Reports page. All reports support CSV export and have real-time search functionality.";
  } else if (message.includes('employee') || message.includes('staff') || message.includes('team')) {
    return "👥 You have <strong>5 employees</strong> in the system. You can manage them from the Employees page with full CRUD operations (Add/Edit/Delete).";
  } else if (message.includes('crm') || message.includes('customer') || message.includes('contact')) {
    return "🤝 CRM system has <strong>4 active contacts</strong> and <strong>3 deals</strong> in the pipeline. Total pipeline value: <strong>$350K</strong>. Access the CRM page for full management.";
  } else if (message.includes('help') || message.includes('what can you')) {
    return "🤖 I can help you with:<br>• Sales and revenue insights<br>• Performance metrics<br>• Sales drop alerts<br>• Report information<br>• Employee management<br>• CRM data<br>Just ask me anything!";
  } else {
    return "🤔 I understand you're asking about '" + message + "'. While I'm still learning, I can help with sales data, reports, employees, and CRM. Could you rephrase your question or ask about one of these topics?";
  }
}


