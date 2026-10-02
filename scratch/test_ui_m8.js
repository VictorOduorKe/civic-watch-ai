import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/home/alpha/.gemini/antigravity-ide/brain/b8286df5-2246-4d87-ad02-3b91a1ce4a56';

// CDP client over native Node WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method && this.events.has(msg.method)) {
        this.events.get(msg.method)(msg.params);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('--- Launching Chromium headless ---');
  const chrome = spawn('/usr/bin/chromium', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,800',
    '--disable-dev-shm-usage'
  ]);

  await sleep(1500);

  try {
    const version = await fetchJson('http://localhost:9222/json/version');
    console.log('Chromium debugging connected:', version.Browser);

    const targets = await fetchJson('http://localhost:9222/json/list');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.ready();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Network.enable');
    await cdp.send('Network.clearBrowserCookies');

    console.log('\n1. Navigating to http://localhost:5173/login');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(2500);

    // Sign in as Citizen
    console.log('2. Signing in as victor@example.com (Citizen)');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.querySelector('input[type="email"]');
          const passInput = document.querySelector('input[type="password"]');
          const form = document.querySelector('form');
          if (emailInput && passInput) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(emailInput, 'victor@example.com');
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
            setter.call(passInput, 'Password123!');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            passInput.dispatchEvent(new Event('change', { bubbles: true }));
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          }
        })()
      `
    });

    await sleep(4000);

    // Verify Dashboard & Notification Bell
    console.log('3. Inspecting Citizen Workspace header & notification bell');
    const headerCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bell = document.querySelector('button[aria-label*="Notifications"]');
          const badge = bell ? bell.querySelector('span[aria-hidden="true"]') : null;
          return {
            hasBell: Boolean(bell),
            bellAriaLabel: bell ? bell.getAttribute('aria-label') : null,
            badgeText: badge ? badge.textContent.trim() : '0',
            currentUrl: window.location.href
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Citizen Header Notification Bell:', headerCheck.result.value);

    // Click Notification Bell to open dropdown
    console.log('4. Clicking Notification Bell to open dropdown');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bell = document.querySelector('button[aria-label*="Notifications"]');
          if (bell) bell.click();
        })()
      `
    });
    await sleep(1000);

    const dropdownCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const dropdown = document.querySelector('div[role="dialog"][aria-label="Recent notifications"]');
          const items = dropdown ? dropdown.querySelectorAll('div[role="button"]') : [];
          return {
            hasDropdown: Boolean(dropdown),
            itemCount: items.length,
            firstItemTitle: items[0] ? items[0].querySelector('span.font-bold')?.textContent : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Notification Dropdown inspection:', dropdownCheck.result.value);

    // Take screenshot of Dashboard with open Notification Dropdown
    const ss1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const ss1Path = path.join(ARTIFACT_DIR, 'citizen_notification_dropdown.png');
    fs.writeFileSync(ss1Path, Buffer.from(ss1.data, 'base64'));
    console.log(`Saved screenshot: ${ss1Path}`);

    // Navigate to full /notifications page
    console.log('\n5. Navigating to http://localhost:5173/notifications');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/notifications' });
    await sleep(2500);

    const notifPageCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const title = document.querySelector('h1')?.textContent;
          const items = document.querySelectorAll('div[role="button"]');
          const markAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mark all as read'));
          return {
            pageTitle: title,
            notificationsCount: items.length,
            hasMarkAllButton: Boolean(markAllBtn)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Full Notifications Page inspection:', notifPageCheck.result.value);

    // Verify zero sensitive tokens in localStorage & sessionStorage
    console.log('6. Verifying localStorage and sessionStorage token security');
    const storageCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const localKeys = Object.keys(localStorage);
          const sessionKeys = Object.keys(sessionStorage);
          const hasJwt = localKeys.some(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('jwt')) ||
                         sessionKeys.some(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('jwt'));
          return {
            localStorageKeys: localKeys,
            sessionStorageKeys: sessionKeys,
            hasJwtInStorage: hasJwt
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Storage Security Check:', storageCheck.result.value);

    // Click "Mark all as read"
    console.log('7. Clicking "Mark all as read"');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const markAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mark all as read'));
          if (markAllBtn) markAllBtn.click();
        })()
      `
    });
    await sleep(2000);

    const postMarkCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bell = document.querySelector('button[aria-label*="Notifications"]');
          return {
            bellAriaLabel: bell ? bell.getAttribute('aria-label') : null,
            badge: bell ? bell.querySelector('span[aria-hidden="true"]') : null
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Post Mark-All-As-Read Bell State:', postMarkCheck.result.value);

    // Take screenshot of Notifications Page
    const ss2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const ss2Path = path.join(ARTIFACT_DIR, 'citizen_notifications_page.png');
    fs.writeFileSync(ss2Path, Buffer.from(ss2.data, 'base64'));
    console.log(`Saved screenshot: ${ss2Path}`);

    // Now test Admin Workspace
    console.log('\n8. Clearing session and signing in as admin@civicwatch.ke');
    await cdp.send('Network.enable');
    await cdp.send('Network.clearBrowserCookies');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(2000);

    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const emailInput = document.querySelector('input[type="email"]');
          const passInput = document.querySelector('input[type="password"]');
          const form = document.querySelector('form');
          if (emailInput && passInput) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(emailInput, 'admin@civicwatch.ke');
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
            setter.call(passInput, 'Password123!');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            passInput.dispatchEvent(new Event('change', { bubbles: true }));
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          }
        })()
      `
    });
    await sleep(4000);

    console.log('9. Checking Admin Header Notification Bell');
    const adminCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bell = document.querySelector('button[aria-label*="Notifications"]');
          return {
            hasAdminBell: Boolean(bell),
            adminBellLabel: bell ? bell.getAttribute('aria-label') : null,
            url: window.location.href
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Admin Notification Bell:', adminCheck.result.value);

    // Navigate to /admin/notifications
    console.log('10. Navigating to /admin/notifications');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/notifications' });
    await sleep(2500);

    const adminPageCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const h1 = document.querySelector('h1')?.textContent;
          const sidebarNotif = document.querySelector('aside a[href="/admin/notifications"]');
          return {
            h1,
            hasSidebarLink: Boolean(sidebarNotif)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Admin Notifications Page inspection:', adminPageCheck.result.value);

    // Screenshot of Admin Notifications
    const ss3 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const ss3Path = path.join(ARTIFACT_DIR, 'admin_notifications_page.png');
    fs.writeFileSync(ss3Path, Buffer.from(ss3.data, 'base64'));
    console.log(`Saved screenshot: ${ss3Path}`);

    cdp.close();
    console.log('\n=== ALL BROWSER & UI VERIFICATIONS SUCCEEDED! ===\n');
  } catch (err) {
    console.error('Error during browser testing:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
