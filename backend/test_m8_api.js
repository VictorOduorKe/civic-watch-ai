import http from 'http';
import { pool } from './src/config/database.js';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME, generateCsrfToken } from './src/config/authCookie.js';

const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret_change_in_production_min32chars';

function createAuthCookie(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const csrfToken = generateCsrfToken();
  return {
    token,
    csrfToken,
    cookieHeader: `${AUTH_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`
  };
}

function request({ method, path, data, headers = {} }) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

async function runTests() {
  console.log('=== Milestone 8: In-App Notification System Tests ===\n');

  // 1. Fetch test users
  const [adminUsers] = await pool.query("SELECT * FROM users WHERE email = 'admin@civicwatch.ke'");
  const [modUsers] = await pool.query("SELECT * FROM users WHERE email = 'moderator@civicwatch.ke'");
  const [analystUsers] = await pool.query("SELECT * FROM users WHERE email = 'analyst@civicwatch.ke'");
  const [citizenUsers] = await pool.query("SELECT * FROM users WHERE role = 'Citizen' ORDER BY id ASC");

  const admin = adminUsers[0];
  const mod = modUsers[0];
  const analyst = analystUsers[0];
  const citizenA = citizenUsers[0];
  const citizenB = citizenUsers[1] || citizenUsers[0];

  const adminAuth = createAuthCookie(admin);
  const modAuth = createAuthCookie(mod);
  const analystAuth = createAuthCookie(analyst);
  const citizenAuthA = createAuthCookie(citizenA);
  const citizenAuthB = createAuthCookie(citizenB);

  console.log(`Users loaded: Admin (${admin.email}), Mod (${mod.email}), Analyst (${analyst.email}), CitizenA (${citizenA.email})`);

  // --- Test 1: Authentication Requirement ---
  console.log('\n--- Test 1: Authentication Enforcement ---');
  const unauthGet = await request({ method: 'GET', path: '/api/notifications' });
  assert(unauthGet.status === 401, 'Unauthenticated GET /api/notifications returns 401');

  const unauthCount = await request({ method: 'GET', path: '/api/notifications/unread-count' });
  assert(unauthCount.status === 401, 'Unauthenticated GET /api/notifications/unread-count returns 401');

  const dummyCsrf = generateCsrfToken();
  const unauthPatch = await request({
    method: 'PATCH',
    path: '/api/notifications/read-all',
    headers: {
      Cookie: `${CSRF_COOKIE_NAME}=${dummyCsrf}`,
      'X-CSRF-Token': dummyCsrf
    }
  });
  assert(unauthPatch.status === 401, 'Unauthenticated PATCH /api/notifications/read-all returns 401');

  // --- Test 2: Notification Service Deduplication & Insertion ---
  console.log('\n--- Test 2: Service Deduplication & Storage ---');
  const { createNotification } = await import('./src/services/notificationService.js');
  const testDedupeKey = `test-dedupe-${Date.now()}`;

  const notif1 = await createNotification({
    recipientUserId: citizenA.id,
    type: 'SYSTEM_NOTIFICATION',
    title: 'Welcome to CivicWatch',
    message: 'Testing notification engine deduplication.',
    dedupeKey: testDedupeKey
  });
  assert(notif1 && notif1.id, 'Notification 1 created successfully');

  // Attempt duplicate insert
  const notif2 = await createNotification({
    recipientUserId: citizenA.id,
    type: 'SYSTEM_NOTIFICATION',
    title: 'Welcome to CivicWatch Duplicate',
    message: 'This duplicate should not create a new row.',
    dedupeKey: testDedupeKey
  });
  assert(notif2 && notif2.id === notif1.id, 'Duplicate notification returns existing record without creating duplicate row');

  // --- Test 3: GET /api/notifications & Unread Count ---
  console.log('\n--- Test 3: List & Unread Count APIs ---');
  const listRes = await request({
    method: 'GET',
    path: '/api/notifications?page=1&limit=10',
    headers: { Cookie: citizenAuthA.cookieHeader }
  });
  assert(listRes.status === 200, 'GET /api/notifications returns 200');
  assert(Array.isArray(listRes.data.notifications), 'Response contains notifications array');
  assert(listRes.data.pagination && listRes.data.pagination.page === 1, 'Pagination object returned');
  assert(typeof listRes.data.unreadCount === 'number', 'unreadCount returned as number');

  const countRes = await request({
    method: 'GET',
    path: '/api/notifications/unread-count',
    headers: { Cookie: citizenAuthA.cookieHeader }
  });
  assert(countRes.status === 200, 'GET /api/notifications/unread-count returns 200');
  assert(typeof countRes.data.unreadCount === 'number', 'unreadCount matches expected format');

  // --- Test 4: Report Creation Event -> REPORT_RECEIVED ---
  console.log('\n--- Test 4: Report Created Event (REPORT_RECEIVED) ---');
  const { createReport } = await import('./src/services/reportService.js');
  const [categories] = await pool.query('SELECT id FROM report_categories WHERE is_active = TRUE LIMIT 1');
  const catId = categories[0].id;

  const createdReport = await createReport({
    userId: citizenA.id,
    reportData: {
      category_id: catId,
      title: 'M8 Test Incident Notification Verification',
      description: 'Verifying that creating a report creates a real REPORT_RECEIVED in-app notification.',
      county: 'Nairobi',
      sub_county: 'Westlands',
      ward: 'Parklands',
      is_anonymous: false
    }
  });
  assert(createdReport && createdReport.reference, `Report created with reference ${createdReport.reference}`);

  // Check notification table for citizenA
  const [notifsAfterReport] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_RECEIVED"',
    [citizenA.id, createdReport.reference]
  );
  assert(notifsAfterReport.length === 1, 'REPORT_RECEIVED notification created in database for citizen');
  assert(notifsAfterReport[0].title === 'Report Received', 'Notification title is "Report Received"');
  assert(notifsAfterReport[0].message.includes(createdReport.reference), 'Notification message includes report reference');

  // --- Test 5: Status Change Event -> REPORT_STATUS_CHANGED ---
  console.log('\n--- Test 5: Status Change Event (REPORT_STATUS_CHANGED) ---');
  const statusRes = await request({
    method: 'PATCH',
    path: `/api/admin/incidents/${createdReport.reference}/status`,
    data: {
      status: 'Under Review',
      note: 'Investigating incident credibility for verification.',
      visible_to_citizen: true
    },
    headers: {
      Cookie: modAuth.cookieHeader,
      'X-CSRF-Token': modAuth.csrfToken
    }
  });
  assert(statusRes.status === 200, 'Status updated to "Under Review" by moderator');

  const [statusNotifs] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_STATUS_CHANGED"',
    [citizenA.id, createdReport.reference]
  );
  assert(statusNotifs.length === 1, 'REPORT_STATUS_CHANGED notification created for citizen');
  assert(statusNotifs[0].message.includes('under review'), 'Notification message states status is under review');

  // --- Test 6: Internal Status Change Privacy Boundary ---
  console.log('\n--- Test 6: Internal Status Privacy Boundary ---');
  // Revert back or change with visible_to_citizen = false
  const internalStatusRes = await request({
    method: 'PATCH',
    path: `/api/admin/incidents/${createdReport.reference}/status`,
    data: {
      status: 'Submitted',
      note: 'Internal test state change.',
      visible_to_citizen: false
    },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-CSRF-Token': adminAuth.csrfToken
    }
  });
  assert(internalStatusRes.status === 200, 'Status reverted with visible_to_citizen = false');

  const [internalNotifs] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_STATUS_CHANGED" AND message LIKE "%submitted%"',
    [citizenA.id, createdReport.reference]
  );
  assert(internalNotifs.length === 0, 'No notification created when visible_to_citizen = false');

  // --- Test 7: Citizen Update Event -> REPORT_UPDATED ---
  console.log('\n--- Test 7: Citizen Update Event (REPORT_UPDATED) ---');
  const updateRes = await request({
    method: 'POST',
    path: `/api/admin/incidents/${createdReport.reference}/updates`,
    data: {
      message: 'Field officers have been dispatched to inspect the reported location.'
    },
    headers: {
      Cookie: modAuth.cookieHeader,
      'X-CSRF-Token': modAuth.csrfToken
    }
  });
  assert(updateRes.status === 201, 'Citizen update created successfully');

  const [updateNotifs] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_UPDATED"',
    [citizenA.id, createdReport.reference]
  );
  assert(updateNotifs.length === 1, 'REPORT_UPDATED notification created for citizen');
  assert(updateNotifs[0].title === 'Report Updated', 'Notification title is "Report Updated"');

  // --- Test 8: Internal Note Privacy Boundary ---
  console.log('\n--- Test 8: Internal Note Privacy Boundary ---');
  const initialCitizenNotifCount = (await pool.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE recipient_user_id = ?',
    [citizenA.id]
  ))[0][0].total;

  const noteRes = await request({
    method: 'POST',
    path: `/api/admin/incidents/${createdReport.reference}/internal-notes`,
    data: {
      note: 'CONFIDENTIAL: Internal moderator triage note, citizen must not see this.'
    },
    headers: {
      Cookie: modAuth.cookieHeader,
      'X-CSRF-Token': modAuth.csrfToken
    }
  });
  assert(noteRes.status === 201, 'Internal note added by moderator');

  const finalCitizenNotifCount = (await pool.query(
    'SELECT COUNT(*) AS total FROM notifications WHERE recipient_user_id = ?',
    [citizenA.id]
  ))[0][0].total;
  assert(finalCitizenNotifCount === initialCitizenNotifCount, 'Internal notes generate zero citizen notifications');

  // --- Test 9: Assignment Event -> REPORT_ASSIGNED to Staff ---
  console.log('\n--- Test 9: Assignment Event (REPORT_ASSIGNED) ---');
  const assignRes = await request({
    method: 'POST',
    path: `/api/admin/incidents/${createdReport.reference}/assign`,
    data: {
      assigned_to_user_id: analyst.id,
      assignment_note: 'Please verify data and map coordinates.'
    },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-CSRF-Token': adminAuth.csrfToken
    }
  });
  assert(assignRes.status === 200, 'Incident assigned to analyst');

  const [analystNotifs] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_ASSIGNED"',
    [analyst.id, createdReport.reference]
  );
  assert(analystNotifs.length === 1, 'REPORT_ASSIGNED notification created for assigned analyst');
  assert(analystNotifs[0].title === 'Report Assigned', 'Title is "Report Assigned"');

  const [citizenAssignNotifs] = await pool.query(
    'SELECT * FROM notifications WHERE recipient_user_id = ? AND entity_reference = ? AND type = "REPORT_ASSIGNED"',
    [citizenA.id, createdReport.reference]
  );
  assert(citizenAssignNotifs.length === 0, 'Citizen did not receive the administrative assignment notification');

  // --- Test 10: Mark Single Notification As Read & Idempotency ---
  console.log('\n--- Test 10: Mark Single Notification Read & Idempotency ---');
  const targetNotif = analystNotifs[0];
  const readRes1 = await request({
    method: 'PATCH',
    path: `/api/notifications/${targetNotif.id}/read`,
    headers: {
      Cookie: analystAuth.cookieHeader,
      'X-CSRF-Token': analystAuth.csrfToken
    }
  });
  assert(readRes1.status === 200, 'PATCH /api/notifications/:id/read returned 200');
  assert(readRes1.data.notification.isRead === true, 'Notification marked as read');
  assert(readRes1.data.notification.readAt !== null, 'readAt timestamp populated');

  // Idempotency: call again
  const readRes2 = await request({
    method: 'PATCH',
    path: `/api/notifications/${targetNotif.id}/read`,
    headers: {
      Cookie: analystAuth.cookieHeader,
      'X-CSRF-Token': analystAuth.csrfToken
    }
  });
  assert(readRes2.status === 200, 'Idempotent read operation succeeded with 200');
  assert(readRes2.data.notification.isRead === true, 'isRead remains true on retry');

  // --- Test 11: Mark All Notifications Read ---
  console.log('\n--- Test 11: Mark All Read ---');
  const markAllRes = await request({
    method: 'PATCH',
    path: '/api/notifications/read-all',
    headers: {
      Cookie: citizenAuthA.cookieHeader,
      'X-CSRF-Token': citizenAuthA.csrfToken
    }
  });
  assert(markAllRes.status === 200, 'PATCH /api/notifications/read-all returned 200');

  const countAfterAll = await request({
    method: 'GET',
    path: '/api/notifications/unread-count',
    headers: { Cookie: citizenAuthA.cookieHeader }
  });
  assert(countAfterAll.data.unreadCount === 0, 'Unread count is 0 after markAllAsRead');

  // --- Test 12: Ownership & Cross-User Security ---
  console.log('\n--- Test 12: Notification Ownership & Cross-User Security ---');
  // Citizen B tries to mark Analyst's notification as read
  const hackRead = await request({
    method: 'PATCH',
    path: `/api/notifications/${targetNotif.id}/read`,
    headers: {
      Cookie: citizenAuthB.cookieHeader,
      'X-CSRF-Token': citizenAuthB.csrfToken
    }
  });
  assert(hackRead.status === 403, 'Cross-user attempt to mark another user notification as read returns 403 Forbidden');

  // Non-existent notification
  const notFoundRead = await request({
    method: 'PATCH',
    path: '/api/notifications/99999999/read',
    headers: {
      Cookie: citizenAuthA.cookieHeader,
      'X-CSRF-Token': citizenAuthA.csrfToken
    }
  });
  assert(notFoundRead.status === 404, 'Non-existent notification returns 404');

  // --- Test 13: SQL Injection & Input Validation ---
  console.log('\n--- Test 13: SQL Injection & Input Validation ---');
  const sqliPage = await request({
    method: 'GET',
    path: '/api/notifications?page=1;SELECT+1',
    headers: { Cookie: citizenAuthA.cookieHeader }
  });
  assert(sqliPage.status === 400 || sqliPage.status === 422, 'Malicious page parameter rejected with validation error (400/422)');

  const sqliId = await request({
    method: 'PATCH',
    path: '/api/notifications/1%20OR%201=1/read',
    headers: {
      Cookie: citizenAuthA.cookieHeader,
      'X-CSRF-Token': citizenAuthA.csrfToken
    }
  });
  assert(sqliId.status === 400 || sqliId.status === 422, 'Malicious notification id rejected with validation error (400/422)');

  // --- Test 14: XSS Safety ---
  console.log('\n--- Test 14: XSS Sanitization & Safe Storage ---');
  const xssDedupe = `xss-test-${Date.now()}`;
  const xssNotif = await createNotification({
    recipientUserId: citizenA.id,
    type: 'SYSTEM_NOTIFICATION',
    title: '<script>alert("xss-title")</script>',
    message: '<img src=x onerror=alert(1)> Safe Notification Body',
    dedupeKey: xssDedupe
  });
  assert(xssNotif.title.includes('<script>'), 'Title stored as raw text, not executed');

  const listXss = await request({
    method: 'GET',
    path: '/api/notifications?page=1&limit=5',
    headers: { Cookie: citizenAuthA.cookieHeader }
  });
  const foundXss = listXss.data.notifications.find(n => n.id === xssNotif.id);
  assert(foundXss && foundXss.title === '<script>alert("xss-title")</script>', 'Returned JSON contains text without script execution');

  console.log('\n=== ALL BACKEND NOTIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\nFAILED TEST SUITE:', err);
  process.exit(1);
});
