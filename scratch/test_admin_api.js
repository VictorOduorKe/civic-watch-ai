const BASE_URL = 'http://localhost:5000/api';

async function runAdminApiTests() {
  console.log('====================================================');
  console.log(' CIVICWATCH AI KENYA — M6 ADMIN API VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  async function loginUser(email, password) {
    let cookies = [];
    let csrfToken = null;

    function saveCookies(headers) {
      const raw = headers.getSetCookie ? headers.getSetCookie() : [];
      for (const c of raw) {
        const part = c.split(';')[0];
        const key = part.split('=')[0];
        cookies = cookies.filter((existing) => !existing.startsWith(`${key}=`));
        cookies.push(part);
        if (key === 'XSRF-TOKEN') {
          csrfToken = decodeURIComponent(part.substring(key.length + 1));
        }
      }
    }

    const csrfRes = await fetch(`${BASE_URL}/auth/csrf-token`);
    saveCookies(csrfRes.headers);

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; '),
        'X-XSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({ email, password })
    });
    saveCookies(loginRes.headers);
    const loginData = await loginRes.json();

    return {
      success: loginRes.status === 200 && loginData.success,
      user: loginData.user,
      get: async (endpoint, params = {}) => {
        const url = new URL(`${BASE_URL}${endpoint}`);
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) url.searchParams.append(k, v);
        });

        const res = await fetch(url.toString(), {
          headers: {
            'Cookie': cookies.join('; ')
          }
        });
        saveCookies(res.headers);
        const data = await res.json();
        return { status: res.status, data };
      }
    };
  }

  // 1. Unauthenticated Request
  console.log('--- TEST GROUP 1: Unauthenticated Protection ---');
  const unauthRes = await fetch(`${BASE_URL}/admin/dashboard/summary`);
  assert(unauthRes.status === 401, 'Unauthenticated GET /api/admin/dashboard/summary is rejected with 401');

  // 2. Citizen Request (Role Authorization check)
  console.log('\n--- TEST GROUP 2: Citizen Access Rejection (RBAC) ---');
  const citizenSession = await loginUser('victor@example.com', 'Password123!');
  assert(citizenSession.success && citizenSession.user.role === 'Citizen', 'Citizen logged in successfully');
  const citizenAdminAttempt = await citizenSession.get('/admin/dashboard/summary');
  assert(citizenAdminAttempt.status === 403, 'Citizen request to /api/admin/dashboard/summary is rejected with 403 Forbidden');
  assert(citizenAdminAttempt.data.message.includes('Forbidden'), 'Error message explicitly indicates Forbidden');

  // 3. Admin Request
  console.log('\n--- TEST GROUP 3: Admin Role Authorization & Data Accuracy ---');
  const adminSession = await loginUser('admin@civicwatch.ke', 'Password123!');
  assert(adminSession.success && adminSession.user.role === 'Admin', 'Admin logged in successfully');
  const adminRes = await adminSession.get('/admin/dashboard/summary');
  assert(adminRes.status === 200 && adminRes.data.success, 'Admin receives 200 OK from /admin/dashboard/summary');
  const data = adminRes.data;

  // Verify structure
  assert(typeof data.summary.total_reports === 'number', `Total reports is a number: ${data.summary.total_reports}`);
  assert(typeof data.summary.total_users === 'number' && data.summary.total_users >= 3, `Total users is at least 3 (Actual: ${data.summary.total_users})`);
  assert(data.summary.admins_count >= 1, `Admins count: ${data.summary.admins_count}`);
  assert(data.summary.citizens_count >= 1, `Citizens count: ${data.summary.citizens_count}`);
  assert(Array.isArray(data.reports_by_status) && data.reports_by_status.length === 8, 'reports_by_status contains all 8 lifecycle statuses');
  assert(Array.isArray(data.reports_by_category) && data.reports_by_category.length > 0, `reports_by_category returned ${data.reports_by_category.length} categories`);
  assert(Array.isArray(data.reports_by_county), 'reports_by_county is an array');
  assert(Array.isArray(data.reports_over_time), 'reports_over_time is an array');

  // 4. Moderator & Analyst Request
  console.log('\n--- TEST GROUP 4: Moderator and Analyst Roles ---');
  const modSession = await loginUser('moderator@civicwatch.ke', 'Password123!');
  assert(modSession.success && modSession.user.role === 'Moderator', 'Moderator logged in');
  const modRes = await modSession.get('/admin/dashboard/summary');
  assert(modRes.status === 200, 'Moderator can access admin dashboard summary');

  const analystSession = await loginUser('analyst@civicwatch.ke', 'Password123!');
  assert(analystSession.success && analystSession.user.role === 'Analyst', 'Analyst logged in');
  const analystRes = await analystSession.get('/admin/dashboard/summary');
  assert(analystRes.status === 200, 'Analyst can access admin dashboard summary');

  // 5. Query Parameter Validation & Date Filtering
  console.log('\n--- TEST GROUP 5: Input Validation & Range Filtering ---');
  for (const range of ['7d', '30d', '90d', 'year', 'all']) {
    const rangeRes = await adminSession.get('/admin/dashboard/summary', { range });
    assert(rangeRes.status === 200 && rangeRes.data.meta.range === range, `Range "${range}" processed successfully`);
  }

  const invalidRange = await adminSession.get('/admin/dashboard/summary', { range: 'invalid_range_value' });
  assert(invalidRange.status === 400, 'Invalid range parameter rejected with 400 Bad Request');

  const injectionRange = await adminSession.get('/admin/dashboard/summary', { range: "30d' OR 1=1--" });
  assert(injectionRange.status === 400, 'SQL injection string in range rejected with 400 Bad Request');

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runAdminApiTests();
