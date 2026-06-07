const express = require('express');
const cors = require('cors');
const whois = require('whois');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: '請求過於頻繁，請稍後再試。' }
});
app.use('/api/', limiter);

// WHOIS lookup endpoint
app.get('/api/whois/:domain', (req, res) => {
  const { domain } = req.params;

  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  if (!domainRegex.test(domain)) {
    return res.status(400).json({ error: '無效的網域名稱格式。' });
  }

  whois.lookup(domain, { timeout: 15000 }, (err, data) => {
    if (err) {
      console.error('WHOIS lookup error:', err);
      return res.status(500).json({ error: '查詢失敗，請稍後再試。', details: err.message });
    }

    // Parse key fields from raw WHOIS data
    const parsed = parseWhois(data);

    res.json({
      domain,
      raw: data,
      parsed
    });
  });
});

// Parse common WHOIS fields
function parseWhois(raw) {
  if (!raw) return {};

  const fields = {
    domainName: extractField(raw, ['Domain Name', 'domain name', 'domain']),
    registrar: extractField(raw, ['Registrar', 'registrar']),
    registrarUrl: extractField(raw, ['Registrar URL', 'Registrar Url']),
    createdDate: extractField(raw, ['Creation Date', 'Created Date', 'created', 'Registered On']),
    updatedDate: extractField(raw, ['Updated Date', 'Last Updated On', 'last-modified']),
    expiryDate: extractField(raw, ['Registry Expiry Date', 'Registrar Registration Expiration Date', 'Expiry Date', 'paid-till']),
    nameServers: extractMultiField(raw, ['Name Server', 'nserver']),
    status: extractMultiField(raw, ['Domain Status', 'Status', 'state']),
    registrantOrg: extractField(raw, ['Registrant Organization', 'org', 'Organisation']),
    registrantCountry: extractField(raw, ['Registrant Country', 'country']),
    dnsSec: extractField(raw, ['DNSSEC', 'dnssec']),
  };

  return fields;
}

function extractField(raw, keys) {
  for (const key of keys) {
    const regex = new RegExp(`^${key}:\\s*(.+)$`, 'mi');
    const match = raw.match(regex);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  return null;
}

function extractMultiField(raw, keys) {
  const results = [];
  for (const key of keys) {
    const regex = new RegExp(`^${key}:\\s*(.+)$`, 'gmi');
    let match;
    while ((match = regex.exec(raw)) !== null) {
      const val = match[1].trim();
      if (val && !results.includes(val)) {
        results.push(val);
      }
    }
    if (results.length > 0) break;
  }
  return results.length > 0 ? results : null;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 WHOIS Web App running on port ${PORT}`);
});
