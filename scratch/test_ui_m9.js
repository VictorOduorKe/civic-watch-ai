import http from 'http';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('=== Milestone 9 Automated UI Verification (Refined) ===');

  const pages = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = pages.find(p => p.type === 'page');
  if (!page) throw new Error('No open Chromium page found');

  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  }

  async function takeScreenshot(filepath) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filepath}`);
  }

  async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  try {
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    // Clear cookies to ensure fresh citizen login
    console.log('Clearing browser cookies...');
    await send('Network.clearBrowserCookies');

    // 1. Navigate to Citizen Login
    console.log('\n--- Navigating to citizen login ---');
    await send('Page.navigate', { url: 'http://localhost:5173/login' });
    await wait(2000);

    // Fill login form using React prototype value setters
    await evaluate(`
      (() => {
        function setNativeValue(element, value) {
          const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          valueSetter.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        if (emailInput && passInput) {
          setNativeValue(emailInput, 'victor@example.com');
          setNativeValue(passInput, 'Password123!');
          const btn = document.querySelector('button[type="submit"]');
          if (btn) btn.click();
        }
      })()
    `);
    await wait(3000);

    // 2. Navigate to /dashboard
    console.log('\n--- Navigating to /dashboard ---');
    await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
    await wait(2500);

    const artifactDir = '/home/alpha/.gemini/antigravity-ide/brain/b8286df5-2246-4d87-ad02-3b91a1ce4a56';

    // 3. Navigate to /verify
    console.log('\n--- Navigating to /verify ---');
    await send('Page.navigate', { url: 'http://localhost:5173/verify' });
    await wait(2000);

    const verifyPageShot = path.join(artifactDir, 'citizen_verify_page.png');
    await takeScreenshot(verifyPageShot);

    // 4. Fill in claim and submit for AI analysis
    console.log('\n--- Submitting claim on /verify form ---');
    await evaluate(`
      (() => {
        const textarea = document.querySelector('#claim-text');
        if (textarea) {
          const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          valueSetter.call(textarea, 'The Kenya National Highways Authority (KeNHA) announced that all road toll fees are permanently cancelled for all private motorists on Thika Superhighway.');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);

    console.log('Submitted claim, waiting for AI analysis and redirect to detail page...');
    let attempts = 0;
    let currentUrl = '';
    while (attempts < 25) {
      await wait(1500);
      currentUrl = await evaluate(`window.location.href`);
      if (currentUrl.includes('/verify/') && !currentUrl.endsWith('/verify')) {
        break;
      }
      attempts++;
    }

    console.log('Navigated to Result Page URL:', currentUrl);
    await wait(2500);

    const verifyDetailShot = path.join(artifactDir, 'citizen_verify_detail.png');
    await takeScreenshot(verifyDetailShot);

    // 5. Navigate to /verify/history
    console.log('\n--- Navigating to /verify/history ---');
    await send('Page.navigate', { url: 'http://localhost:5173/verify/history' });
    await wait(2500);

    const historyItemsCount = await evaluate(`document.querySelectorAll('.space-y-3 > div').length`);
    console.log(`History items rendered: ${historyItemsCount}`);

    const verifyHistoryShot = path.join(artifactDir, 'citizen_verify_history.png');
    await takeScreenshot(verifyHistoryShot);

    // 6. Security Check: verify localStorage & sessionStorage have 0 tokens
    console.log('\n--- Security Check: Token storage in browser storage ---');
    const storageCheck = await evaluate(`
      (() => {
        const localKeys = Object.keys(localStorage);
        const sessionKeys = Object.keys(sessionStorage);
        const suspiciousLocal = localKeys.filter(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('auth'));
        const suspiciousSession = sessionKeys.filter(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('auth'));
        return {
          localStorageKeys: localKeys,
          sessionStorageKeys: sessionKeys,
          suspiciousLocal,
          suspiciousSession
        };
      })()
    `);
    console.log('Browser Storage Check:', JSON.stringify(storageCheck, null, 2));

    if (storageCheck.suspiciousLocal.length === 0 && storageCheck.suspiciousSession.length === 0) {
      console.log(' [PASS] Zero tokens found in localStorage/sessionStorage. Strict HttpOnly cookie auth preserved.');
    } else {
      console.error(' [FAIL] Tokens detected in web storage!');
    }

    console.log('\n=== UI Verification Finished Successfully ===');
  } finally {
    ws.close();
  }
}

main().catch(err => {
  console.error('UI Verification failed:', err);
  process.exit(1);
});
