/**
 * Builds the app for Tomcat deployment at context path /billing-analytics.
 * Starts the Vite dev server, fetches HTML from /, /login, /logout,
 * injects base path, and writes to dist-tomcat/ with static assets.
 */
import { spawn } from 'child_process';
import { mkdir, cp, writeFile, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE_PATH = '/billing-analytics';
const PORT = Number(process.env.PORT) || 5173;
const OUT_DIR = path.join(ROOT, 'dist-tomcat');
const BASE_INJECT = `<base href="${BASE_PATH}/"><script>window.APP_BASE='${BASE_PATH}';</script>`;

function waitForServer(url, maxAttempts = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const go = () => {
      fetch(url, { method: 'GET' }).then(() => resolve()).catch(() => {
        attempts++;
        if (attempts >= maxAttempts) reject(new Error('Server did not start in time'));
        else setTimeout(go, 500);
      });
    };
    go();
  });
}

function processHtml(html) {
  let out = html;
  // Insert base and APP_BASE right after <head>
  out = out.replace(/<head>/i, '<head>\n    ' + BASE_INJECT);
  // Use relative paths for static assets so <base> resolves them
  out = out.replace(/src="\/static\//g, 'src="static/');
  // Redirects: login
  out = out.replace(/window\.location\.href\s*=\s*['"]\/login['"]/g, "window.location.href = (window.APP_BASE||'') + '/login.html'");
  // Redirects: home
  out = out.replace(/window\.location\.href\s*=\s*['"]\/['"]/g, "window.location.href = (window.APP_BASE||'') + '/'");
  // Strip Vite dev client injection (causes "Failed to fetch @vite/client" on Tomcat)
  out = out.replace(/<script>\s*import\s*\(\s*["']\/@vite\/client["']\s*\)\s*<\/script>/gi, '');
  return out;
}

async function main() {
  try {
    await access(path.join(ROOT, 'node_modules'), undefined);
  } catch {
    console.error('Run "npm install" first.');
    process.exit(1);
  }

  console.log('Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: ROOT,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stderr = '';
  devServer.stderr.on('data', (d) => { stderr += d; });

  try {
    await waitForServer(`http://localhost:${PORT}/`);
  } catch (e) {
    devServer.kill();
    console.error('Dev server failed to start. Stderr:', stderr);
    process.exit(1);
  }

  try {
    const [indexRes, loginRes, logoutRes] = await Promise.all([
      fetch(`http://localhost:${PORT}/`),
      fetch(`http://localhost:${PORT}/login`),
      fetch(`http://localhost:${PORT}/logout`)
    ]);

    const indexHtml = processHtml(await indexRes.text());
    const loginHtml = processHtml(await loginRes.text());
    const logoutHtml = processHtml(await logoutRes.text());

    await mkdir(OUT_DIR, { recursive: true });
    await mkdir(path.join(OUT_DIR, 'static'), { recursive: true });

    await Promise.all([
      writeFile(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8'),
      writeFile(path.join(OUT_DIR, 'login.html'), loginHtml, 'utf8'),
      writeFile(path.join(OUT_DIR, 'logout.html'), logoutHtml, 'utf8')
    ]);

    await cp(path.join(ROOT, 'public', 'static'), path.join(OUT_DIR, 'static'), { recursive: true });

    console.log('Tomcat build written to dist-tomcat/');
    console.log('Deploy the dist-tomcat folder as webapp "billing-analytics" (context path /billing-analytics).');
  } finally {
    devServer.kill('SIGTERM');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
