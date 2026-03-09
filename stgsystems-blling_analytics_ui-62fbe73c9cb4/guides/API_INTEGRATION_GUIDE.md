# CellPay CRM+ERP API Integration Guide

## Overview
This guide shows developers **exactly** where to replace dummy data with real API endpoints. All data structures are ready for API integration.

---

## 🔐 Employee Management & Login System

### Employee Onboarding Flow

When an admin adds a new employee, the system **automatically generates login credentials**:

#### **How It Works:**

1. **Admin adds employee** → System generates:
   - Username: From email (part before @)
   - Temporary Password: 12-character secure random password
   - Requirement: Must change password on first login

2. **Admin sees credentials modal** with:
   - Employee name, email, username
   - Temporary password (shown only once)
   - Copy buttons for each field
   - "Copy All Credentials" button
   - "Email Credentials" button (production)
   - Portal URL

3. **Admin shares credentials** via:
   - Copy & paste to secure channel
   - Email (in production with backend)
   - WhatsApp/Slack (manual)

4. **Employee first login**:
   - Uses username + temporary password
   - System forces password change
   - New password must meet requirements
   - Account activated after password change

#### **Password Reset Flow:**

Admins can reset any employee's password:
1. Click **Reset Password** button (key icon)
2. System generates new temporary password
3. Shows credentials modal
4. Admin shares new password
5. Employee must change password on next login

---

### API Endpoints for Employee Management

#### POST /api/employees
Add new employee and generate credentials.

**Frontend Location:** `window.saveEmployee()` in `public/static/app.js`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-1234",
  "department": "Sales",
  "role": "employee",
  "status": "active"
}
```

**Backend Should:**
1. Create employee record
2. Generate username from email
3. Generate secure temporary password (hash it!)
4. Store: `requirePasswordChange: true`
5. Send email with credentials (optional)
6. Return credentials to frontend

**Response:**
```json
{
  "id": 6,
  "name": "John Doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-1234",
  "department": "Sales",
  "role": "employee",
  "status": "active",
  "username": "john.doe",
  "tempPassword": "xY9mK#2pQ8zL",
  "requirePasswordChange": true,
  "createdAt": "2026-02-08T10:30:00Z"
}
```

---

#### POST /api/employees/:id/reset-password
Reset employee password.

**Frontend Location:** `window.resetEmployeePassword()` in `public/static/app.js`

**Request:**
```json
{
  "employeeId": 6
}
```

**Response:**
```json
{
  "username": "john.doe",
  "tempPassword": "aB7nP#5tR9wM",
  "requirePasswordChange": true,
  "resetAt": "2026-02-08T14:20:00Z"
}
```

---

#### POST /api/auth/login
Employee login endpoint.

**Request:**
```json
{
  "username": "john.doe",
  "password": "xY9mK#2pQ8zL"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 6,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "employee",
    "department": "Sales",
    "permissions": ["viewDashboard", "viewReports", "viewCRM"]
  },
  "requirePasswordChange": true,
  "token": "jwt-token-here"
}
```

If `requirePasswordChange: true`, frontend shows "Change Password" form immediately.

---

#### POST /api/auth/change-password
Change password on first login or reset.

**Request:**
```json
{
  "username": "john.doe",
  "currentPassword": "xY9mK#2pQ8zL",
  "newPassword": "MyNewSecurePass123!",
  "confirmPassword": "MyNewSecurePass123!"
}
```

**Backend Should:**
1. Verify current password
2. Validate new password (min 8 chars, uppercase, lowercase, number, special)
3. Hash new password
4. Set `requirePasswordChange: false`
5. Update last password change date

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Email Template (Production)

When backend sends credentials email:

```
Subject: Your CellPay Portal Access

Hi [Employee Name],

Welcome to CellPay! Your account has been created.

Portal Login:
URL: https://portal.cellpay.com
Username: [username]
Temporary Password: [tempPassword]

IMPORTANT SECURITY NOTICE:
✓ You must change your password on first login
✓ Choose a strong password (min 8 characters, uppercase, lowercase, number, special character)
✓ Never share your password with anyone
✓ This email contains sensitive information - delete it after first login

If you did not expect this email or have questions, contact your administrator.

Best regards,
CellPay Team
```

---

## 🔗 API Endpoints to Implement

### 1. **Customer Management**

#### GET /api/customers
Returns list of B2B customers with all fields.

**Frontend Location:** `public/static/app.js` line ~1457
**Function:** `loadCRMCustomers()`
**Current Code:**
```javascript
const customers = state.crmCustomers;  // Replace this line
```

**Replace With:**
```javascript
const response = await apiClient.get('/api/customers');
const customers = response.data;
state.crmCustomers = customers; // Cache locally
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "businessName": "Downtown Convenience Store",
    "contactPerson": "John Smith",
    "email": "john@downtown.com",
    "phone": "+1-555-1001",
    "storeId": "STORE-001",
    "isoId": "ISO-10",
    "subIsoId": "SUB-ISO-25",
    "status": "active",
    "riskLevel": "low",
    "products": [1, 2, 3],
    "salesLast7Days": 45230,
    "salesLast30Days": 185400,
    "salesTrend": "+12%",
    "lastTransaction": "2026-02-07",
    "assignedEmployee": 2,
    "creditLimit": 100000,
    "creditBalance": 15230,
    "notes": "Top performer, reliable payment"
  }
]
```

---

#### POST /api/customers
Add new B2B customer.

**Frontend Location:** `window.showAddCustomer()` line ~1858
**Replace:** `addNotification('info', 'Coming Soon', ...)`

**With:**
```javascript
const newCustomer = {
  businessName: "...",
  contactPerson: "...",
  email: "...",
  phone: "...",
  storeId: "...",
  isoId: "...",
  subIsoId: "...",
  products: [],
  assignedEmployee: currentUser.id
};
const response = await apiClient.post('/api/customers', newCustomer);
state.crmCustomers.push(response.data);
loadCRMCustomers();
```

---

#### PUT /api/customers/:id
Update customer.

**Frontend Location:** `window.editCustomer()` line ~1879

---

### 2. **Products**

#### GET /api/products
Returns product catalog.

**Frontend Location:** `loadCRMProducts()` line ~1822
**Current Code:**
```javascript
const products = state.products;  // Replace this line
```

**Replace With:**
```javascript
const response = await apiClient.get('/api/products');
const products = response.data;
state.products = products;
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Airtime",
    "category": "Mobile",
    "enabled": true,
    "commission": 2.5
  }
]
```

---

### 3. **Tasks & Follow-ups**

#### GET /api/tasks
Returns all tasks.

**Frontend Location:** `loadCRMTasks()` line ~1620
**Current Code:**
```javascript
const tasks = state.crmTasks;  // Replace this line
```

**Replace With:**
```javascript
const response = await apiClient.get('/api/tasks');
const tasks = response.data;
state.crmTasks = tasks;
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "customerId": 4,
    "customerName": "Corner Store 24/7",
    "taskType": "call",
    "priority": "urgent",
    "title": "Call about sales drop",
    "description": "No transactions in 10 days...",
    "assignedTo": 2,
    "assignedToName": "John Manager",
    "dueDate": "2026-02-09",
    "status": "open",
    "createdAt": "2026-02-08"
  }
]
```

---

#### POST /api/tasks
Create new task.

**Frontend Location:** `window.createTask()` line ~1885

**Replace With:**
```javascript
const newTask = {
  customerId: customerId,
  taskType: "call",
  priority: "normal",
  title: "Follow up with customer",
  description: "...",
  assignedTo: currentUser.id,
  dueDate: "2026-02-10"
};
const response = await apiClient.post('/api/tasks', newTask);
state.crmTasks.push(response.data);
addNotification('success', 'Task Created', `Task created successfully`);
```

---

#### PATCH /api/tasks/:id/complete
Mark task as complete.

**Frontend Location:** `window.completeTask()` line ~1891

**Replace With:**
```javascript
const response = await apiClient.patch(`/api/tasks/${taskId}/complete`);
task.status = 'completed';
task.completedAt = response.data.completedAt;
loadCRMTasks();
```

---

### 4. **Smart Alerts (Auto-generated by Backend)**

#### GET /api/alerts
Returns smart alerts generated by business rules.

**Frontend Location:** `loadCRMAlerts()` line ~1722
**Current Code:**
```javascript
const alerts = state.crmAlerts;  // Replace this line
```

**Replace With:**
```javascript
const response = await apiClient.get('/api/alerts');
const alerts = response.data;
state.crmAlerts = alerts;
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "type": "sales_drop",
    "severity": "critical",
    "customerId": 4,
    "customerName": "Corner Store 24/7",
    "title": "No transactions for 10+ days",
    "message": "Last transaction: 2026-01-28. Sales dropped 45% in 30 days.",
    "actionRequired": "Immediate call required",
    "createdAt": "2026-02-08"
  }
]
```

---

## 🎯 Business Rules for Alerts (Backend Should Generate)

### 1. **Sales Drop Alert**
**Trigger:** Sales dropped >15% in last 30 days
**Severity:** 
- Critical: >30% drop OR no transactions in 7+ days
- Warning: 15-30% drop

### 2. **Credit Limit Alert**
**Trigger:** Credit balance > 80% of limit
**Severity:** Warning

### 3. **Inactive Customer Alert**
**Trigger:** No transactions in 14+ days
**Severity:** Critical

### 4. **Product Disabled Alert**
**Trigger:** Customer has <2 products enabled
**Severity:** Info

### 5. **Growth Opportunity Alert**
**Trigger:** Sales growth >10%
**Severity:** Info

---

## 📦 Data Initialization & Refresh Strategy

All data is initialized in `public/static/app.js` around lines **1471-1600**.

### **Recommended Data Pull Intervals**

When you connect real APIs, the system will automatically pull data based on these intervals:

#### **1. Initial Load (Page Load)**
**What:** All data loaded when user opens the portal
**Timeframe:** Last 90 days for historical data
**Endpoints:**
- `/api/customers` - All B2B customers
- `/api/products` - Product catalog
- `/api/tasks` - All open + last 30 days completed
- `/api/alerts` - Last 7 days alerts
- `/api/analytics` - Last 90 days analytics data

#### **2. Auto-Refresh Intervals**

| Data Type | Refresh Interval | Reason |
|-----------|------------------|--------|
| **Dashboard KPIs** | 5 minutes | Real-time sales tracking |
| **CRM Customers** | 15 minutes | Sales volumes update |
| **Tasks** | 10 minutes | New assignments |
| **Smart Alerts** | 5 minutes | Critical alerts need immediate attention |
| **Analytics** | 30 minutes | Trend data changes slowly |
| **Products** | On-demand | Changes infrequently |

#### **3. Historical Data Windows**

The system will maintain these data windows:

- **Dashboard:** Last 7, 30, 90 days (user selectable)
- **Analytics:** Last 7, 30, 90 days, Last 12 months (user selectable)
- **Reports:** Custom date range (default: last 30 days)
- **CRM Sales Trends:** Last 7 days and 30 days comparison
- **Tasks:** All open + last 90 days completed
- **Alerts:** Last 30 days (archived after)

#### **4. API Data Pull Configuration**

**To Switch from Dummy to API:**

1. **On Page Load:** Call API endpoints with date ranges
2. **Cache Response:** Store in `state` object
3. **Refresh Interval:** Auto-refresh based on data type
4. **Historical Data:** Pull last 90 days initially

**Example Implementation:**
```javascript
// API Configuration
const API_CONFIG = {
  refreshIntervals: {
    dashboard: 5 * 60 * 1000,    // 5 minutes
    customers: 15 * 60 * 1000,   // 15 minutes
    tasks: 10 * 60 * 1000,       // 10 minutes
    alerts: 5 * 60 * 1000,       // 5 minutes
    analytics: 30 * 60 * 1000    // 30 minutes
  },
  historicalDays: {
    initial: 90,      // Initial load: last 90 days
    dashboard: 90,    // Dashboard shows up to 90 days
    analytics: 365,   // Analytics can show up to 1 year
    tasks: 90,        // Keep last 90 days completed tasks
    alerts: 30        // Keep last 30 days alerts
  }
};

// Initialize CRM data with date ranges
async function initCRMData() {
  try {
    const today = new Date();
    const daysAgo = (days) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    };
    
    // Parallel API calls with date ranges
    const [customers, products, tasks, alerts] = await Promise.all([
      apiClient.get('/api/customers', {
        params: {
          from: daysAgo(API_CONFIG.historicalDays.initial),
          to: today.toISOString().split('T')[0],
          includeSales: true  // Include sales data
        }
      }),
      apiClient.get('/api/products'),
      apiClient.get('/api/tasks', {
        params: {
          from: daysAgo(API_CONFIG.historicalDays.tasks),
          status: 'all'  // open + completed last 90 days
        }
      }),
      apiClient.get('/api/alerts', {
        params: {
          from: daysAgo(API_CONFIG.historicalDays.alerts)
        }
      })
    ]);
    
    // Cache in state
    state.crmCustomers = customers.data;
    state.products = products.data;
    state.crmTasks = tasks.data;
    state.crmAlerts = alerts.data;
    
    console.log('✅ CRM data loaded from API');
    console.log(`📊 Loaded: ${customers.data.length} customers, ${tasks.data.length} tasks, ${alerts.data.length} alerts`);
    
  } catch (error) {
    console.error('❌ Failed to load CRM data:', error);
    // Fall back to dummy data
    console.log('⚠️ Using dummy data as fallback');
  }
}

// Auto-refresh functions
function setupAutoRefresh() {
  // Dashboard KPIs refresh every 5 minutes
  setInterval(() => {
    console.log('🔄 Refreshing Dashboard...');
    loadDashboardData();
  }, API_CONFIG.refreshIntervals.dashboard);
  
  // CRM Customers refresh every 15 minutes
  setInterval(() => {
    console.log('🔄 Refreshing Customers...');
    initCRMData();
  }, API_CONFIG.refreshIntervals.customers);
  
  // Tasks refresh every 10 minutes
  setInterval(() => {
    console.log('🔄 Refreshing Tasks...');
    apiClient.get('/api/tasks').then(res => {
      state.crmTasks = res.data;
      loadCRMTasks();
    });
  }, API_CONFIG.refreshIntervals.tasks);
  
  // Alerts refresh every 5 minutes
  setInterval(() => {
    console.log('🔄 Refreshing Alerts...');
    apiClient.get('/api/alerts').then(res => {
      state.crmAlerts = res.data;
      loadCRMAlerts();
    });
  }, API_CONFIG.refreshIntervals.alerts);
  
  // Analytics refresh every 30 minutes
  setInterval(() => {
    console.log('🔄 Refreshing Analytics...');
    loadAnalyticsData();
  }, API_CONFIG.refreshIntervals.analytics);
}

// Call on app initialization
window.addEventListener('DOMContentLoaded', () => {
  initCRMData();
  setupAutoRefresh();
});
```

#### **5. What Happens When API is Connected**

**✅ Automatic Behavior:**
1. **Initial Load:** System pulls last 90 days of data
2. **Dashboard:** Updates every 5 minutes with latest sales
3. **Smart Alerts:** Auto-generated every 5 minutes by backend
4. **Sales Trends:** Calculated from last 7 vs last 30 days
5. **Manual Refresh:** User can click refresh button anytime

**⏱️ How Long Until You Have Enough Data?**
- **Minimum:** 7 days for meaningful trends
- **Optimal:** 30 days for reliable sales patterns
- **Best:** 90 days for seasonal insights

**📈 Data Accumulation Timeline:**
- **Day 1:** Basic data, limited insights
- **Day 7:** Sales trends start showing
- **Day 30:** Reliable patterns, accurate alerts
- **Day 90:** Full historical analysis, seasonal trends

**💡 Recommendation:**
If you have historical data from your backend, backfill it during API connection to immediately have 90 days of insights.

---

## 🛠️ Easy Manual Customer Addition (No API)

If you want to **manually add customers** without API:

### Option 1: Add to Dummy Data
**Location:** `public/static/app.js` line ~1478

```javascript
state.crmCustomers = [
  {
    id: 6,  // Increment ID
    businessName: "Your New Store",
    contactPerson: "Jane Doe",
    email: "jane@newstore.com",
    phone: "+1-555-1006",
    storeId: "STORE-006",
    isoId: "ISO-20",
    subIsoId: "SUB-ISO-60",
    status: "active",
    riskLevel: "low",
    products: [1, 2],
    salesLast7Days: 10000,
    salesLast30Days: 40000,
    salesTrend: "+20%",
    lastTransaction: "2026-02-08",
    assignedEmployee: 2,
    creditLimit: 50000,
    creditBalance: 5000,
    notes: "New customer, onboarding"
  },
  // ... existing customers
];
```

### Option 2: Add via Browser Console
```javascript
state.crmCustomers.push({
  id: Date.now(),  // Auto ID
  businessName: "Quick Add Store",
  contactPerson: "Test User",
  email: "test@test.com",
  phone: "+1-555-9999",
  storeId: "STORE-TEST",
  isoId: "ISO-99",
  subIsoId: "SUB-ISO-99",
  status: "active",
  riskLevel: "low",
  products: [1],
  salesLast7Days: 5000,
  salesLast30Days: 20000,
  salesTrend: "+10%",
  lastTransaction: "2026-02-08",
  assignedEmployee: 2,
  creditLimit: 25000,
  creditBalance: 2000,
  notes: "Test customer"
});
loadCRMCustomers();  // Refresh view
```

---

## ✅ Testing Checklist

- [ ] Customer list loads with all fields
- [ ] Tasks show open/completed status
- [ ] Alerts show by severity
- [ ] Products display with commission
- [ ] Click customer → view details works
- [ ] Create task button works
- [ ] Complete task updates status
- [ ] Handle alert creates task
- [ ] Mobile responsive tables/cards
- [ ] Permission checks work (RBAC)

---

## 🎨 UI Features

### Customer List Includes:
- Business name, contact person, email
- Store ID, ISO/Sub-ISO mapping
- Number of products enabled
- 7-day and 30-day sales
- Sales trend with up/down arrows
- Status badges (active/at risk)
- Quick actions: View, Edit, Create Task

### Task Management:
- Priority badges (urgent/high/normal)
- Task type icons (call/visit/email/support)
- Due dates and assigned employees
- One-click complete button
- Separate open/completed sections

### Smart Alerts:
- Color-coded by severity
- Customer linking
- Action buttons
- Auto-task creation

### Products Catalog:
- Product name, category
- Commission percentage
- Customer usage count
- Enable/disable status

---

## 📊 KPI Boxes (Auto-calculated)

All KPI boxes calculate automatically from data:

- **Customers:** Total, Active, At Risk, 30-Day Sales
- **Tasks:** Open, Urgent, Completed, Total
- **Alerts:** Critical, Warnings, Info, Total
- **Products:** Total, Enabled, Categories, Avg Commission

---

## 🔥 What Makes This API-Ready

1. ✅ **Clear data structures** - Every field documented
2. ✅ **Exact API endpoints** - Know what to build
3. ✅ **Response format examples** - No guessing
4. ✅ **Frontend integration points** - Line numbers provided
5. ✅ **Business logic rules** - Backend knows what alerts to create
6. ✅ **Easy testing** - Works with dummy data first
7. ✅ **No refactoring needed** - Just replace data source

---

## 🚀 Quick Start for Developers

### Step 1: Test with Dummy Data
- Everything works now with dummy data
- Test all UI features
- Understand data flow

### Step 2: Build Backend APIs
- Implement the 4 main endpoints
- Return data in specified format
- Add business rules for alerts

### Step 3: Connect Frontend
- Replace `state.xxx` with `apiClient.get()`
- Add error handling
- Add loading states

### Step 4: Go Live
- Switch to real API
- Test with real customers
- Monitor performance

---

**Built with ❤️ by Claude | Ready for Production Integration**
