# Deploying to Tomcat at /billing-analytics

This app can be deployed as a static webapp on Apache Tomcat at the context path **/billing-analytics** (alongside other webapps on the same server).

## Build for Tomcat

From the project root:

```bash
npm run build:tomcat
```

This will:

1. Start the Vite dev server temporarily.
2. Fetch the HTML for `/`, `/login`, and `/logout`.
3. Inject the base path `/billing-analytics` and write `index.html`, `login.html`, and `logout.html` to **dist-tomcat/**.
4. Copy **public/static/** to **dist-tomcat/static/**.

Output layout:

```
dist-tomcat/
  index.html      # Main app (dashboard, reports, etc.)
  login.html      # Login page
  logout.html     # Logout redirect
  static/
    api.js
    app.js
    config.js
    style.css
```

## Deploy on Tomcat

1. **As a directory**
   - Copy the entire **dist-tomcat** folder into Tomcat’s **webapps** directory.
   - Rename it to **billing-analytics** (the folder name is the context path).
   - Example: `cp -r dist-tomcat /path/to/tomcat/webapps/billing-analytics`
   - Or on Windows: `xcopy /E /I dist-tomcat C:\path\to\tomcat\webapps\billing-analytics`

2. **As a WAR (optional)**
   - From **dist-tomcat**, create a ZIP that contains `index.html`, `login.html`, `logout.html`, and the `static/` folder at the root of the archive.
   - Rename the ZIP to **billing-analytics.war** and drop it into **webapps**. Tomcat will expand it and use **billing-analytics** as the context path.

## URL mapping

- **Root:** `http://host:8080/billing-analytics/` → serves `index.html` (default document).
- **Login:** `http://host:8080/billing-analytics/login.html`
- **Logout:** `http://host:8080/billing-analytics/logout.html`

Redirects after login/logout and 401 handling use `window.APP_BASE` (set to `/billing-analytics` in the built HTML), so they work correctly under this context path.

## Configuration

- **Backend API:** Edit **public/static/config.js** (or the copy in **dist-tomcat/static/config.js** after build) to set `AppConfig.api.backendUrl` for your environment.
- **Base path:** The build script uses `/billing-analytics` by default. To change it, edit **scripts/build-tomcat.mjs** and set the `BASE_PATH` constant, then re-run `npm run build:tomcat`.

## Running locally at root (Node/Vite)

With `npm run dev`, the app runs at the server root (`/`). `window.APP_BASE` is not set, so redirects use `/` and `/login` as before. No changes are required for local development.
