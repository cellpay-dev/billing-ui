# CellPay Portal - Complete API Specification

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Dashboard APIs](#dashboard-apis)
3. [Employee Management APIs](#employee-management-apis)
4. [CRM APIs](#crm-apis)
5. [Task Management APIs](#task-management-apis)
6. [Analytics APIs](#analytics-apis)
7. [Reports APIs](#reports-apis)
8. [Data Models](#data-models)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### POST /api/auth/login
User login endpoint.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@cellpay.net",
    "role": "admin",
    "department": "Management",
    "permissions": ["viewDashboard", "viewEmployees", "addEmployee", ...]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout
Logout current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 📊 Dashboard APIs

### GET /api/dashboard
Get dashboard data with KPIs, charts, and alerts.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `dateRange` (optional): `1d`, `7d`, `30d`, `90d` (default: `7d`)

**Response (200):**
```json
{
  "kpis": {
    "totalVolume": {
      "value": 12963308,
      "change": 15.5
    },
    "totalTransactions": {
      "value": 68286,
      "change": 8.2
    },
    "avgTicket": {
      "value": 189.87,
      "change": 7.1
    },
    "successRate": {
      "value": 98.5,
      "change": 1.2
    }
  },
  "b2bData": {
    "totalSales": 1502535,
    "customers": 20,
    "avgTicket": 75127,
    "growth": 12.5
  },
  "d2cData": {
    "totalSales": 905562,
    "transactions": 8329,
    "avgTicket": 108.75,
    "growth": 18.3
  },
  "salesDropAlerts": [
    {
      "customer": "DT One",
      "previousSales": 95000,
      "currentSales": 75995,
      "drop": -20.0,
      "email": "contact@dtone.com"
    }
  ],
  "timeline": [
    {"date": "02-01", "volume": 1850000},
    {"date": "02-02", "volume": 1920000}
  ],
  "carriers": {
    "labels": ["Simple Mobile", "AT&T", "T-Mobile", ...],
    "data": [492428, 399980, 207472, ...]
  },
  "payments": {
    "labels": ["Crypto", "Card", "Apple Pay", ...],
    "data": [625867, 542874, 320260, ...]
  },
  "breakdown": {
    "labels": ["B2B Sales", "D2C Carrier", "D2C Payment", ...],
    "data": [1502535, 362688, 542874, ...]
  }
}
```

---

## 👥 Employee Management APIs

### GET /api/employees
Get all employees.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "employees": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@cellpay.net",
      "username": "admin",
      "phone": "+1-555-0101",
      "department": "Management",
      "role": "admin",
      "status": "active",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/employees
Create new employee.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@cellpay.net",
  "username": "john.doe",
  "password": "SecurePass123",
  "phone": "+1-555-1234",
  "department": "Sales",
  "role": "employee",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "employee": {
    "id": 6,
    "name": "John Doe",
    "email": "john@cellpay.net",
    "username": "john.doe",
    "phone": "+1-555-1234",
    "department": "Sales",
    "role": "employee",
    "status": "active",
    "createdAt": "2026-02-08T12:00:00Z"
  }
}
```

---

### PUT /api/employees/:id
Update employee.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "John Doe Updated",
  "phone": "+1-555-5678",
  "department": "Support",
  "status": "suspended"
}
```

**Response (200):**
```json
{
  "success": true,
  "employee": { /* updated employee object */ }
}
```

---

### DELETE /api/employees/:id
Delete employee.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

### POST /api/employees/:id/reset-password
Admin resets employee password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 🏢 CRM APIs

### GET /api/customers
Get all B2B customers.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): `active`, `at-risk`, `inactive`
- `search` (optional): Search by business name or email

**Response (200):**
```json
{
  "customers": [
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
}
```

---

### POST /api/customers
Add new B2B customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "businessName": "Metro Gas Station",
  "contactPerson": "Jane Doe",
  "email": "jane@metrogas.com",
  "phone": "+1-555-9999",
  "storeId": "STORE-099",
  "isoId": "ISO-15",
  "subIsoId": "SUB-ISO-45",
  "assignedEmployee": 2,
  "notes": "New customer onboarding"
}
```

**Response (201):**
```json
{
  "success": true,
  "customer": {
    "id": 6,
    "businessName": "Metro Gas Station",
    /* ... auto-populated fields by backend ... */
    "status": "active",
    "riskLevel": "low",
    "products": [1],
    "creditLimit": 50000,
    "creditBalance": 0,
    "salesLast7Days": 0,
    "salesLast30Days": 0,
    "salesTrend": "New",
    "lastTransaction": null
  }
}
```

---

### PUT /api/customers/:id
Update customer.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "contactPerson": "Jane Smith",
  "phone": "+1-555-8888",
  "notes": "Updated contact information"
}
```

**Response (200):**
```json
{
  "success": true,
  "customer": { /* updated customer object */ }
}
```

---

### GET /api/products
Get product catalog.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Airtime",
      "category": "Mobile",
      "enabled": true,
      "commission": 2.5,
      "customerCount": 82
    },
    {
      "id": 2,
      "name": "Bill Payment",
      "category": "Utilities",
      "enabled": true,
      "commission": 1.8,
      "customerCount": 65
    }
  ]
}
```

---

## 📝 Task Management APIs

### GET /api/tasks
Get all tasks.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): `open`, `in_progress`, `completed`
- `priority` (optional): `normal`, `high`, `urgent`
- `assignedTo` (optional): Employee ID
- `customerId` (optional): Customer ID

**Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "customerId": 4,
      "customerName": "Corner Store 24/7",
      "taskType": "call",
      "priority": "urgent",
      "title": "Call about sales drop",
      "description": "No transactions in 10 days. Urgent follow-up required.",
      "assignedTo": 2,
      "assignedToName": "John Manager",
      "dueDate": "2026-02-09",
      "status": "open",
      "createdAt": "2026-02-08T10:30:00Z",
      "completedAt": null
    }
  ]
}
```

---

### POST /api/tasks
Create new task.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "customerId": 4,
  "taskType": "call",
  "priority": "urgent",
  "title": "Follow up on sales drop",
  "description": "Customer hasn't transacted in 10 days",
  "assignedTo": 2,
  "dueDate": "2026-02-10"
}
```

**Response (201):**
```json
{
  "success": true,
  "task": {
    "id": 5,
    "customerId": 4,
    "customerName": "Corner Store 24/7",
    "taskType": "call",
    "priority": "urgent",
    "title": "Follow up on sales drop",
    "description": "Customer hasn't transacted in 10 days",
    "assignedTo": 2,
    "assignedToName": "John Manager",
    "dueDate": "2026-02-10",
    "status": "open",
    "createdAt": "2026-02-08T14:30:00Z",
    "completedAt": null
  }
}
```

---

### PATCH /api/tasks/:id/complete
Mark task as completed.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "task": {
    "id": 5,
    "status": "completed",
    "completedAt": "2026-02-08T15:00:00Z"
  }
}
```

---

### GET /api/alerts
Get smart alerts (auto-generated by backend based on business rules).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `severity` (optional): `critical`, `warning`, `info`

**Response (200):**
```json
{
  "alerts": [
    {
      "id": 1,
      "type": "sales_drop",
      "severity": "critical",
      "customerId": 4,
      "customerName": "Corner Store 24/7",
      "title": "No transactions for 10+ days",
      "message": "Last transaction: 2026-01-28. Sales dropped 45% in 30 days.",
      "actionRequired": "Immediate call required",
      "createdAt": "2026-02-08T08:00:00Z"
    }
  ]
}
```

**Backend Alert Generation Rules:**
1. **Sales Drop Alert** - Sales dropped >15% in last 30 days
   - Critical: >30% drop OR no transactions in 7+ days
   - Warning: 15-30% drop

2. **Credit Limit Alert** - Credit balance > 80% of limit
   - Severity: Warning

3. **Inactive Customer Alert** - No transactions in 14+ days
   - Severity: Critical

4. **Product Disabled Alert** - Customer has <2 products enabled
   - Severity: Info

5. **Growth Opportunity Alert** - Sales growth >10%
   - Severity: Info

---

## 📊 Analytics APIs

### GET /api/analytics
Get analytics data with filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `dateRange` (required): `7d`, `30d`, `90d`, `12m`
- `product` (optional): `all`, `1`, `2`, `3`, `4`, `5` (product IDs)
- `customerType` (optional): `all`, `b2b`, `d2c`
- `iso` (optional): `all`, `ISO-10`, `ISO-12`, etc.

**Response (200):**
```json
{
  "kpis": {
    "totalRevenue": {
      "value": 1250000,
      "change": 13.6,
      "previous": 1100000
    },
    "totalTransactions": {
      "value": 12450,
      "change": 11.2,
      "previous": 11200
    },
    "avgTicket": {
      "value": 100.40,
      "change": 2.2,
      "previous": 98.23
    },
    "totalCommission": {
      "value": 28800,
      "change": 13.6,
      "previous": 25344
    }
  },
  "revenueTrend": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "data": [280000, 310000, 330000, 330000]
  },
  "transactionsTrend": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "data": [2800, 3100, 3300, 3250]
  },
  "productMix": {
    "labels": ["Airtime", "Bill Payment", "Gift Cards", "Crypto", "Money Transfer"],
    "data": [450000, 320000, 250000, 150000, 80000]
  },
  "topCustomers": {
    "labels": ["City Center", "Downtown Store", "Metro Gas", "Quick Mart", "Corner 24/7"],
    "data": [242500, 185400, 156200, 98200, 18500]
  },
  "comparison": {
    "revenue": { current: 1250000, previous: 1100000, change: 13.6 },
    "transactions": { current: 12450, previous: 11200, change: 11.2 },
    "avgTicket": { current: 100.40, previous: 98.23, change: 2.2 },
    "newCustomers": { current: 15, previous: 12, change: 25.0 },
    "activeCustomers": { current: 287, previous: 275, change: 4.4 },
    "churnRate": { current: 2.1, previous: 3.2, change: -34.4 }
  }
}
```

---

## 📑 Reports APIs

### GET /api/reports/list
Get available reports.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "reports": [
    {
      "id": 1,
      "name": "Vendor Report",
      "description": "Comprehensive vendor performance analysis",
      "category": "Operations"
    },
    {
      "id": 2,
      "name": "B2B Sales Report",
      "description": "B2B customer sales analysis",
      "category": "Sales"
    }
    /* ... 11 more reports ... */
  ]
}
```

---

### GET /api/reports/:reportId
Get report data.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `dateRange` (optional): `7d`, `30d`, `90d` (default: `30d`)
- `search` (optional): Search filter
- `sortBy` (optional): Sort column
- `sortOrder` (optional): `asc`, `desc`

**Response (200) - Example for Vendor Report:**
```json
{
  "reportId": 1,
  "reportName": "Vendor Report",
  "generatedAt": "2026-02-08T12:00:00Z",
  "dateRange": "30d",
  "summary": {
    "totalVendors": 15,
    "totalVolume": 2830492,
    "totalTransactions": 15680,
    "avgTicket": 180.47
  },
  "data": [
    {
      "vendor": "Simple Mobile",
      "volume": 492428,
      "transactions": 2680,
      "avgTicket": 183.74,
      "successRate": 98.5,
      "trend": "+12.3%"
    },
    {
      "vendor": "AT&T",
      "volume": 399980,
      "transactions": 2190,
      "avgTicket": 182.64,
      "successRate": 99.1,
      "trend": "+8.7%"
    }
    /* ... more rows ... */
  ]
}
```

---

## 📦 Data Models

### User/Employee
```typescript
{
  id: number;
  name: string;
  email: string;
  username: string;
  password: string; // Hashed on backend
  phone: string;
  department: 'Management' | 'Sales' | 'Support' | 'Finance' | 'IT' | 'Marketing';
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'suspended' | 'inactive';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Customer
```typescript
{
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  storeId: string;
  isoId: string;
  subIsoId: string;
  status: 'active' | 'at-risk' | 'inactive';
  riskLevel: 'low' | 'medium' | 'high';
  products: number[]; // Product IDs
  salesLast7Days: number;
  salesLast30Days: number;
  salesTrend: string; // e.g., "+12%", "-8%", "New"
  lastTransaction: string | null; // Date YYYY-MM-DD
  assignedEmployee: number;
  creditLimit: number;
  creditBalance: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task
```typescript
{
  id: number;
  customerId: number;
  customerName: string;
  taskType: 'call' | 'visit' | 'email' | 'support';
  priority: 'normal' | 'high' | 'urgent';
  title: string;
  description: string;
  assignedTo: number;
  assignedToName: string;
  dueDate: string; // YYYY-MM-DD
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt: string | null;
}
```

### Alert
```typescript
{
  id: number;
  type: 'sales_drop' | 'credit_limit' | 'inactive_customer' | 'product_disabled' | 'growth_opportunity';
  severity: 'critical' | 'warning' | 'info';
  customerId: number;
  customerName: string;
  title: string;
  message: string;
  actionRequired: string;
  createdAt: string;
}
```

### Product
```typescript
{
  id: number;
  name: string;
  category: string;
  enabled: boolean;
  commission: number; // Percentage
  customerCount: number; // How many customers use this
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": { /* optional additional info */ }
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Common Error Codes
```
AUTH_001 - Invalid credentials
AUTH_002 - Token expired
AUTH_003 - Insufficient permissions
VALID_001 - Validation error
VALID_002 - Missing required field
BIZ_001 - Business rule violation
BIZ_002 - Resource not found
BIZ_003 - Duplicate resource
RATE_001 - Rate limit exceeded
```

---

## 🚦 Rate Limiting

**Limits:**
- Authentication: 5 requests per minute per IP
- Dashboard: 60 requests per minute per user
- CRM Operations: 30 requests per minute per user
- Reports: 10 requests per minute per user

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1612345678
```

---

## 🔄 Auto-Refresh Strategy

**Frontend Auto-Refresh Intervals:**
- Dashboard KPIs: Every 5 minutes
- CRM Customers: Every 15 minutes
- Tasks: Every 10 minutes
- Smart Alerts: Every 5 minutes
- Analytics: Every 30 minutes

**Implementation:**
```javascript
// Frontend calls these endpoints automatically
setInterval(() => api.get('/api/dashboard'), 5 * 60 * 1000);
setInterval(() => api.get('/api/customers'), 15 * 60 * 1000);
setInterval(() => api.get('/api/tasks'), 10 * 60 * 1000);
setInterval(() => api.get('/api/alerts'), 5 * 60 * 1000);
```

---

## 📝 Notes for Backend Developer

1. **All endpoints require JWT authentication** (except `/api/auth/login`)
2. **Hash passwords** using bcrypt or argon2
3. **Generate smart alerts** based on business rules (see Alert section)
4. **Auto-populate customer fields**:
   - `creditLimit`: Default $50,000
   - `creditBalance`: Default $0
   - `products`: Default [1] (Airtime)
   - `status`: Default "active"
   - `riskLevel`: Default "low"

5. **Date formats**: Use ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
6. **Currency**: All amounts in cents (e.g., $100.50 = 10050)
7. **Pagination**: Use `page` and `limit` query params for large datasets
8. **CORS**: Allow frontend domain
9. **Logging**: Log all API calls for audit trail

---

**API Version:** 1.0.0  
**Last Updated:** February 8, 2026  
**Contact:** developer@cellpay.net
