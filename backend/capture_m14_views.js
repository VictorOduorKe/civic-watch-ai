import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/home/alpha/.gemini/antigravity-ide/brain/c2fd95a5-d0ba-44a2-bdb5-a571ae077366';
const PORT = 9228;

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

async function capture() {
  const admin = await loginUser('admin@civicwatch.ke', 'Password123!');

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
    const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json());
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Network.enable');
    await send('Runtime.enable');

    // Set Admin cookies
    await send('Network.setCookie', {
      name: 'civicwatch_auth',
      value: admin.authCookie,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
    await send('Network.setCookie', {
      name: 'XSRF-TOKEN',
      value: admin.xsrfCookie,
      domain: 'localhost',
      path: '/'
    });

    // 1. Capture Admin Verification Page
    await send('Page.navigate', { url: 'http://localhost:5173/admin/verification' });
    await new Promise(r => setTimeout(r, 3500));
    const adminScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    const adminBuf = Buffer.from(adminScreenshot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm14_admin_verification_dashboard.png'), adminBuf);
    console.log('Saved admin verification dashboard screenshot:', adminBuf.length, 'bytes');

    // 2. Capture Alert Detail with Provenance Modal
    await send('Page.navigate', { url: 'http://localhost:5173/alerts/1' });
    await new Promise(r => setTimeout(r, 3500));

    // Open Provenance Modal
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Trust & Provenance') || b.textContent.includes('Trust & Provenance'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const modalScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    const modalBuf = Buffer.from(modalScreenshot.data, 'base64');
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm14_alert_provenance_modal.png'), modalBuf);
    console.log('Saved alert provenance modal screenshot:', modalBuf.length, 'bytes');

    ws.close();
    chromeProcess.kill();
  } catch (e) {
    console.error(e);
    chromeProcess.kill();
  }
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
