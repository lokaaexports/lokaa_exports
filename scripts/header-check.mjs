import http from 'node:http';

const baseUrl = process.env.HEADER_CHECK_BASE_URL || 'http://localhost:3000'
const urls = [`${baseUrl}/`, `${baseUrl}/admin`, `${baseUrl}/api/health`];

const headersToCheck = [
  'x-frame-options',
  'content-security-policy',
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

function expectedSecure(key) {
  // Expected secure posture (PASS/FAIL is based on these rules, not exact header strings)
  switch (key) {
    case 'x-frame-options':
      return { name: 'x-frame-options', pass: (cur) => cur && !/ALLOWALL/i.test(cur) };
    case 'content-security-policy':
      return { name: 'content-security-policy', pass: (cur) => cur && /frame-ancestors\s+'self'/.test(cur) };
    case 'access-control-allow-origin':
      return { name: 'access-control-allow-origin', pass: (cur) => cur && cur !== '*' };
    case 'access-control-allow-credentials':
      return { name: 'access-control-allow-credentials', pass: (cur) => !cur || /true/i.test(cur) }; // allow missing
    case 'strict-transport-security':
      return {
        name: 'strict-transport-security',
        pass: (cur) => cur && /max-age=/i.test(cur) && /includeSubDomains/i.test(cur),
      };
    case 'x-content-type-options':
      return { name: 'x-content-type-options', pass: (cur) => cur && /nosniff/i.test(cur) };
    case 'referrer-policy':
      return {
        name: 'referrer-policy',
        pass: (cur) => cur && /strict-origin-when-cross-origin/i.test(cur),
      };
    case 'permissions-policy':
      return {
        name: 'permissions-policy',
        pass: (cur) => cur && !/\*/.test(cur),
      };
    default:
      return { name: key, pass: () => false };
  }
}

function fetchHeaders(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve({ url, status: res.statusCode, headers: res.headers });
    });
    req.on('error', (e) => resolve({ url, status: null, error: e.message, headers: {} }));
  });
}

const results = [];
for (const u of urls) {
  // eslint-disable-next-line no-await-in-loop
  const res = await fetchHeaders(u);
  console.log(`\n=== URL: ${res.url} STATUS: ${res.status ?? 'ERROR'} ===`);
  if (res.error) {
    console.log('Request error:', res.error);
    continue;
  }

  for (const h of headersToCheck) {
    const cur = res.headers[h] || '<missing>';
    const rule = expectedSecure(h);
    const pass = rule.pass(cur);

    console.log(h.toUpperCase());
    console.log('Current value:', cur);
    console.log('Expected secure value:', `Rule: ${rule.name} => secure posture`);
    console.log('Status:', pass ? 'PASS' : 'FAIL');
    console.log('');
  }
}
