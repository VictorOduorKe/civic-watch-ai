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

async function loginCitizen() {
  const csrfRes = await apiRequest('/auth/csrf-token');
  const xsrfCookie = getCookieValue(csrfRes.headers['set-cookie'], 'XSRF-TOKEN') || csrfRes.data?.csrfToken;
  const loginRes = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: 'victor@example.com', password: 'Password123!' },
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
  const { authCookie, xsrfCookie } = await loginCitizen();
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

    await client.send('Network.setCookie', {
      name: 'civicwatch_auth',
      value: authCookie,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
    await client.send('Network.setCookie', {
      name: 'XSRF-TOKEN',
      value: xsrfCookie,
      domain: 'localhost',
      path: '/'
    });

    await client.send('Page.navigate', { url: 'http://localhost:5173/notifications/settings' });
    await new Promise(r => setTimeout(r, 3500));

    // Scroll to subscriptions section
    await client.send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, 500);'
    });
    await new Promise(r => setTimeout(r, 1000));

    const settingsScreenshot = await client.send('Page.captureScreenshot', { format: 'png' });
    const settingsPath = path.join(ARTIFACT_DIR, 'm13_notification_subscriptions_section.png');
    fs.writeFileSync(settingsPath, Buffer.from(settingsScreenshot.data, 'base64'));
    console.log(`  ✓ Saved subscriptions section screenshot to: ${settingsPath}`);

    client.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
