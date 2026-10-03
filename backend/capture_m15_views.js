import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/home/alpha/.gemini/antigravity-ide/brain/c2fd95a5-d0ba-44a2-bdb5-a571ae077366';
const PORT = 9230;

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

  const userDataDir = `/tmp/chr-m15-${Date.now()}`;
  const chromeProcess = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1366,950',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 3000));

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

    // 1. Capture Petitions Directory
    console.log('Navigating to /participate/petitions...');
    await send('Page.navigate', { url: 'http://localhost:5173/participate/petitions' });
    await new Promise(r => setTimeout(r, 3000));
    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm15_petitions_directory.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m15_petitions_directory.png');

    // 2. Capture Budget Hearings
    console.log('Navigating to /participate/hearings...');
    await send('Page.navigate', { url: 'http://localhost:5173/participate/hearings' });
    await new Promise(r => setTimeout(r, 3000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm15_budget_hearings.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m15_budget_hearings.png');

    // 3. Capture Legislative Feedback
    console.log('Navigating to /participate/legislative...');
    await send('Page.navigate', { url: 'http://localhost:5173/participate/legislative' });
    await new Promise(r => setTimeout(r, 3000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm15_legislative_feedback.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m15_legislative_feedback.png');

    // 4. Capture Admin Participation Dashboard
    console.log('Navigating to /admin/participation...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/participation' });
    await new Promise(r => setTimeout(r, 3000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm15_admin_participation.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m15_admin_participation.png');

    // 5. Capture Admin Roadmap Gate showing M15 Human Approval button
    console.log('Navigating to /admin/roadmap...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/roadmap' });
    await new Promise(r => setTimeout(r, 3500));
    // Click on milestone-M15 card to expand it
    await send('Runtime.evaluate', {
      expression: `
        const m15Card = document.getElementById('milestone-M15');
        if (m15Card) {
          m15Card.scrollIntoView({ behavior: 'instant', block: 'center' });
          const header = m15Card.querySelector('div');
          if (header) header.click();
        }
      `
    });
    await new Promise(r => setTimeout(r, 1500));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm15_admin_roadmap_gate.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m15_admin_roadmap_gate.png');

    ws.close();
    chromeProcess.kill();
    console.log('All screenshots captured successfully.');
  } catch (e) {
    console.error('Screenshot error:', e);
    chromeProcess.kill();
  }
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
