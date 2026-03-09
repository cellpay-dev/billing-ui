# Configuration Management

This application uses a centralized configuration system for managing environment-specific settings.

## Files

- **`public/static/config.js`** - Main configuration file containing all configurable parameters
- **`public/static/api.js`** - API module that reads configuration from config.js

## Configuration Structure

### API Configuration (`AppConfig.api`)
- `backendUrl` - Backend API base URL
- `timeout` - Request timeout in milliseconds
- `maxRetries` - Maximum retry attempts for failed requests
- `retryDelay` - Delay between retries in milliseconds

### Authentication Configuration (`AppConfig.auth`)
- `tokenKey` - LocalStorage key for authentication token
- `userKey` - LocalStorage key for user data
- `sessionTimeout` - Session timeout in minutes

### Application Settings (`AppConfig.app`)
- `name` - Application name
- `version` - Application version
- `debug` - Enable/disable debug mode
- `dashboardRefreshInterval` - Auto-refresh interval for dashboard
- `dateFormat` - Default date format
- `currencySymbol` - Currency symbol for display
- `currencyLocale` - Locale for currency formatting

### Feature Flags (`AppConfig.features`)
- Enable/disable specific features like AI Assistant, Notifications, Export, Print

### UI Configuration (`AppConfig.ui`)
- `itemsPerPage` - Pagination settings
- `chartColors` - Color palette for charts
- `toastDuration` - Notification display duration

## Environment-Specific Configuration

### Development
```javascript
if (window.location.hostname === 'localhost') {
  window.AppConfig.api.backendUrl = 'http://localhost:8080/api';
  window.AppConfig.app.debug = true;
}
```

### Staging/UAT
```javascript
if (window.location.hostname === 'uat.cellpay.com') {
  window.AppConfig.api.backendUrl = 'https://uat.cellpaybackend.us:8443/reports/api';
  window.AppConfig.app.debug = true;
}
```

### Production
```javascript
if (window.location.hostname === 'cellpay.com') {
  window.AppConfig.api.backendUrl = 'https://api.cellpay.com';
  window.AppConfig.app.debug = false;
}
```

## Usage

### Accessing Configuration
```javascript
// Get backend URL
const backendUrl = window.AppConfig.api.backendUrl;

// Get token storage key
const tokenKey = window.AppConfig.auth.tokenKey;

// Check if debug mode is enabled
if (window.AppConfig.app.debug) {
  console.log('Debug mode enabled');
}
```

### Loading Order
Configuration files must be loaded in this order in HTML:
1. `config.js` - First (contains all configuration)
2. `api.js` - Second (uses configuration)
3. `app.js` - Third (main application logic)

Example:
```html
<script src="/static/config.js"></script>
<script src="/static/api.js"></script>
<script src="/static/app.js"></script>
```

## Best Practices

1. **Never commit sensitive data** (API keys, passwords) in config.js
2. **Use environment detection** to automatically switch configurations
3. **Keep default values** as fallbacks: `window.AppConfig?.api?.backendUrl || 'default-url'`
4. **Test configuration** changes in all environments before deploying
5. **Document changes** to configuration structure in this README

## Adding New Configuration

To add a new configuration parameter:

1. Add it to `config.js` in the appropriate section
2. Document it in this README
3. Update `api.js` or other modules to use the new parameter
4. Test in all environments

Example:
```javascript
// In config.js
window.AppConfig = {
  api: {
    backendUrl: '...',
    newParameter: 'value'  // Add new parameter
  }
};

// In api.js or app.js
const newValue = window.AppConfig?.api?.newParameter || 'defaultValue';
```

## Troubleshooting

### Configuration not loading
- Check that `config.js` is loaded before other scripts
- Verify the path to `config.js` is correct
- Check browser console for errors

### Wrong environment configuration
- Verify `window.location.hostname` matches your environment detection logic
- Check that environment-specific overrides are uncommented
- Clear browser cache and reload

### API calls failing
- Verify `AppConfig.api.backendUrl` points to the correct backend
- Check network tab in browser dev tools
- Ensure backend CORS settings allow requests from your frontend domain
