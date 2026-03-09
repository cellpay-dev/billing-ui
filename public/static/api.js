// ============================================
// REST API CONFIGURATION & SETUP
// ============================================
// This file handles all API communication with the backend

// Get backend API URL from config. Relative path (e.g. /analytics/api) = same Tomcat/host; full URL = remote backend.
const BACKEND_API_URL = window.AppConfig?.api?.backendUrl || '/analytics/api';

// Create axios instance with base configuration (same base as signin so /business-report etc. include /analytics/api)
const api = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: window.AppConfig?.api?.timeout || 30000
});

// Request interceptor - Add authorization token to all requests; redirect if token expired (expiresAt)
api.interceptors.request.use(
  (config) => {
    if (clearAndRedirectIfExpired()) {
      return Promise.reject(new Error('Session expired'));
    }
    const tokenKey = window.AppConfig?.auth?.tokenKey || 'token';
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - Handle unauthorized access (401 only; 403 is left to callers)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials and redirect to login
      localStorage.clear();
      window.location.href = (window.APP_BASE || '') + "/login.html";
    }
    return Promise.reject(error);
  }
);

/**
 * Extract message from backend error response body.
 * Tries message, error, errorMessage; if data is string use it; if data.errors is array, join.
 * @param {*} data - error.response.data
 * @returns {string} Empty if nothing found
 */
function extractServerMessage(data) {
  if (data == null) return '';
  if (typeof data === 'string') {
    const s = data.trim();
    // Avoid using HTML error pages (e.g. Tomcat 404) as the message
    if (s && !/^\s*<(!DOCTYPE|html|xml)/i.test(s)) return s;
    return '';
  }
  const msg = data.message ?? data.error ?? data.errorMessage ?? data.msg;
  if (msg != null && String(msg).trim()) return String(msg).trim();
  if (Array.isArray(data.errors) && data.errors.length) {
    const parts = data.errors.map(e => (typeof e === 'string' ? e : e?.message ?? e?.msg ?? '')).filter(Boolean);
    if (parts.length) return parts.join('. ');
  }
  return '';
}

/**
 * Get a user-friendly message from an API error (e.g. axios error).
 * Handles 400, 403, 404, 5xx; prefers backend body message over raw "Request failed with status code XXX".
 * @param {Error} error - Caught error (typically from api.get/post etc.)
 * @returns {string} Message safe to show in the UI
 */
function getApiErrorMessage(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  const serverMessage = extractServerMessage(data);
  const isAxiosStatusMessage = error.message && /^Request failed with status code \d{3}$/.test(error.message);

  if (status === 401) {
    return serverMessage || 'Invalid credentials.';
  }
  if (status === 403) {
    return serverMessage || 'You do not have permission to access this resource.';
  }
  if (status === 404) {
    return serverMessage || 'Resource not found.';
  }
  if (status === 400) {
    return serverMessage || 'Invalid request. Please check your input and try again.';
  }
  if (status >= 500) {
    return serverMessage || 'Server error. Please try again later.';
  }
  // Prefer backend message; avoid showing raw "Request failed with status code 500"
  if (serverMessage) return serverMessage;
  if (isAxiosStatusMessage) return 'Something went wrong. Please try again.';
  return error.message || 'Something went wrong. Please try again.';
}

window.getApiErrorMessage = getApiErrorMessage;

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Login API function
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise} Login response with token and user data
 */
const login = async (username, password) => {
  try {
    // Call backend authentication API
    const response = await axios.post(BACKEND_API_URL + '/auth/signin', { 
      username, 
      password 
    });
    
    // Extract token and user data from backend response
    const { accessToken, username: backendUsername, name, roles, expiresAt } = response.data;
    // Normalize role: backend may send roles as array (e.g. ['ADMIN'], ['ROLE_ADMIN']) or string; map to 'admin'|'manager'|'sales'
    const rawRole = Array.isArray(roles) ? roles[0] : roles;
    const roleStr = rawRole != null ? String(rawRole).toLowerCase().replace(/^role_/, '') : '';
    const normalizedRole = roleStr === 'admin' ? 'admin' : roleStr === 'manager' ? 'manager' : 'sales';

    const user = {
      id: backendUsername,
      name: name || backendUsername,
      email: backendUsername + '@cellpay.net',
      username: backendUsername,
      role: normalizedRole,
      employee_role: normalizedRole,
      roles: roles
    };
    
    // Get storage keys from config
    const tokenKey = window.AppConfig?.auth?.tokenKey || 'token';
    const userKey = window.AppConfig?.auth?.userKey || 'user';
    const expiresAtKey = window.AppConfig?.auth?.expiresAtKey || 'tokenExpiresAt';

    // Store token, user data, and optional expiry
    localStorage.setItem(tokenKey, accessToken);
    localStorage.setItem(userKey, JSON.stringify(user));
    if (expiresAt != null) {
      localStorage.setItem(expiresAtKey, typeof expiresAt === 'string' ? expiresAt : String(expiresAt));
    }

    return { success: true, user, token: accessToken, expiresAt: expiresAt ?? null };
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    return { success: false, error: errorMessage };
  }
};

/** Buffer (ms) before expiry to consider session expired and avoid sending doomed requests */
const EXPIRY_BUFFER_MS = 10 * 1000;

/**
 * Returns true if stored token has an expiresAt and that time is in the past (or within buffer).
 * If no expiresAt is stored, returns false (backend 401 will handle expiry).
 */
function isSessionExpired() {
  const expiresAtKey = window.AppConfig?.auth?.expiresAtKey || 'tokenExpiresAt';
  const expiresAtStr = localStorage.getItem(expiresAtKey);
  if (expiresAtStr == null || expiresAtStr === '') return false;
  const expiresAtMs = new Date(expiresAtStr).getTime();
  if (Number.isNaN(expiresAtMs)) return false;
  return Date.now() >= expiresAtMs - EXPIRY_BUFFER_MS;
}

/**
 * If session is expired (expiresAt in past), clears storage and redirects to login.
 * @returns {boolean} true if session was expired and redirect was triggered
 */
function clearAndRedirectIfExpired() {
  if (!isSessionExpired()) return false;
  localStorage.clear();
  window.location.href = (window.APP_BASE || '') + '/login.html';
  return true;
}

window.isSessionExpired = isSessionExpired;

/**
 * Logout function - Clear all stored credentials
 */
const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = (window.APP_BASE || '') + '/login.html';
};

/**
 * Fetch list of users from backend (for Employee Management).
 * Response shape: [{ id, userName, name, email, role, enabled }]
 * @returns {Promise<Array<{id: number, userName: string, name: string, email: string, role: string, enabled: boolean}>>}
 */
const fetchAuthUsers = async () => {
  const response = await api.get('/auth/users');
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

/**
 * Create a new user. POST /api/auth/users
 * @param {Object} payload - { username, password, role, name, email }; role must be admin|sales|manager
 * @returns {Promise<{id, userName, name, email, role, enabled, message}>}
 */
const createAuthUser = async (payload) => {
  const response = await api.post('/auth/users', payload);
  return response.data || {};
};

/**
 * Update a user. PUT /api/auth/users
 * @param {Object} payload - { id, name?, email?, role?, password?, enabled? }; role admin|sales|manager
 * @returns {Promise<{id, userName, name, email, role, enabled, message}>}
 */
const updateAuthUser = async (payload) => {
  const response = await api.put('/auth/users', payload);
  return response.data || {};
};

window.fetchAuthUsers = fetchAuthUsers;
window.createAuthUser = createAuthUser;
window.updateAuthUser = updateAuthUser;

// ============================================
// B2B CRM API
// ============================================

/**
 * Fetch B2B CRM summary for cards (Total Customers, Active, At Risk, 30-Day Sales).
 * @returns {Promise<{totalCustomers: number, totalActive: number, atRisk: number, 30DaysSales: number}>}
 */
const fetchB2BCRMSummary = async () => {
  const response = await api.get('/b2b/crm/summary');
  return response.data || {};
};

/**
 * Fetch B2B CRM clients for table (clientCode kept hidden in response, not displayed).
 * @returns {Promise<Array<{clientCode: string, partnerName: string, emailTo: string, status: string, partnerStoreNumber: string, creditLimit: number, 7DaySales: number, 30DaySales: number, 7DaysTrend: number}>>}
 */
const fetchB2BCRMClients = async () => {
  const response = await api.get('/b2b/crm/clients');
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

/**
 * Create B2B CRM client. POST /api/b2b/crm/clients
 * Body: { partnerName, emailTo, status, storeId, creditLimit }.
 * @param {Object} payload - { partnerName: string, emailTo: string, status?: string, storeId: string, creditLimit?: number }
 * @returns {Promise<Object>}
 */
const createB2BCRMClient = async (payload) => {
  const response = await api.post('/b2b/crm/clients', payload);
  return response.data || {};
};

/**
 * Update B2B CRM client. PUT /api/b2b/crm/clients
 * Body: { clientId, partnerName, emailTo, status, creditLimit }. clientId required.
 * @param {Object} payload - { clientId: number, partnerName?: string, emailTo?: string, status?: string, creditLimit?: number }
 * @returns {Promise<Object>}
 */
const updateB2BCRMClient = async (payload) => {
  const response = await api.put('/b2b/crm/clients', payload);
  return response.data || {};
};

/**
 * Fetch B2B CRM client details by clientCode (carrier pricing: discount, fee per type).
 * GET /api/b2b/crm/clients/:clientCode
 * Supports response as array of margins or { clientId, carrierMargins } / { clientId, data }.
 * @param {string} clientCode - Client identifier (hidden in UI)
 * @returns {Promise<{ rows: Array, clientId?: number }>}
 */
const fetchB2BCRMClientDetails = async (clientCode) => {
  const response = await api.get(`/b2b/crm/clients/${encodeURIComponent(clientCode)}`);
  const d = response.data;
  if (Array.isArray(d)) return { rows: d };
  const rows = d?.carrierMargins ?? d?.data ?? (Array.isArray(d?.margins) ? d.margins : []);
  const clientId = d?.clientId ?? d?.client_id;
  return { rows: Array.isArray(rows) ? rows : [], clientId: clientId != null ? Number(clientId) : undefined };
};

/**
 * Fetch all carriers (for create carrier margin dropdown). GET /api/b2b/carriers
 */
const fetchB2BCarriers = async () => {
  const response = await api.get('/b2b/carriers');
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

/**
 * Create client carrier margin. POST /api/b2b/crm/clients/carrier-margins
 */
const createClientCarrierMargin = async (payload) => {
  const response = await api.post('/b2b/crm/clients/carrier-margins', payload);
  return response.data || {};
};

/**
 * Update client carrier margin. PUT /api/b2b/crm/clients/carrier-margins
 * Body: clientCarrierMarginId (or id), discount, discountType, fee, feeType.
 */
const updateClientCarrierMargin = async (payload) => {
  const clientCarrierMarginId = payload.clientCarrierMarginId ?? payload.id;
  const body = {
    clientCarrierMarginId,
    id: clientCarrierMarginId,
    discount: payload.discount,
    discountType: payload.discountType,
    fee: payload.fee,
    feeType: payload.feeType
  };
  const response = await api.put('/b2b/crm/clients/carrier-margins', body);
  return response.data || {};
};

/**
 * Delete client carrier margin. DELETE /api/b2b/crm/clients/carrier-margins/:id
 * id is the clientCarrierMarginId from the details response.
 */
const deleteClientCarrierMargin = async (id) => {
  const marginId = id != null ? Number(id) : NaN;
  if (Number.isNaN(marginId)) return {};
  const response = await api.delete(`/b2b/crm/clients/carrier-margins/${marginId}`);
  return response.data || {};
};

window.fetchB2BCRMSummary = fetchB2BCRMSummary;
window.fetchB2BCRMClients = fetchB2BCRMClients;
window.createB2BCRMClient = createB2BCRMClient;
window.updateB2BCRMClient = updateB2BCRMClient;
window.fetchB2BCRMClientDetails = fetchB2BCRMClientDetails;
window.fetchB2BCarriers = fetchB2BCarriers;
window.createClientCarrierMargin = createClientCarrierMargin;
window.updateClientCarrierMargin = updateClientCarrierMargin;
window.deleteClientCarrierMargin = deleteClientCarrierMargin;

// ============================================
// ASSIGNABLE USERS (for task/ticket assignment only; non-admin can call)
// ============================================

/**
 * Fetch users who can be assigned to tasks/tickets. Use only in Tasks/Tickets module.
 * Response: [{ id, username, name }]
 * @returns {Promise<Array<{id: number, username: string, name: string}>>}
 */
const fetchAssignableUsers = async () => {
  const response = await api.get('/auth/users/assignable');
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

window.fetchAssignableUsers = fetchAssignableUsers;

// ============================================
// TASKS API (backend: GET/POST/PATCH under backendUrl, e.g. /analytics/api/tasks)
// ============================================

/**
 * Fetch tasks (bucketed). GET /api/tasks
 * @returns {Promise<{assignedToMe: Array, openedByMe: Array, all?: Array}>}
 */
const fetchTasks = async () => {
  const response = await api.get('/tasks');
  return response.data || {};
};

/**
 * Fetch task by id (with comments). GET /api/tasks/:id
 * @param {number} id - Task id
 * @returns {Promise<Object>} Task with comments array
 */
const fetchTaskById = async (id) => {
  const response = await api.get(`/tasks/${Number(id)}`);
  return response.data;
};

/**
 * Create task. POST /api/tasks
 * Request: { title, description?, assignedToUserId }
 * Response: { id, title, description, createdBy, assignedTo, creatorName, assigneeName, state, createdAt, updatedAt, comments }
 * @param {Object} payload - { title: string, description?: string, assignedToUserId: number }
 * @returns {Promise<Object>} Created task (response body as above)
 */
const createTask = async (payload) => {
  const body = {
    title: payload.title,
    assignedToUserId: Number(payload.assignedToUserId)
  };
  if (payload.description != null && payload.description !== '') body.description = payload.description;
  const response = await api.post('/tasks', body);
  const data = response.data;
  return (data && (data.task || data.data)) ? (data.task || data.data) : data;
};

/**
 * Update task. PATCH /api/tasks/:id (comment required when sending state or assignedToUserId)
 * Only sends defined fields. Backend returns full task with comments.
 * @param {number} id - Task id
 * @param {Object} payload - { comment?, state?, assignedToUserId? }
 * @returns {Promise<Object>} Updated task with comments
 */
const updateTask = async (id, payload) => {
  const body = {};
  if (payload.comment != null && payload.comment !== '') body.comment = payload.comment;
  if (payload.state != null && payload.state !== '') body.state = payload.state;
  if (payload.assignedToUserId != null) body.assignedToUserId = Number(payload.assignedToUserId);
  const response = await api.patch(`/tasks/${Number(id)}`, body);
  return response.data;
};

// ============================================
// TICKETS API
// ============================================

/**
 * Fetch tickets (bucketed). GET /api/tickets
 * @returns {Promise<{assignedToMe: Array, openedByMe: Array, all?: Array}>}
 */
const fetchTickets = async () => {
  const response = await api.get('/tickets');
  return response.data || {};
};

/**
 * Fetch ticket by id (with comments). GET /api/tickets/:id
 * @param {number} id - Ticket id
 * @returns {Promise<Object>} Ticket with comments array
 */
const fetchTicketById = async (id) => {
  const response = await api.get(`/tickets/${Number(id)}`);
  return response.data;
};

/**
 * Create ticket. POST /api/tickets
 * @param {Object} payload - { title: string, description?: string, assignedToUserId: number, priority? }
 * @returns {Promise<Object>} Created ticket
 */
const createTicket = async (payload) => {
  const response = await api.post('/tickets', payload);
  return response.data;
};

/**
 * Update ticket. PATCH /api/tickets/:id (comment required when sending state or assignedToUserId)
 * @param {number} id - Ticket id
 * @param {Object} payload - { comment?, state?, assignedToUserId?, priority? }
 * @returns {Promise<Object>} Updated ticket with comments
 */
const updateTicket = async (id, payload) => {
  const response = await api.patch(`/tickets/${Number(id)}`, payload);
  return response.data;
};

window.fetchTasks = fetchTasks;
window.fetchTaskById = fetchTaskById;
window.createTask = createTask;
window.updateTask = updateTask;
window.fetchTickets = fetchTickets;
window.fetchTicketById = fetchTicketById;
window.createTicket = createTicket;
window.updateTicket = updateTicket;

// ============================================
// BUSINESS REPORT API
// ============================================

/**
 * Fetch business report data from backend.
 * Same API used for all report types; response shape varies by reportType.
 * @param {string} reportType - e.g. 'vendor', 'b2b-sales', 'mid-volume'
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<Array>} Report rows (array of objects; structure depends on reportType)
 */
const fetchBusinessReport = async (reportType, startDate, endDate) => {
  const response = await api.get('/business-report/reports', {
    params: { reportType, startDate, endDate }
  });
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

/**
 * Fetch B2B sales details by carrier for a single client (provider).
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {string} clientCode - Client/provider identifier
 * @returns {Promise<Array<{carrierName: string, count: number, amount: number, commission: number}>>} Rows per carrier
 */
const fetchB2BSalesDetails = async (startDate, endDate, clientCode) => {
  const response = await api.get('/business-report/reports', {
    params: { reportType: 'b2b-sales-details', startDate, endDate, clientCode }
  });
  return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
};

window.fetchBusinessReport = fetchBusinessReport;
window.fetchB2BSalesDetails = fetchB2BSalesDetails;

// ============================================
// CUMULATIVE DASHBOARD API
// ============================================

/**
 * Fetch revenue breakdown for dashboard service-breakdown (doughnut) chart.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{labels: string[], datasets: Array}>} Chart config with labels and datasets
 */
const fetchRevenueBreakdown = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/revenue-breakdown', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchRevenueBreakdown = fetchRevenueBreakdown;

/**
 * Fetch D2C performance metrics for dashboard card.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{totalRevenue: number, totalTxns: number, avgTicket: number, revenueGrowth: number, txnsGrowth: number, avgTicketGrowth: number}>}
 */
const fetchD2CPerformance = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/d2c-performance', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchD2CPerformance = fetchD2CPerformance;

/**
 * Fetch B2B performance metrics for dashboard card.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{totalRevenue: number, totalCustomers: number, avgTicket: number, revenueGrowth: number, customersGrowth: number, avgTicketGrowth: number}>}
 */
const fetchB2BPerformance = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/b2b-performance', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchB2BPerformance = fetchB2BPerformance;

/**
 * Fetch payment methods breakdown for dashboard chart.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{labels: string[], datasets: Array}>} Chart config with labels and datasets
 */
const fetchPaymentMethods = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/payment-methods', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchPaymentMethods = fetchPaymentMethods;

/**
 * Fetch top carriers for dashboard chart.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{labels: string[], datasets: Array}>} Chart config with labels and datasets
 */
const fetchTopCarriers = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/top-carriers', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchTopCarriers = fetchTopCarriers;

/**
 * Fetch daily sales for dashboard timeline chart.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<Array<{date: string, volume: number}>>}
 */
const fetchDailySales = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/daily-sales', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchDailySales = fetchDailySales;

/**
 * Fetch dashboard KPI metrics.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{totalRevenue: number, totalTxns: number, avgTicket: number, successRate: number, totalRevenueChangePercent: number, totalTxnsChangePercent: number, avgTicketChangePercent: number, successRateChangePercent: number}>}
 */
const fetchDashboardMetrics = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/metrics', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchDashboardMetrics = fetchDashboardMetrics;

/**
 * Fetch sales drop alerts for dashboard.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<Array<{customer: string, previousSales: number, currentSales: number, drop: number, email: string}>>}
 */
const fetchSalesDropAlerts = async (startDate, endDate) => {
  const response = await api.get('/cumulative-dashboard/sales-drop', {
    params: { startDate, endDate }
  });
  return response.data;
};

window.fetchSalesDropAlerts = fetchSalesDropAlerts;

// ============================================
// CUMULATIVE ANALYTICS API
// ============================================

/**
 * Fetch analytics KPI metrics.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @param {string} product - e.g. 'all', '1', '2'
 * @param {string} customerType - e.g. 'all', 'b2b', 'd2c'
 */
const fetchAnalyticsMetrics = async (startDate, endDate, product, customerType) => {
  const response = await api.get('/cumulative-analytics/metrics', {
    params: { startDate, endDate, product, customerType }
  });
  return response.data;
};

window.fetchAnalyticsMetrics = fetchAnalyticsMetrics;

/**
 * Fetch analytics revenue trend.
 */
const fetchAnalyticsRevenueTrend = async (startDate, endDate, product, customerType) => {
  const response = await api.get('/cumulative-analytics/revenue-trend', {
    params: { startDate, endDate, product, customerType }
  });
  return response.data;
};

window.fetchAnalyticsRevenueTrend = fetchAnalyticsRevenueTrend;

/**
 * Fetch analytics transaction trend.
 */
const fetchAnalyticsTransactionTrend = async (startDate, endDate, product, customerType) => {
  const response = await api.get('/cumulative-analytics/transaction-trend', {
    params: { startDate, endDate, product, customerType }
  });
  return response.data;
};

window.fetchAnalyticsTransactionTrend = fetchAnalyticsTransactionTrend;

/**
 * Fetch analytics product mix.
 */
const fetchAnalyticsProductMix = async (startDate, endDate, product, customerType) => {
  const response = await api.get('/cumulative-analytics/product-mix', {
    params: { startDate, endDate, product, customerType }
  });
  return response.data;
};

window.fetchAnalyticsProductMix = fetchAnalyticsProductMix;

/**
 * Fetch analytics top customers.
 */
const fetchAnalyticsTopCustomers = async (startDate, endDate, product, customerType, limit = 5) => {
  const response = await api.get('/cumulative-analytics/top-customers', {
    params: { startDate, endDate, product, customerType, limit }
  });
  return response.data;
};

window.fetchAnalyticsTopCustomers = fetchAnalyticsTopCustomers;

/**
 * Fetch analytics period comparison.
 */
const fetchAnalyticsPeriodComparison = async (startDate, endDate, product, customerType) => {
  const response = await api.get('/cumulative-analytics/period-comparison', {
    params: { startDate, endDate, product, customerType }
  });
  return response.data;
};

window.fetchAnalyticsPeriodComparison = fetchAnalyticsPeriodComparison;

// Export the configured API instance and auth functions
window.api = api;
window.authAPI = {
  login,
  logout,
  BACKEND_API_URL
};
