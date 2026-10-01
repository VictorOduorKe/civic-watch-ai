const BASE_URL = 'http://localhost:5000/api';

async function runAttachmentTests() {
  console.log('====================================================');
  console.log(' CIVICWATCH AI KENYA — M5 ATTACHMENT SECURITY TESTS');
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

  // Session helper
  async function createSession(name, county) {
    const ts = Date.now();
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

    // CSRF
    const csrfRes = await fetch(`${BASE_URL}/auth/csrf-token`);
    saveCookies(csrfRes.headers);

    // Register
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; '),
        'X-XSRF-TOKEN': csrfToken
      },
      body: JSON.stringify({
        fullName: name,
        email: `${name.toLowerCase().replace(/\s+/g, '_')}_${ts}@civicwatch.ke`,
        phone: '+254711' + String(ts).slice(-6),
        password: 'Password123!',
        confirmPassword: 'Password123!',
        county,
        nationalId: String(ts).slice(-8),
        termsAccepted: true
      })
    });
    saveCookies(regRes.headers);
    const regData = await regRes.json();
    if (regRes.status !== 201) console.log(`${name} register failed:`, regRes.status, regData);
    assert(regRes.status === 201 && regData.success, `${name} registered successfully`);

    return {
      get: async (ep) => {
        const res = await fetch(`${BASE_URL}${ep}`, {
          headers: {
            'Cookie': cookies.join('; ')
          }
        });
        saveCookies(res.headers);
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : await res.text();
        return { status: res.status, headers: res.headers, data };
      },
      postForm: async (ep, formData) => {
        const res = await fetch(`${BASE_URL}${ep}`, {
          method: 'POST',
          headers: {
            'Cookie': cookies.join('; '),
            'X-XSRF-TOKEN': csrfToken
          },
          body: formData
        });
        saveCookies(res.headers);
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : await res.text();
        return { status: res.status, headers: res.headers, data };
      }
    };
  }

  // 1. Create User 1 (Owner) and User 2 (Attacker)
  const owner = await createSession('DocOwner', 'Nakuru');
  const attacker = await createSession('AttackerUser', 'Kisumu');

  // 2. Submit report with a real PDF attachment
  const catRes = await owner.get('/reports/categories');
  const catId = catRes.data.categories[0].id;

  const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Title (Civil Incident Evidence) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF';
  const fd = new FormData();
  fd.append('category_id', String(catId));
  fd.append('title', 'Tarmac Road Crater With Attached PDF Evidence');
  fd.append('description', 'Evidence photo dossier attached showing physical depth of crater on tarmac.');
  fd.append('county', 'Nakuru');
  fd.append('is_anonymous', 'false');
  fd.append('attachments', new Blob([pdfContent], { type: 'application/pdf' }), 'road_crater_evidence.pdf');

  const reportRes = await owner.postForm('/reports', fd);
  assert(reportRes.status === 201 && reportRes.data.success, 'Report with PDF attachment submitted successfully');
  const reference = reportRes.data.report.reference;
  console.log(`    -> Submitted reference: ${reference}`);

  // 3. Owner retrieves report details
  const detailRes = await owner.get(`/reports/my/${reference}`);
  assert(detailRes.status === 200, 'Owner retrieved report details');
  const attachments = detailRes.data.report.attachments;
  assert(Array.isArray(attachments) && attachments.length === 1, 'Report has exactly 1 attachment metadata');
  assert(attachments[0].original_name === 'road_crater_evidence.pdf', 'Original filename is preserved');
  assert(attachments[0].mime_type === 'application/pdf', 'MIME type is application/pdf');
  assert(!attachments[0].storage_path && !attachments[0].stored_name, 'Server storage path is not exposed');
  const attachmentId = attachments[0].id;

  // 4. Owner downloads own attachment
  const downloadRes = await owner.get(`/reports/my/${reference}/attachments/${attachmentId}`);
  assert(downloadRes.status === 200, 'Owner successfully downloaded own attachment');
  assert(downloadRes.data === pdfContent, 'Downloaded file bytes match uploaded PDF content exactly');

  // 5. Attacker attempts to download Owner's attachment
  const attackDownload = await attacker.get(`/reports/my/${reference}/attachments/${attachmentId}`);
  assert(attackDownload.status === 404, 'Attacker requesting Owner attachment receives 404 (Complete ownership chain enforced)');

  // 6. Test invalid attachment ID
  const invalidAttRes = await owner.get(`/reports/my/${reference}/attachments/999999`);
  assert(invalidAttRes.status === 404, 'Non-existent attachment ID receives 404');

  // 7. Verify regression: unauthenticated attachment access
  const unauthRes = await fetch(`${BASE_URL}/reports/my/${reference}/attachments/${attachmentId}`);
  assert(unauthRes.status === 401, 'Unauthenticated attachment access rejected with 401');

  console.log('\n====================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runAttachmentTests();
