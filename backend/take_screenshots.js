import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/home/alpha/.gemini/antigravity-ide/brain/c2fd95a5-d0ba-44a2-bdb5-a571ae077366';
const PORT = 9222;

async function apiRequest(endpoint, {
  method = 'GET',
  headers = {},
  body = null,
  cookies = []
} = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `http://localhost:5000/api${endpoint}`);
    const reqHeaders = { ...headers };
    if (cookies.length > 0) reqHeaders['Cookie'] = cookies.join('; ');
    let payload = null;
    if (body) {
      payload = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request({
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function getCookieValue(setCookieHeaders, cookieName) {
  for (const cookieStr of setCookieHeaders || []) {
    const parts = cookieStr.split(';')[0].split('=');
    if (parts[0].trim() === cookieName) {
      return parts[1] ? parts[1].trim() : '';
    }
  }
  return null;
}

async function loginUser(email, password) {
  const csrfRes = await apiRequest('/auth/csrf-token');
  const xsrfCookie = getCookieValue(csrfRes.headers['set-cookie'], 'XSRF-TOKEN') || csrfRes.data?.csrfToken;
  const loginRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    cookies: [`XSRF-TOKEN=${xsrfCookie}`],
    headers: {
      'x-xsrf-token': xsrfCookie,
      'Origin': 'http://localhost:5173'
    }
  });
  const authCookie = getCookieValue(loginRes.headers['set-cookie'], 'civicwatch_auth');
  const user = loginRes.data?.user;
  return { authCookie, xsrfCookie, user };
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.pending.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const admin = await loginUser('admin@civicwatch.ke', 'Password123!');
  const citizen = await loginUser('victor@example.com', 'Password123!');

  const chromeProcess = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1366,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const targetsRes = await fetch(`http://localhost:${PORT}/json/list`).then(r => r.json());
    const pageTarget = targetsRes.find(t => t.type === 'page');
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Network.enable');
    await client.send('Runtime.enable');

    // 1. Screenshot Public Sources Directory
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.setCookie', {
      name: 'civicwatch_auth',
      value: citizen.authCookie,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
    await client.send('Network.setCookie', {
      name: 'XSRF-TOKEN',
      value: citizen.xsrfCookie,
      domain: 'localhost',
      path: '/'
    });

    await client.send('Page.navigate', { url: 'http://localhost:5173/sources' });
    await new Promise(r => setTimeout(r, 3000));
    const sourcesScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const sourcesPath = path.join(ARTIFACT_DIR, 'm14_public_sources_directory.png');
    fs.writeFileSync(sourcesPath, Buffer.from(sourcesScreenshot.data, 'base64'));
    console.log(`  ✓ Saved public sources directory screenshot to: ${sourcesPath}`);

    // 2. Screenshot Admin Verification & Trust Dashboard
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.setCookie', {
      name: 'civicwatch_auth',
      value: admin.authCookie,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
    await client.send('Network.setCookie', {
      name: 'XSRF-TOKEN',
      value: admin.xsrfCookie,
      domain: 'localhost',
      path: '/'
    });

    await client.send('Page.navigate', { url: 'http://localhost:5173/admin/verification' });
    await new Promise(r => setTimeout(r, 3000));
    const adminScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const adminPath = path.join(ARTIFACT_DIR, 'm14_admin_verification_dashboard.png');
    fs.writeFileSync(adminPath, Buffer.from(adminScreenshot.data, 'base64'));
    console.log(`  ✓ Saved admin verification dashboard screenshot to: ${adminPath}`);

    // 3. Screenshot Alert Detail with Provenance Modal
    await client.send('Page.navigate', { url: 'http://localhost:5173/alerts/1' });
    await new Promise(r => setTimeout(r, 3000));

    // Click Trust & Provenance button to open modal
    await client.send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Trust & Provenance') || b.textContent.includes('Trust & Provenance'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const modalScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const modalPath = path.join(ARTIFACT_DIR, 'm14_alert_provenance_modal.png');
    fs.writeFileSync(modalPath, Buffer.from(modalScreenshot.data, 'base64'));
    console.log(`  ✓ Saved alert provenance modal screenshot to: ${modalPath}`);

    // 4. Screenshot Admin User & Role Management Directory
    await client.send('Page.navigate', { url: 'http://localhost:5173/admin/users' });
    await new Promise(r => setTimeout(r, 3000));
    const usersScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const usersPath = path.join(ARTIFACT_DIR, 'm14_admin_users_directory.png');
    fs.writeFileSync(usersPath, Buffer.from(usersScreenshot.data, 'base64'));
    console.log(`  ✓ Saved admin users directory screenshot to: ${usersPath}`);

    // 5. Open and screenshot User Dossier Modal
    await client.send('Runtime.evaluate', {
      expression: `
        const eyeBtn = document.querySelector('button[title="View User Dossier & History"]');
        if (eyeBtn) eyeBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1500));
    const dossierScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const dossierPath = path.join(ARTIFACT_DIR, 'm14_admin_user_dossier_modal.png');
    fs.writeFileSync(dossierPath, Buffer.from(dossierScreenshot.data, 'base64'));
    console.log(`  ✓ Saved user dossier modal screenshot to: ${dossierPath}`);

    client.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
