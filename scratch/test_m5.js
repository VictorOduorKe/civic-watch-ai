const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log(' CIVICWATCH AI KENYA — MILESTONE 5 VERIFICATION SUITE');
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

  // Cookie and CSRF jar for each citizen session
  function createCitizenClient() {
    let cookieMap = new Map();
    let csrfToken = null;

    async function request(endpoint, options = {}) {
      const url = new URL(`${BASE_URL}${endpoint}`);
      if (options.params) {
        Object.entries(options.params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) url.searchParams.append(k, v);
        });
      }

      const headers = { ...(options.headers || {}) };

      if (cookieMap.size > 0) {
        const cookieHeader = Array.from(cookieMap.entries())
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
        headers['Cookie'] = cookieHeader;
      }

      const method = (options.method || 'GET').toUpperCase();
      if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      if (options.body && typeof options.body === 'object' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: options.body
      });

      // Capture Set-Cookie headers
      const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
      for (const raw of setCookies) {
        const [pair] = raw.split(';');
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          const name = pair.substring(0, eqIdx).trim();
          const val = pair.substring(eqIdx + 1).trim();
          cookieMap.set(name, val);

          if (name === 'XSRF-TOKEN') {
            csrfToken = decodeURIComponent(val);
          }
        }
      }

      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        headers: response.headers,
        data
      };
    }

    return {
      get: (ep, opts) => request(ep, { ...opts, method: 'GET' }),
      post: (ep, body, opts) => request(ep, { ...opts, method: 'POST', body }),
      getCookies: () => cookieMap
    };
  }

  try {
    // TEST GROUP 1: Foundation & Health Check (M0/M1 regression)
    console.log('--- TEST GROUP 1: Foundation & Health Check ---');
    const userA = createCitizenClient();
    const userB = createCitizenClient();

    const healthRes = await userA.get('/health');
    assert(healthRes.status === 200 && healthRes.data.database === 'connected', 'Health endpoint reports connected database');

    // TEST GROUP 2: Unauthenticated Protection (Security)
    console.log('\n--- TEST GROUP 2: Unauthenticated Protection ---');
    const unauthClient = createCitizenClient();
    const unauthMyReports = await unauthClient.get('/reports/my');
    assert(unauthMyReports.status === 401, 'GET /reports/my rejects unauthenticated request (401)');

    const unauthDetail = await unauthClient.get('/reports/my/CWK-2026-000001');
    assert(unauthDetail.status === 401, 'GET /reports/my/:ref rejects unauthenticated request (401)');

    const unauthStats = await unauthClient.get('/reports/stats/me');
    assert(unauthStats.status === 401, 'GET /reports/stats/me rejects unauthenticated request (401)');

    // TEST GROUP 3: Authentication & Registration (M2 regression)
    console.log('\n--- TEST GROUP 3: Authentication & Registration ---');
    const timestamp = Date.now();
    const userAData = {
      fullName: 'Citizen Alpha Tests',
      email: `alpha_${timestamp}@civicwatch.ke`,
      phone: '+254711000111',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Parklands',
      nationalId: `11${String(timestamp).slice(-6)}`,
      termsAccepted: true
    };

    const userBData = {
      fullName: 'Citizen Beta Tests',
      email: `beta_${timestamp}@civicwatch.ke`,
      phone: '+254722000222',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      county: 'Mombasa',
      subCounty: 'Mvita',
      ward: 'Old Town',
      nationalId: `22${String(timestamp).slice(-6)}`,
      termsAccepted: true
    };

    // Obtain initial CSRF tokens
    await userA.get('/auth/csrf-token');
    await userB.get('/auth/csrf-token');

    const regARes = await userA.post('/auth/register', userAData);
    assert(regARes.status === 201 && regARes.data.success, 'User Alpha registered successfully with HttpOnly cookie');

    const regBRes = await userB.post('/auth/register', userBData);
    assert(regBRes.status === 201 && regBRes.data.success, 'User Beta registered successfully with HttpOnly cookie');

    const meARes = await userA.get('/auth/me');
    assert(meARes.status === 200 && meARes.data.user.email === userAData.email, 'User Alpha /auth/me returns authenticated identity');

    // TEST GROUP 4: Empty Report State
    console.log('\n--- TEST GROUP 4: Empty Report State ---');
    const emptyReportsRes = await userA.get('/reports/my');
    assert(emptyReportsRes.status === 200 && emptyReportsRes.data.reports.length === 0, 'New user reports array is empty');
    assert(emptyReportsRes.data.pagination && emptyReportsRes.data.pagination.total === 0, 'Pagination total is 0');

    const emptySummaryRes = await userA.get('/reports/my/summary');
    assert(emptySummaryRes.status === 200 && emptySummaryRes.data.summary.total === 0, 'User Alpha summary total is 0');

    // TEST GROUP 5: Report Creation with Status History (M4 regression & Initial history)
    console.log('\n--- TEST GROUP 5: Report Creation with Status History ---');
    const categoriesRes = await userA.get('/reports/categories');
    const categoryId = categoriesRes.data.categories[0].id;

    // Report A1
    const reportA1Res = await userA.post('/reports', {
      category_id: categoryId,
      title: 'Alpha Pothole along Waiyaki Way',
      description: 'Major road depression causing traffic delays and vehicle damage near Westlands roundabout.',
      county: 'Nairobi',
      sub_county: 'Westlands',
      ward: 'Parklands',
      location_text: 'Near Westlands roundabout eastbound lane',
      incident_date: '2026-10-01',
      incident_time: '08:30',
      is_anonymous: false,
      preferred_contact: 'email'
    });
    assert(reportA1Res.status === 201 && reportA1Res.data.success, 'User Alpha created report A1 successfully');
    const refA1 = reportA1Res.data.report.reference;
    console.log(`    -> Report A1 Reference: ${refA1}`);

    // Report A2 (Anonymous with GPS)
    const reportA2Res = await userA.post('/reports', {
      category_id: categoryId,
      title: 'Alpha Broken Streetlight on Ring Road',
      description: 'Streetlights have been non-functional for three weeks causing security issues.',
      county: 'Nairobi',
      sub_county: 'Westlands',
      ward: 'Parklands',
      latitude: -1.2655,
      longitude: 36.8025,
      is_anonymous: true,
      preferred_contact: 'none'
    });
    assert(reportA2Res.status === 201 && reportA2Res.data.success, 'User Alpha created anonymous report A2');
    const refA2 = reportA2Res.data.report.reference;
    console.log(`    -> Report A2 Reference: ${refA2}`);

    // Report B1 (under User B)
    const reportB1Res = await userB.post('/reports', {
      category_id: categoryId,
      title: 'Beta Water Shortage in Old Town',
      description: 'Persistent water supply interruption in residential sector.',
      county: 'Mombasa',
      sub_county: 'Mvita',
      ward: 'Old Town',
      is_anonymous: false,
      preferred_contact: 'phone'
    });
    assert(reportB1Res.status === 201 && reportB1Res.data.success, 'User Beta created report B1 successfully');
    const refB1 = reportB1Res.data.report.reference;
    console.log(`    -> Report B1 Reference: ${refB1}`);

    // TEST GROUP 6: Ownership Isolation on Report Listing
    console.log('\n--- TEST GROUP 6: Ownership Isolation on Report Listing ---');
    const listARes = await userA.get('/reports/my');
    assert(listARes.status === 200, 'User Alpha successfully listed reports');
    assert(listARes.data.reports.length === 2, 'User Alpha sees exactly their 2 reports');
    assert(listARes.data.reports.every((r) => r.reference === refA1 || r.reference === refA2), 'User Alpha reports only include A1 and A2');

    const listBRes = await userB.get('/reports/my');
    assert(listBRes.status === 200, 'User Beta successfully listed reports');
    assert(listBRes.data.reports.length === 1, 'User Beta sees exactly their 1 report');
    assert(listBRes.data.reports[0].reference === refB1, 'User Beta report only includes B1');

    // TEST GROUP 7: Cross-User Ownership Violation Protection
    console.log('\n--- TEST GROUP 7: Cross-User Ownership Violation Protection ---');
    // User A attempts to view User B's report
    const crossAccessAtoB = await userA.get(`/reports/my/${refB1}`);
    assert(crossAccessAtoB.status === 404, `User Alpha requesting Beta's report (${refB1}) receives generic 404 Not Found`);
    assert(crossAccessAtoB.data.message === 'Report not found', 'Response does not leak existence of report to other user');

    // User B attempts to view User A's report
    const crossAccessBtoA = await userB.get(`/reports/my/${refA1}`);
    assert(crossAccessBtoA.status === 404, `User Beta requesting Alpha's report (${refA1}) receives generic 404 Not Found`);

    // Non-existent report reference
    const nonExistent = await userA.get('/reports/my/CWK-2026-999999');
    assert(nonExistent.status === 404, 'Non-existent reference returns 404');

    // TEST GROUP 8: Report Detail Structure & Citizen-Visible Status History
    console.log('\n--- TEST GROUP 8: Report Detail & Status History ---');
    const detailA1 = await userA.get(`/reports/my/${refA1}`);
    assert(detailA1.status === 200, 'User Alpha retrieves report A1 details');
    const rA1 = detailA1.data.report;
    assert(rA1.reference === refA1, 'Report reference matches');
    assert(rA1.status === 'Submitted', 'Report status is "Submitted"');
    assert(rA1.category && rA1.category.name, 'Category object included');
    assert(rA1.location_text === 'Near Westlands roundabout eastbound lane', 'Location text preserved');
    assert(Array.isArray(rA1.status_history) && rA1.status_history.length >= 1, 'Status history array present');
    assert(rA1.status_history[0].status === 'Submitted', 'Initial status event is "Submitted"');
    assert(rA1.status_history[0].note === 'Report submitted by citizen.', 'Initial note is citizen-visible');

    // Detail for anonymous report
    const detailA2 = await userA.get(`/reports/my/${refA2}`);
    assert(detailA2.status === 200, 'User Alpha retrieves anonymous report A2 details');
    assert(detailA2.data.report.is_anonymous === true, 'Anonymous flag is correctly true');
    assert(detailA2.data.report.latitude === -1.2655 && detailA2.data.report.longitude === 36.8025, 'GPS coordinates correctly formatted');

    // TEST GROUP 9: Search, Filtering & Pagination
    console.log('\n--- TEST GROUP 9: Search, Filtering & Pagination ---');
    // Search matching A1
    const searchA1 = await userA.get('/reports/my', { params: { search: 'Waiyaki' } });
    assert(searchA1.data.reports.length === 1 && searchA1.data.reports[0].reference === refA1, 'Search for "Waiyaki" returns only report A1');

    // Search matching reference
    const searchRef = await userA.get('/reports/my', { params: { search: refA2 } });
    assert(searchRef.data.reports.length === 1 && searchRef.data.reports[0].reference === refA2, 'Search by exact reference code returns report A2');

    // Search with no matches
    const searchNoMatch = await userA.get('/reports/my', { params: { search: 'NonExistentKeywordXYZ' } });
    assert(searchNoMatch.data.reports.length === 0 && searchNoMatch.data.pagination.total === 0, 'Search with no matches returns empty list and total 0');

    // Filter by status
    const filterSubmitted = await userA.get('/reports/my', { params: { status: 'Submitted' } });
    assert(filterSubmitted.data.reports.length === 2, 'Filter status=Submitted returns 2 reports');

    const filterResolved = await userA.get('/reports/my', { params: { status: 'Resolved' } });
    assert(filterResolved.data.reports.length === 0, 'Filter status=Resolved returns 0 reports');

    // Pagination validation
    const paginationTest = await userA.get('/reports/my', { params: { page: 1, limit: 1 } });
    assert(paginationTest.data.reports.length === 1, 'Limit=1 returns exactly 1 report');
    assert(paginationTest.data.pagination.totalPages === 2, 'Total pages is 2 for 2 reports with limit 1');
    assert(paginationTest.data.pagination.total === 2, 'Total items count is 2');

    // TEST GROUP 10: Real Database Summary Counts
    console.log('\n--- TEST GROUP 10: Summary Breakdown & Dashboard Stats ---');
    const summaryA = await userA.get('/reports/my/summary');
    assert(summaryA.data.summary.total === 2, 'User Alpha summary total is 2');
    assert(summaryA.data.summary.submitted === 2, 'User Alpha summary submitted count is 2');
    assert(summaryA.data.summary.resolved === 0, 'User Alpha summary resolved count is 0');

    const statsA = await userA.get('/reports/stats/me');
    assert(statsA.data.stats.total === 2, 'Dashboard stats /me reports total 2');

    // TEST GROUP 11: Security & Injection Resilience
    console.log('\n--- TEST GROUP 11: Security & Injection Resilience ---');
    const sqliSearch = await userA.get('/reports/my', { params: { search: "' OR '1'='1" } });
    assert(sqliSearch.status === 200 && sqliSearch.data.reports.length === 0, 'SQL injection in search handled safely without leaking records');

    const invalidRef = await userA.get('/reports/my/INVALID_REF');
    assert(invalidRef.status === 400, 'Malformed reference format rejected with 400 Bad Request');

    const invalidPage = await userA.get('/reports/my', { params: { page: -5 } });
    assert(invalidPage.status === 400, 'Negative page rejected with 400 Bad Request');

    const excessiveLimit = await userA.get('/reports/my', { params: { limit: 9999 } });
    assert(excessiveLimit.status === 400, 'Excessive limit > 50 rejected with 400 Bad Request');

    console.log('\n====================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  }
}

runTests();
