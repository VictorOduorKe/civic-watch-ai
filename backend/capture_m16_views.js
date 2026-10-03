import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const ARTIFACT_DIR = '/home/alpha/.gemini/antigravity-ide/brain/c2fd95a5-d0ba-44a2-bdb5-a571ae077366';
const PORT = 9260;

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

  const userDataDir = `/tmp/chr-m16-${Date.now()}`;
  const chromeProcess = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1366,950',
    'http://localhost:5173/'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json());
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) break;
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }

  if (!list || !list[0] || !list[0].webSocketDebuggerUrl) {
    chromeProcess.kill();
    throw new Error(`Failed to connect to Chromium CDP on port ${PORT}`);
  }

  try {
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
      url: 'http://localhost:5173',
      httpOnly: true
    });
    await send('Network.setCookie', {
      name: 'XSRF-TOKEN',
      value: admin.xsrfCookie,
      url: 'http://localhost:5173'
    });

    // 1. Capture System Audit Trail
    console.log('Navigating to /admin/audit...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/audit' });
    await new Promise(r => setTimeout(r, 3000));
    let screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_system_audit_trail.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_system_audit_trail.png');

    // 2. Click 'Verify Chain Integrity' and capture verified modal
    console.log('Triggering Verify Chain Integrity...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Verify Chain Integrity'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 2000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_audit_integrity_verified.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_audit_integrity_verified.png');

    // 3. Capture Security Intrusion Monitoring
    console.log('Navigating to /admin/security-monitoring...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/security-monitoring' });
    await new Promise(r => setTimeout(r, 3000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_security_intrusion_monitoring.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_security_intrusion_monitoring.png');

    // 4. Capture Platform Governance (Category Schemas)
    console.log('Navigating to /admin/governance...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/governance' });
    await new Promise(r => setTimeout(r, 3000));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_governance_categories.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_governance_categories.png');

    // 5. Switch to API Keys tab
    console.log('Switching to API Keys tab...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('API Keys'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 2500));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_governance_api_keys.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_governance_api_keys.png');

    // 6. Switch to Security Policies tab
    console.log('Switching to Security Policies tab...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Security Policies'));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 2500));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_governance_policies.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_governance_policies.png');

    // 7. Capture Admin Roadmap Gate showing Milestone 16
    console.log('Navigating to /admin/roadmap...');
    await send('Page.navigate', { url: 'http://localhost:5173/admin/roadmap' });
    await new Promise(r => setTimeout(r, 3500));
    await send('Runtime.evaluate', {
      expression: `
        const m16Card = document.getElementById('milestone-M16');
        if (m16Card) {
          m16Card.scrollIntoView({ behavior: 'instant', block: 'center' });
          const header = m16Card.querySelector('div');
          if (header) header.click();
        }
      `
    });
    await new Promise(r => setTimeout(r, 1500));
    screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'm16_admin_roadmap_gate.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved m16_admin_roadmap_gate.png');

    ws.close();
    chromeProcess.kill();
    console.log('All M16 screenshots captured successfully.');
  } catch (e) {
    console.error('Screenshot error:', e);
    chromeProcess.kill();
  }
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
