import http from 'http';
import { pool } from '../backend/src/config/database.js';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME, generateCsrfToken } from '../backend/src/config/authCookie.js';

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

async function runTests() {
  console.log('=== Milestone 7: API Verification Tests ===\n');

  // 1. Fetch test users
  const [adminUsers] = await pool.query("SELECT * FROM users WHERE email = 'admin@civicwatch.ke'");
  const [modUsers] = await pool.query("SELECT * FROM users WHERE email = 'moderator@civicwatch.ke'");
  const [analystUsers] = await pool.query("SELECT * FROM users WHERE email = 'analyst@civicwatch.ke'");
  const [citizenUsers] = await pool.query("SELECT * FROM users WHERE role = 'Citizen' LIMIT 1");

  const admin = adminUsers[0];
  const mod = modUsers[0];
  const analyst = analystUsers[0];
  const citizen = citizenUsers[0];

  console.log(`Users fetched: Admin(${admin.email}), Moderator(${mod.email}), Analyst(${analyst.email}), Citizen(${citizen.email})`);

  const adminAuth = createAuthCookie(admin);
  const modAuth = createAuthCookie(mod);
  const analystAuth = createAuthCookie(analyst);
  const citizenAuth = createAuthCookie(citizen);

  // 2. Fetch a real report reference
  const [reports] = await pool.query('SELECT report_reference, status, is_anonymous FROM reports LIMIT 1');
  if (reports.length === 0) {
    throw new Error('No reports found in database to test.');
  }
  const testRef = reports[0].report_reference;
  console.log(`Using test report: ${testRef} (status: ${reports[0].status}, anonymous: ${reports[0].is_anonymous})\n`);

  // Test 1: Citizen blocked from admin incidents
  console.log('--- Test 1: Citizen RBAC Boundary ---');
  const res1 = await request({
    method: 'GET',
    path: '/api/admin/incidents',
    headers: {
      Cookie: citizenAuth.cookieHeader
    }
  });
  console.log(`Citizen GET /api/admin/incidents -> Status: ${res1.status} (Expected: 403)`);
  if (res1.status !== 403) throw new Error('Citizen was not blocked with 403!');

  // Test 2: Admin list incidents
  console.log('\n--- Test 2: Admin Incident List & Pagination ---');
  const res2 = await request({
    method: 'GET',
    path: '/api/admin/incidents?page=1&limit=5',
    headers: {
      Cookie: adminAuth.cookieHeader
    }
  });
  console.log(`Admin GET /api/admin/incidents -> Status: ${res2.status}, Total: ${res2.data?.pagination?.total}, Returned: ${res2.data?.incidents?.length}`);
  if (res2.status !== 200 || !res2.data.success) throw new Error('Failed to fetch admin incidents');

  // Test 3: Analyst list incidents (Read permitted)
  console.log('\n--- Test 3: Analyst Read Access ---');
  const res3 = await request({
    method: 'GET',
    path: '/api/admin/incidents',
    headers: {
      Cookie: analystAuth.cookieHeader
    }
  });
  console.log(`Analyst GET /api/admin/incidents -> Status: ${res3.status} (Expected: 200)`);
  if (res3.status !== 200) throw new Error('Analyst read access failed');

  // Test 4: Analyst mutation blocked (Status change)
  console.log('\n--- Test 4: Analyst Mutation Blocked ---');
  const res4 = await request({
    method: 'PATCH',
    path: `/api/admin/incidents/${testRef}/status`,
    data: { status: 'Under Review', note: 'Analyst test change' },
    headers: {
      Cookie: analystAuth.cookieHeader,
      'X-XSRF-TOKEN': analystAuth.csrfToken
    }
  });
  console.log(`Analyst PATCH status -> Status: ${res4.status} (Expected: 403)`);
  if (res4.status !== 403) throw new Error('Analyst mutation was not blocked!');

  // Test 5: Incident Detail (Admin)
  console.log('\n--- Test 5: Incident Detail ---');
  const res5 = await request({
    method: 'GET',
    path: `/api/admin/incidents/${testRef}`,
    headers: {
      Cookie: adminAuth.cookieHeader
    }
  });
  console.log(`Admin GET /api/admin/incidents/${testRef} -> Status: ${res5.status}, Title: "${res5.data?.incident?.title}"`);
  if (res5.status !== 200 || !res5.data.incident) throw new Error('Failed to get incident detail');

  // Test 6: Eligible assignees
  console.log('\n--- Test 6: Eligible Assignees ---');
  const res6 = await request({
    method: 'GET',
    path: '/api/admin/incidents/assignees',
    headers: {
      Cookie: adminAuth.cookieHeader
    }
  });
  console.log(`Admin GET /api/admin/incidents/assignees -> Status: ${res6.status}, Assignees count: ${res6.data?.assignees?.length}`);
  if (res6.status !== 200) throw new Error('Failed to get eligible assignees');

  // Test 7: Add Internal Note (Moderator)
  console.log('\n--- Test 7: Internal Note (Admin/Moderator) ---');
  const xssNote = 'Note with <script>alert("test")</script> & sensitive notes.';
  const res7 = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/internal-notes`,
    data: { note: xssNote },
    headers: {
      Cookie: modAuth.cookieHeader,
      'X-XSRF-TOKEN': modAuth.csrfToken
    }
  });
  console.log(`Moderator POST internal note -> Status: ${res7.status}, Note ID: ${res7.data?.note?.id}`);
  if (res7.status !== 201) throw new Error('Failed to add internal note');

  // Test 8: Verify internal note is NOT visible to citizen through M5
  console.log('\n--- Test 8: Privacy - Citizen M5 Excludes Internal Notes ---');
  const [reportOwner] = await pool.query('SELECT u.id, u.email, u.role FROM users u JOIN reports r ON r.user_id = u.id WHERE r.report_reference = ?', [testRef]);
  const ownerAuth = createAuthCookie(reportOwner[0]);
  const res8 = await request({
    method: 'GET',
    path: `/api/reports/my/${testRef}`,
    headers: {
      Cookie: ownerAuth.cookieHeader
    }
  });
  console.log(`Citizen GET /api/reports/my/${testRef} -> Status: ${res8.status}`);
  if (res8.data?.report?.internal_notes) {
    throw new Error('CRITICAL SECURITY VIOLATION: Internal notes exposed to citizen!');
  }
  console.log('Confirmed: internal_notes is NOT exposed in citizen response.');

  // Test 9: Add Citizen Update (Moderator)
  console.log('\n--- Test 9: Citizen Update (Admin/Moderator) ---');
  const res9 = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/updates`,
    data: { message: 'We have received your report and operational assessment is underway.' },
    headers: {
      Cookie: modAuth.cookieHeader,
      'X-XSRF-TOKEN': modAuth.csrfToken
    }
  });
  console.log(`Moderator POST citizen update -> Status: ${res9.status}, Update ID: ${res9.data?.update?.id}`);
  if (res9.status !== 201) throw new Error('Failed to add citizen update');

  // Test 10: Verify Citizen Update IS visible through M5
  console.log('\n--- Test 10: M5 Integration - Citizen Updates Present ---');
  const res10 = await request({
    method: 'GET',
    path: `/api/reports/my/${testRef}`,
    headers: {
      Cookie: ownerAuth.cookieHeader
    }
  });
  const updates = res10.data?.report?.citizen_updates || [];
  console.log(`Citizen updates in M5: ${updates.length}`);
  if (updates.length === 0) throw new Error('Citizen updates were not returned in M5 endpoint');

  // Test 11: Assignment & Role Validation
  console.log('\n--- Test 11: Assignment Validation ---');
  // Attempt to assign to a citizen (must fail)
  const res11a = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/assign`,
    data: { assigned_to_user_id: citizen.id, assignment_note: 'Illegal citizen assignment' },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-XSRF-TOKEN': adminAuth.csrfToken
    }
  });
  console.log(`Assign to Citizen -> Status: ${res11a.status} (Expected: 422)`);
  if (res11a.status !== 422) throw new Error('Assigning citizen was not rejected!');

  // Assign to Moderator
  const res11b = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/assign`,
    data: { assigned_to_user_id: mod.id, assignment_note: 'Assigning to oversight moderator' },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-XSRF-TOKEN': adminAuth.csrfToken
    }
  });
  console.log(`Assign to Moderator -> Status: ${res11b.status}, Assigned to: ${res11b.data?.assigned_to?.name}`);
  if (res11b.status !== 200) throw new Error('Failed to assign to moderator');

  // Test 12: Unassignment
  console.log('\n--- Test 12: Unassignment ---');
  const res12 = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/unassign`,
    data: { reason: 'Re-evaluating team assignment' },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-XSRF-TOKEN': adminAuth.csrfToken
    }
  });
  console.log(`Unassign -> Status: ${res12.status}`);
  if (res12.status !== 200) throw new Error('Failed to unassign');

  // Test 13: Create and Update Referral
  console.log('\n--- Test 13: Referrals ---');
  const res13 = await request({
    method: 'POST',
    path: `/api/admin/incidents/${testRef}/referrals`,
    data: {
      referral_type: 'Public Service Authority',
      organization_name: 'Kenya National Highways Authority',
      reason: 'Road infrastructure maintenance jurisdiction requires authority assessment.'
    },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-XSRF-TOKEN': adminAuth.csrfToken
    }
  });
  console.log(`Create Referral -> Status: ${res13.status}, Referral ID: ${res13.data?.referral?.id}`);
  if (res13.status !== 201) throw new Error('Failed to create referral');

  const referralId = res13.data.referral.id;
  const res13b = await request({
    method: 'PATCH',
    path: `/api/admin/incidents/${testRef}/referrals/${referralId}`,
    data: { status: 'Sent' },
    headers: {
      Cookie: adminAuth.cookieHeader,
      'X-XSRF-TOKEN': adminAuth.csrfToken
    }
  });
  console.log(`Update Referral Status -> Status: ${res13b.status}, New status: ${res13b.data?.result?.status}`);
  if (res13b.status !== 200) throw new Error('Failed to update referral status');

  // Test 14: SQL Injection Safety
  console.log('\n--- Test 14: SQL Injection Resilience ---');
  const sqlInjectionStr = "' OR '1'='1' -- ";
  const res14 = await request({
    method: 'GET',
    path: `/api/admin/incidents?search=${encodeURIComponent(sqlInjectionStr)}`,
    headers: {
      Cookie: adminAuth.cookieHeader
    }
  });
  console.log(`Search with SQL injection string -> Status: ${res14.status}, Total matches: ${res14.data?.pagination?.total}`);
  if (res14.status !== 200) throw new Error('SQL injection query failed or crashed server!');

  console.log('\n>>> All Milestone 7 API Tests Passed Successfully! <<<');
}

runTests().then(() => {
  pool.end();
  process.exit(0);
}).catch((err) => {
  console.error('\nTest failed with error:', err);
  pool.end();
  process.exit(1);
});
