import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))

app.get('/logout', (c) => {
  return c.html(`<!DOCTYPE html>
<html>
<head>
    <title>Logging out...</title>
</head>
<body>
    <h1>Logging out...</h1>
    <script>
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    </script>
</body>
</html>`)
})

app.get('/login', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CellPay</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/config.js"></script>
</head>
<body class="h-full">
    <div class="min-h-full flex items-center justify-center py-12 px-4">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h1 class="text-4xl font-bold text-gray-900">
                    <i class="fas fa-bolt text-yellow-500"></i> CellPay
                </h1>
                <p class="mt-2 text-sm text-gray-600">Modern Analytics Portal</p>
            </div>
            <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div id="error-message" class="hidden mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <span></span>
                </div>
                <form id="loginForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input id="username" type="text" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="admin">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" type="password" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        <span id="login-text">Sign in</span>
                        <span id="login-spinner" class="hidden"><i class="fas fa-spinner fa-spin"></i> Signing in...</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/api.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            const loginText = document.getElementById('login-text');
            const loginSpinner = document.getElementById('login-spinner');
            
            errorDiv.classList.add('hidden');
            loginText.classList.add('hidden');
            loginSpinner.classList.remove('hidden');
            
            // Use the login function from api.js
            const result = await window.authAPI.login(username, password);
            
            if (result.success) {
                window.location.href = '/';
            } else {
                errorDiv.querySelector('span').textContent = result.error;
                errorDiv.classList.remove('hidden');
                loginText.classList.remove('hidden');
                loginSpinner.classList.add('hidden');
            }
        });
    </script>
</body>
</html>`)
})

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en" class="h-full bg-gray-50">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CellPay Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="/static/config.js"></script>
    <style>
      * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
      .kpi-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      @media (max-width: 768px) {
        #sidebar { transform: translateX(-100%); position: fixed; height: 100%; z-index: 50; transition: transform 0.3s ease; }
        #menu-toggle:checked ~ #app #sidebar { transform: translateX(0); }
        #menu-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        #menu-toggle:checked ~ #app #menu-overlay { display: block; }
      }
    </style>
</head>
<body class="h-full">
    <input type="checkbox" id="menu-toggle" class="hidden">
    <div id="app" class="h-full flex">
        <div id="sidebar" class="w-64 bg-gray-900 text-white flex flex-col">
            <div class="p-6 border-b border-gray-800">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h1 class="text-2xl font-bold"><i class="fas fa-bolt text-yellow-400"></i> CellPay</h1>
                        <p class="text-xs text-gray-400 mt-1">Analytics Portal</p>
                    </div>
                    <label for="menu-toggle" class="md:hidden text-white text-xl cursor-pointer"><i class="fas fa-times"></i></label>
                </div>
                <button onclick="window.navigateTo('notifications')" class="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                    <span class="text-sm"><i class="fas fa-bell mr-2"></i>Notifications</span>
                    <span id="notification-badge" class="hidden px-2 py-1 text-xs bg-red-500 text-white rounded-full">0</span>
                </button>
            </div>
            <nav class="flex-1 p-4 space-y-1" id="sidebar-nav">
                <a href="#" class="sidebar-link active flex items-center px-4 py-3 rounded-lg" data-page="dashboard">
                    <i class="fas fa-home w-5"></i><span class="ml-3">Dashboard</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="analytics">
                    <i class="fas fa-chart-line w-5"></i><span class="ml-3">Analytics</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="employees">
                    <i class="fas fa-user-tie w-5"></i><span class="ml-3">Employees</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="crm">
                    <i class="fas fa-users w-5"></i><span class="ml-3">CRM</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="tasks">
                    <i class="fas fa-tasks w-5"></i><span class="ml-3">Tasks</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="tickets">
                    <i class="fas fa-ticket-alt w-5"></i><span class="ml-3">Tickets</span>
                </a>
                <a href="#" class="sidebar-link flex items-center px-4 py-3 rounded-lg" data-page="ai-reports">
                    <i class="fas fa-chart-bar w-5"></i><span class="ml-3">Reports</span>
                </a>
            </nav>
            <div class="p-4 border-t border-gray-800">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-medium" id="user-name">Loading...</p>
                        <p class="text-xs text-gray-400" id="user-role">...</p>
                    </div>
                    <button id="logout-btn-sidebar" class="ml-2 text-gray-400 hover:text-white" title="Logout">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </div>
        <label for="menu-toggle" id="menu-overlay"></label>
        <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div class="md:hidden flex items-center justify-between mb-4">
                <label for="menu-toggle" class="inline-flex items-center px-3 py-2 bg-gray-900 text-white rounded-lg cursor-pointer">
                    <i class="fas fa-bars mr-2"></i> Menu
                </label>
                <button id="logout-btn-top" class="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg">
                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </button>
            </div>
            <div class="max-w-7xl mx-auto" id="main-content"></div>
        </div>
    </div>
    
    <!-- Floating AI Assistant Button (Mobile & Desktop) -->
    <button id="ai-assistant-toggle" 
      class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 flex items-center justify-center"
      onclick="toggleAIAssistant()">
      <i class="fas fa-robot text-2xl"></i>
    </button>
    
    <!-- AI Assistant Chat Panel (Mobile & Desktop) -->
    <div id="ai-assistant-panel" 
      class="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl hidden flex-col z-50 overflow-hidden"
      style="max-width: calc(100vw - 3rem);">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i class="fas fa-robot text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg">AI Assistant</h3>
            <p class="text-xs text-white/80">Ask me anything!</p>
          </div>
        </div>
        <button onclick="toggleAIAssistant()" class="text-white hover:bg-white/20 rounded-lg p-2">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div id="ai-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <div class="flex items-start space-x-2">
          <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-robot text-white text-sm"></i>
          </div>
          <div class="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
            <p class="text-sm text-gray-800">Hello! I'm your AI Business Assistant. I can help you with:</p>
            <ul class="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Sales trends and analytics</li>
              <li>• Customer insights</li>
              <li>• Report generation</li>
              <li>• Business metrics</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="border-t p-4 bg-white">
        <div class="flex space-x-2">
          <input type="text" id="ai-chat-input" 
            placeholder="Ask me anything..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onkeypress="if(event.key==='Enter') sendAIMessage()">
          <button onclick="sendAIMessage()" 
            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
    
    <script src="/static/api.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app
