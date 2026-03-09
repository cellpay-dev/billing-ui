# CellPay Portal - Developer Handoff Guide

## 🎯 Project Overview

**CellPay Portal** is a complete business management platform for B2B and D2C payment processing, featuring:
- Real-time dashboard with charts and KPIs
- Employee management with RBAC
- CRM system for B2B customers
- Task management and smart alerts
- Advanced analytics with filters
- 13 operational reports
- Mobile-responsive design

**Status:** ✅ Frontend 100% complete, ready for API integration

---

## 📦 What You're Receiving

### **Files Structure:**
```
webapp/
├── src/
│   └── index.tsx                 # Hono backend entry point
├── public/
│   └── static/
│       ├── app.js               # 6300+ lines of frontend logic
│       └── style.css            # Custom theme & animations
├── wrangler.jsonc               # Cloudflare configuration
├── package.json                 # Dependencies
├── ecosystem.config.cjs         # PM2 configuration (dev only)
├── README.md                    # Project documentation
├── API_SPECIFICATION.md         # Complete API specs (THIS FILE'S SIBLING)
├── API_INTEGRATION_GUIDE.md     # Integration examples
└── DEVELOPER_GUIDE.md           # This file
```

### **Documentation:**
1. **API_SPECIFICATION.md** - Complete API reference (all endpoints, data models, errors)
2. **API_INTEGRATION_GUIDE.md** - Integration examples and data pull strategy
3. **DEVELOPER_GUIDE.md** - This file (setup, deployment, testing)
4. **README.md** - User-facing documentation

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 18+ and npm
- Cloudflare account
- Basic knowledge of Hono framework
- Git

### **Setup (5 minutes):**

```bash
# 1. Clone/extract project
cd webapp/

# 2. Install dependencies
npm install

# 3. Create environment files
cp .env.example .dev.vars

# 4. Edit .dev.vars with your settings
ENVIRONMENT=development
DATABASE_URL=your_database_connection
JWT_SECRET=your-secret-key-here

# 5. Build frontend
npm run build

# 6. Start development server
npm run dev

# 7. Open browser
http://localhost:8788
```

---

## 🔌 API Integration Steps

### **Step 1: Understand Current State**

**Frontend is 100% functional with dummy data:**
- All UI components render perfectly
- All interactions work (clicks, forms, navigation)
- Charts render (but need real data to show)
- Dummy data shows expected structure

**Your job:**
Replace dummy data functions with real API calls.

---

### **Step 2: Key Files to Modify**

#### **Backend: `src/index.tsx`**
Currently has basic routes. Add these endpoints:

```typescript
// Authentication
app.post('/api/auth/login', async (c) => {
  // Your login logic
  // See API_SPECIFICATION.md for request/response format
});

// Dashboard
app.get('/api/dashboard', async (c) => {
  // Fetch from your database
  // Return format in API_SPECIFICATION.md
});

// Employees
app.get('/api/employees', async (c) => { /* ... */ });
app.post('/api/employees', async (c) => { /* ... */ });

// CRM Customers
app.get('/api/customers', async (c) => { /* ... */ });
app.post('/api/customers', async (c) => { /* ... */ });

// Tasks
app.get('/api/tasks', async (c) => { /* ... */ });
app.post('/api/tasks', async (c) => { /* ... */ });

// Analytics
app.get('/api/analytics', async (c) => { /* ... */ });

// Reports (13 endpoints)
app.get('/api/reports/:reportId', async (c) => { /* ... */ });
```

#### **Frontend: `public/static/app.js`**
Find these functions and replace dummy data with API calls:

```javascript
// Line ~828
async function loadDashboardData() {
  // REPLACE THIS:
  const dashboardData = { /* dummy data */ };
  
  // WITH THIS:
  const response = await api.get('/api/dashboard');
  const dashboardData = response.data;
}

// Similar changes for:
// - loadEmployees() - Line ~1457
// - loadCRM() - Line ~1726
// - loadAnalyticsData() - Analytics section
// - Each report's load function
```

**Search for:** `// DUMMY DATA` comments - these mark all places to replace.

---

### **Step 3: Database Schema**

**Recommended Tables:**

```sql
-- Users/Employees
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  role TEXT CHECK(role IN ('admin', 'manager', 'employee')),
  status TEXT CHECK(status IN ('active', 'suspended', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- B2B Customers
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  store_id TEXT UNIQUE,
  iso_id TEXT,
  sub_iso_id TEXT,
  status TEXT DEFAULT 'active',
  risk_level TEXT DEFAULT 'low',
  credit_limit INTEGER DEFAULT 50000,
  credit_balance INTEGER DEFAULT 0,
  assigned_employee INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (assigned_employee) REFERENCES employees(id)
);

-- Customer Products (Many-to-Many)
CREATE TABLE customer_products (
  customer_id INTEGER,
  product_id INTEGER,
  enabled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, product_id)
);

-- Products
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  commission REAL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  task_type TEXT,
  priority TEXT,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to INTEGER,
  due_date DATE,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- Transactions (for reporting)
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount INTEGER,
  product_id INTEGER,
  carrier TEXT,
  payment_method TEXT,
  status TEXT,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Alerts (generated by backend)
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY,
  type TEXT,
  severity TEXT,
  customer_id INTEGER,
  title TEXT,
  message TEXT,
  action_required TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

---

### **Step 4: Authentication Implementation**

**Use JWT tokens:**

```typescript
import { sign, verify } from 'hono/jwt';

// Login endpoint
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json();
  
  // 1. Query employee from database
  const employee = await db.query(
    'SELECT * FROM employees WHERE username = ?',
    [username]
  );
  
  if (!employee) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  // 2. Verify password (use bcrypt)
  const valid = await bcrypt.compare(password, employee.password_hash);
  
  if (!valid) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  // 3. Generate JWT token
  const token = await sign(
    {
      id: employee.id,
      username: employee.username,
      role: employee.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8) // 8 hours
    },
    c.env.JWT_SECRET
  );
  
  // 4. Return user data + token
  return c.json({
    success: true,
    user: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department
    },
    token: token
  });
});

// Protected route middleware
const auth = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Use middleware
app.get('/api/dashboard', auth, async (c) => {
  const user = c.get('user');
  // ... fetch dashboard data
});
```

---

### **Step 5: Smart Alert Generation**

**Backend should auto-generate alerts based on business rules:**

```typescript
// Run this periodically (cron job or scheduled worker)
async function generateSmartAlerts() {
  const customers = await db.query('SELECT * FROM customers WHERE status = "active"');
  
  for (const customer of customers) {
    // Rule 1: Sales Drop Alert
    const sales30Days = await getCustomerSales(customer.id, 30);
    const salesPrevious30 = await getCustomerSales(customer.id, 60, 30);
    const dropPercent = ((sales30Days - salesPrevious30) / salesPrevious30) * 100;
    
    if (dropPercent < -15) {
      const severity = dropPercent < -30 ? 'critical' : 'warning';
      await createAlert({
        type: 'sales_drop',
        severity: severity,
        customerId: customer.id,
        title: `Sales dropped ${Math.abs(dropPercent).toFixed(1)}%`,
        message: `Sales: $${sales30Days} vs previous $${salesPrevious30}`,
        actionRequired: severity === 'critical' ? 'Immediate call required' : 'Follow up recommended'
      });
    }
    
    // Rule 2: Inactive Customer Alert
    const lastTransaction = await getLastTransaction(customer.id);
    const daysSinceLastTx = daysBetween(lastTransaction, new Date());
    
    if (daysSinceLastTx > 14) {
      await createAlert({
        type: 'inactive_customer',
        severity: 'critical',
        customerId: customer.id,
        title: `No transactions for ${daysSinceLastTx} days`,
        message: `Last transaction: ${lastTransaction}`,
        actionRequired: 'Urgent outreach needed'
      });
    }
    
    // Rule 3: Credit Limit Alert
    const creditUsage = (customer.credit_balance / customer.credit_limit) * 100;
    
    if (creditUsage > 80) {
      await createAlert({
        type: 'credit_limit',
        severity: 'warning',
        customerId: customer.id,
        title: 'Credit limit at ${creditUsage}%',
        message: `Balance: $${customer.credit_balance} of $${customer.credit_limit}`,
        actionRequired: 'Review credit terms'
      });
    }
    
    // Add more rules...
  }
}
```

---

### **Step 6: Testing Checklist**

**Test each feature systematically:**

- [ ] **Authentication**
  - [ ] Login with valid credentials
  - [ ] Login with invalid credentials
  - [ ] Token expiration handling
  - [ ] Logout

- [ ] **Dashboard**
  - [ ] All 4 KPI cards show real numbers
  - [ ] All 4 charts render with data
  - [ ] Date filter changes data
  - [ ] Sales drop alerts appear
  - [ ] Auto-refresh every 5 minutes

- [ ] **Employee Management**
  - [ ] List all employees
  - [ ] Add new employee
  - [ ] Edit employee
  - [ ] Delete employee
  - [ ] Reset password
  - [ ] Suspend/activate employee
  - [ ] Credentials modal shows
  - [ ] RBAC permissions work

- [ ] **CRM - B2B Customers**
  - [ ] List all customers
  - [ ] Add new customer (backend auto-populates fields)
  - [ ] Edit customer
  - [ ] View customer details
  - [ ] Products assigned correctly
  - [ ] Sales figures accurate
  - [ ] Status badges correct

- [ ] **CRM - Tasks**
  - [ ] Create task
  - [ ] Complete task
  - [ ] Filter by status
  - [ ] Assign to employee
  - [ ] Due date tracking

- [ ] **CRM - Alerts**
  - [ ] Alerts auto-generated by backend
  - [ ] Severity badges correct
  - [ ] Create task from alert
  - [ ] Filter by severity

- [ ] **Analytics**
  - [ ] Filters work (date, product, customer type, ISO)
  - [ ] 4 charts render
  - [ ] KPI comparison table shows
  - [ ] CSV export works
  - [ ] PDF export works

- [ ] **Reports (All 13)**
  - [ ] Each report loads data
  - [ ] Search/filter works
  - [ ] Sort works
  - [ ] CSV export works
  - [ ] Data accurate

- [ ] **Mobile**
  - [ ] All pages responsive
  - [ ] Tables work on mobile
  - [ ] Forms usable
  - [ ] Charts render
  - [ ] AI chat visible on mobile

---

## 🚀 Deployment to Cloudflare Pages

### **Prerequisites:**
1. Cloudflare account
2. Cloudflare API token
3. D1 database created (if using)

### **Step 1: Create D1 Database (Optional)**
```bash
npx wrangler d1 create cellpay-production
# Copy database_id to wrangler.jsonc
```

### **Step 2: Update wrangler.jsonc**
```jsonc
{
  "name": "cellpay-portal",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "cellpay-production",
      "database_id": "your-database-id-here"
    }
  ]
}
```

### **Step 3: Run Migrations**
```bash
# Create migrations directory
mkdir migrations

# Create initial schema
cat > migrations/0001_initial_schema.sql << 'EOF'
-- Add your CREATE TABLE statements here
EOF

# Apply migrations
npx wrangler d1 migrations apply cellpay-production
```

### **Step 4: Deploy**
```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name cellpay-portal

# You'll get URLs:
# Production: https://cellpay-portal.pages.dev
# Branch: https://main.cellpay-portal.pages.dev
```

### **Step 5: Set Secrets**
```bash
# Add JWT secret
npx wrangler pages secret put JWT_SECRET --project-name cellpay-portal

# Add any other secrets
npx wrangler pages secret put DATABASE_URL --project-name cellpay-portal
```

---

## 🐛 Common Issues & Solutions

### **Issue: Charts Not Showing**
**Cause:** API not returning data in correct format  
**Solution:** Check API response matches format in `API_SPECIFICATION.md`

### **Issue: CORS Errors**
**Cause:** Backend not allowing frontend domain  
**Solution:** Add CORS middleware in `src/index.tsx`:
```typescript
import { cors } from 'hono/cors';
app.use('/api/*', cors({
  origin: ['https://your-domain.pages.dev'],
  credentials: true
}));
```

### **Issue: 401 Unauthorized**
**Cause:** JWT token missing or expired  
**Solution:** Check token is saved in `localStorage` and included in requests

### **Issue: Slow Performance**
**Cause:** No database indexes  
**Solution:** Add indexes on frequently queried columns:
```sql
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status);
```

---

## 📊 Performance Optimization Tips

1. **Database Queries:**
   - Use indexes on foreign keys
   - Limit result sets (pagination)
   - Cache frequently accessed data

2. **API Responses:**
   - Gzip compression (Cloudflare does this)
   - Only return needed fields
   - Use CDN for static assets

3. **Frontend:**
   - Already optimized with code splitting
   - Charts use Canvas (fast)
   - CSS animations use GPU acceleration

---

## 🔒 Security Checklist

- [ ] All passwords hashed with bcrypt/argon2
- [ ] JWT tokens with expiration
- [ ] HTTPS only in production
- [ ] CORS configured properly
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] Rate limiting on auth endpoints
- [ ] Secrets in environment variables (not code)
- [ ] RBAC enforced on backend
- [ ] Audit logging for sensitive actions

---

## 📞 Support & Questions

**Documentation:**
- API Spec: `API_SPECIFICATION.md`
- Integration Guide: `API_INTEGRATION_GUIDE.md`
- This Guide: `DEVELOPER_GUIDE.md`

**Frontend Code Locations:**
- Dashboard: Line ~593 in `app.js`
- Employee Management: Line ~1457
- CRM: Line ~1726
- Analytics: Line ~1169
- Reports: Line ~1095

**Search Tips:**
- Find `// DUMMY DATA` - marks places to replace
- Find `async function load` - data loading functions
- Find `api.get('/api` - API call locations

---

## ✅ Definition of Done

**Backend Complete When:**
- [ ] All API endpoints implemented
- [ ] Database schema created
- [ ] Migrations run
- [ ] Authentication working
- [ ] Smart alerts generating
- [ ] All tests passing

**Integration Complete When:**
- [ ] All dummy data replaced with API calls
- [ ] All charts showing real data
- [ ] All CRUD operations working
- [ ] RBAC functioning
- [ ] Mobile responsive
- [ ] No console errors

**Production Ready When:**
- [ ] Deployed to Cloudflare Pages
- [ ] Custom domain configured
- [ ] Secrets configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 🎯 Timeline Estimate

**For an experienced developer:**
- Backend API Development: 3-5 days
- Frontend Integration: 1-2 days
- Testing & Fixes: 1-2 days
- Deployment & Polish: 1 day

**Total: 6-10 days**

---

## 🚀 You're Ready!

Everything is prepared:
- ✅ Frontend 100% complete
- ✅ UI/UX polished
- ✅ All dummy data in place (shows structure)
- ✅ Clear API specifications
- ✅ Integration guide
- ✅ Database schema provided
- ✅ Deployment instructions
- ✅ Testing checklist

**Next Step:** Read `API_SPECIFICATION.md` and start implementing endpoints!

---

**Good luck! 🚀**  
Contact: developer@cellpay.net
