/**
 * Hexcentric Roof Structures — Form Handler
 * Sends two emails on submit:
 *   1. Structured enquiry to support@hexcentric.in
 *   2. Premium branded confirmation to the client
 *
 * Backends (tried in order):
 *   A) PHP API at /api/contact.php (Hostinger — default)
 *   B) Make.com / n8n webhook — set WEBHOOK_URL below
 *   C) EmailJS — set EMAILJS_* constants below
 */

(function () {
  'use strict';

  /* ─── Configuration ─────────────────────────────────────────────── */
  const ADMIN_EMAIL = 'support@hexcentric.in';
  const SITE_URL = 'https://hexcentric.in';
  const API_ENDPOINT = '/api/contact.php';

  // Option B: Make.com or n8n webhook
  const WEBHOOK_URL = 'https://hook.eu1.make.com/YOUR_WEBHOOK_ID';

  // Option C: EmailJS (https://www.emailjs.com)
  const EMAILJS = {
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    adminTemplateId: 'YOUR_ADMIN_TEMPLATE_ID',
    clientTemplateId: 'YOUR_CLIENT_TEMPLATE_ID',
  };

  /* ─── DOM refs ────────────────────────────────────────────────────── */
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const alertSuccess = document.getElementById('form-success');
  const alertError   = document.getElementById('form-error');
  const submitBtn    = form.querySelector('[type="submit"]');

  const PROJECT_TYPE_LABELS = {
    'structural-fabrication': 'Structural Fabrication (Geometric / Space Frame)',
    'peb-buildings': 'PEB Building',
    'roofing-shed-works': 'Industrial Roofing / Shed Works',
    'multi-storey-buildings': 'Multi-Storey Steel Building',
    'mezzanine-flooring': 'Mezzanine Flooring',
    'prefab-homes': 'Prefab / LGSF Home',
    'polycarbonate-roofing': 'Polycarbonate Roofing',
    'tensile-roofing': 'Tensile / Fabric Roofing',
    'upvc-roofing': 'UPVC Roofing',
    'aluminium-roofing': 'Aluminium Roofing',
    'cladding-works': 'Cladding / Building Envelope',
  };

  const PROJECT_SIZE_LABELS = {
    'under-2000': 'Under 2,000 sq ft',
    '2000-10000': '2,000 – 10,000 sq ft',
    '10000-30000': '10,000 – 30,000 sq ft',
    '30000-100000': '30,000 – 1,00,000 sq ft',
    'over-100000': 'Over 1,00,000 sq ft',
    'unsure': 'Not sure yet',
  };

  const SERVICE_LINKS = {
    'structural-fabrication': '/services#structural-fabrication',
    'peb-buildings': '/services#peb-buildings',
    'roofing-shed-works': '/services#roofing-shed-works',
    'multi-storey-buildings': '/services#multi-storey-buildings',
    'mezzanine-flooring': '/services#mezzanine-flooring',
    'prefab-homes': '/services#prefab-homes',
    'polycarbonate-roofing': '/services#polycarbonate-roofing',
    'tensile-roofing': '/services#tensile-roofing',
    'upvc-roofing': '/services#upvc-roofing',
    'aluminium-roofing': '/services#aluminium-roofing',
    'cladding-works': '/services#cladding-works',
  };

  /* ─── Helpers ───────────────────────────────────────────────────── */
  function showAlert(el, message) {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
    const span = el?.querySelector('span');
    if (message && span) span.textContent = message;
    el?.classList.add('show');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlerts() {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Sending…' : 'Submit Enquiry';
    if (!loading) {
      submitBtn.innerHTML = 'Submit Enquiry <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    }
  }

  function label(map, key) {
    return map[key] || key || '—';
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTimestamp(iso) {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      }) + ' IST';
    } catch {
      return iso;
    }
  }

  function validateForm(data) {
    const required = ['name', 'phone', 'email', 'project_type'];
    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        const fieldLabel = field.replace(/_/g, ' ');
        return `Please fill in the required field: ${fieldLabel}.`;
      }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (data.phone) {
      const digits = data.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        return 'Please enter a valid phone number (at least 10 digits).';
      }
    }
    return null;
  }

  /* ─── Email HTML builders ───────────────────────────────────────── */
  function emailShell(title, bodyHtml, preheader) {
    const preheaderHtml = preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>`
      : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0D1117;font-family:Inter,Arial,Helvetica,sans-serif;color:#E8EDF0;-webkit-font-smoothing:antialiased;">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111820;border-radius:12px;border:1px solid #243041;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#C4622D 0%,#A04E22 100%);padding:24px 28px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Hexcentric Roof Structures</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fff;line-height:1.3;">${escapeHtml(title)}</p>
        </td></tr>
        <tr><td style="padding:28px;">${bodyHtml}</td></tr>
        <tr><td style="padding:20px 28px;background:#0D1117;border-top:1px solid #243041;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;color:#8CA0AC;line-height:1.7;">
                <strong style="color:#E8EDF0;">Hexcentric Roof Structures P Ltd</strong><br>
                169-D, Chettiyar Thottam, SIDCO, Sundarapuram<br>
                Coimbatore – 641021, Tamil Nadu, India<br>
                <a href="tel:+918098099334" style="color:#C4622D;text-decoration:none;">+91 80980 99334</a> ·
                <a href="mailto:${ADMIN_EMAIL}" style="color:#C4622D;text-decoration:none;">${ADMIN_EMAIL}</a> ·
                <a href="${SITE_URL}" style="color:#C4622D;text-decoration:none;">hexcentric.in</a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  function buildAdminEmail(data) {
    const rows = [
      ['Full Name', data.name],
      ['Company', data.company || '—'],
      ['Phone', data.phone],
      ['Email', data.email],
      ['Project Type', label(PROJECT_TYPE_LABELS, data.project_type)],
      ['Project Size', label(PROJECT_SIZE_LABELS, data.project_size)],
      ['Location', data.location || '—'],
      ['Submitted', formatTimestamp(data.timestamp)],
      ['Source Page', data.source],
    ];

    const tableRows = rows.map(([k, v]) =>
      `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #243041;color:#8CA0AC;font-size:13px;font-weight:600;width:140px;vertical-align:top;">${escapeHtml(k)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #243041;color:#E8EDF0;font-size:14px;">${escapeHtml(v)}</td>
      </tr>`
    ).join('');

    const details = data.details
      ? `<h3 style="margin:24px 0 10px;font-size:13px;color:#C4622D;text-transform:uppercase;letter-spacing:0.08em;">Project Details</h3>
         <div style="background:#1A2332;border:1px solid #243041;border-radius:8px;padding:16px;">
           <p style="margin:0;font-size:14px;line-height:1.75;color:#E8EDF0;white-space:pre-wrap;">${escapeHtml(data.details)}</p>
         </div>`
      : '';

    const phoneDigits = data.phone.replace(/\D/g, '');
    const waLink = `https://wa.me/91${phoneDigits.slice(-10)}`;

    const body = `
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C4622D;">New Lead</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#E8EDF0;">A new project enquiry has been submitted via the website contact form.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #243041;border-radius:8px;overflow:hidden;">
        ${tableRows}
      </table>
      ${details}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
          <td style="padding-right:10px;">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re%3A%20Your%20Hexcentric%20Enquiry" style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;">Reply via Email</a>
          </td>
          <td style="padding-right:10px;">
            <a href="tel:${escapeHtml(phoneDigits)}" style="display:inline-block;background:#1A2332;color:#E8EDF0;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;border:1px solid #243041;">Call ${escapeHtml(data.name.split(' ')[0])}</a>
          </td>
          <td>
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;">WhatsApp</a>
          </td>
        </tr>
      </table>`;

    return emailShell('New Project Enquiry', body, `New enquiry from ${data.name} — ${label(PROJECT_TYPE_LABELS, data.project_type)}`);
  }

  function buildClientEmail(data) {
    const firstName = data.name.trim().split(/\s+/)[0];
    const projectLabel = label(PROJECT_TYPE_LABELS, data.project_type);
    const sizeLabel = label(PROJECT_SIZE_LABELS, data.project_size);
    const serviceLink = SERVICE_LINKS[data.project_type] || '/services';
    const referenceId = 'HX-' + Date.now().toString(36).toUpperCase().slice(-6);

    const summaryRows = [
      ['Reference', referenceId],
      ['Name', data.name],
      ...(data.company ? [['Company', data.company]] : []),
      ['Project Type', projectLabel],
      ...(data.project_size ? [['Project Size', sizeLabel]] : []),
      ...(data.location ? [['Location', data.location]] : []),
      ['Phone', data.phone],
      ['Email', data.email],
    ];

    const summaryTable = summaryRows.map(([k, v]) =>
      `<tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#8CA0AC;font-size:13px;width:130px;vertical-align:top;">${escapeHtml(k)}</td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#E8EDF0;font-size:14px;font-weight:500;">${escapeHtml(v)}</td>
      </tr>`
    ).join('');

    const detailsBlock = data.details
      ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
           <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Your Project Brief</p>
           <p style="margin:0;font-size:14px;line-height:1.7;color:#B8C5CE;white-space:pre-wrap;">${escapeHtml(data.details)}</p>
         </div>`
      : '';

    const body = `
      <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#E8EDF0;">Dear ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#B8C5CE;">
        Thank you for choosing <strong style="color:#E8EDF0;">Hexcentric Roof Structures</strong>. Your enquiry for <strong style="color:#C4622D;">${escapeHtml(projectLabel)}</strong> has been received and assigned to our structural engineering team.
      </p>

      <!-- Submission summary card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A2332;border-radius:10px;border:1px solid #243041;margin-bottom:24px;">
        <tr><td style="padding:22px 24px;">
          <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.08em;">Your Enquiry Summary</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${summaryTable}</table>
          ${detailsBlock}
        </td></tr>
      </table>

      <!-- What happens next timeline -->
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.08em;">What Happens Next</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:12px 0;vertical-align:top;width:36px;">
            <div style="width:28px;height:28px;background:#C4622D;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#fff;">1</div>
          </td>
          <td style="padding:12px 0 12px 8px;vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#E8EDF0;">Engineering Review</p>
            <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#8CA0AC;">Our team reviews your project requirements and site details.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;vertical-align:top;width:36px;">
            <div style="width:28px;height:28px;background:#243041;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#C4622D;">2</div>
          </td>
          <td style="padding:12px 0 12px 8px;vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#E8EDF0;">Personal Callback</p>
            <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#8CA0AC;">A structural engineer calls you within <strong style="color:#E8EDF0;">24 business hours</strong> with a preliminary assessment.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;vertical-align:top;width:36px;">
            <div style="width:28px;height:28px;background:#243041;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#C4622D;">3</div>
          </td>
          <td style="padding:12px 0 12px 8px;vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#E8EDF0;">Free Site Assessment</p>
            <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#8CA0AC;">We schedule an on-site visit and deliver a detailed proposal — completely free, no obligation.</p>
          </td>
        </tr>
      </table>

      <!-- Trust signals -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;border-radius:8px;border:1px solid #243041;margin-bottom:24px;">
        <tr>
          <td style="padding:16px;text-align:center;width:33%;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#C4622D;">15+</p>
            <p style="margin:4px 0 0;font-size:11px;color:#8CA0AC;text-transform:uppercase;letter-spacing:0.05em;">Years Experience</p>
          </td>
          <td style="padding:16px;text-align:center;width:33%;border-left:1px solid #243041;border-right:1px solid #243041;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#C4622D;">500+</p>
            <p style="margin:4px 0 0;font-size:11px;color:#8CA0AC;text-transform:uppercase;letter-spacing:0.05em;">Projects Delivered</p>
          </td>
          <td style="padding:16px;text-align:center;width:33%;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#C4622D;">24hr</p>
            <p style="margin:4px 0 0;font-size:11px;color:#8CA0AC;text-transform:uppercase;letter-spacing:0.05em;">Response Time</p>
          </td>
        </tr>
      </table>

      <!-- CTA buttons -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <a href="https://wa.me/918098099334?text=Hi%20Hexcentric%2C%20I%20submitted%20enquiry%20${escapeHtml(referenceId)}%20for%20${encodeURIComponent(projectLabel)}.%20Please%20share%20an%20update." style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;width:80%;text-align:center;">Chat on WhatsApp</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <a href="tel:+918098099334" style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:700;width:80%;text-align:center;">Call +91 80980 99334</a>
          </td>
        </tr>
        <tr>
          <td align="center">
            <a href="${SITE_URL}${serviceLink}" style="display:inline-block;background:#1A2332;color:#E8EDF0;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;border:1px solid #243041;width:80%;text-align:center;">Explore ${escapeHtml(projectLabel)}</a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;line-height:1.7;color:#8CA0AC;">
        Need to add more details? Simply reply to this email or WhatsApp us — reference <strong style="color:#E8EDF0;">${escapeHtml(referenceId)}</strong> for faster assistance.
      </p>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#B8C5CE;">
        With regards,<br>
        <strong style="color:#E8EDF0;">Team Hexcentric</strong><br>
        Structural Fabrication Specialists · Coimbatore
      </p>`;

    return emailShell(
      'Your Enquiry is Confirmed',
      body,
      `${firstName}, your ${projectLabel} enquiry is confirmed. Our team will call you within 24 hours.`
    );
  }

  /* ─── Submission backends ───────────────────────────────────────── */
  function isWebhookConfigured() {
    return WEBHOOK_URL && !WEBHOOK_URL.includes('YOUR_WEBHOOK');
  }

  function isEmailJsConfigured() {
    return EMAILJS.publicKey && !EMAILJS.publicKey.includes('YOUR_')
      && EMAILJS.serviceId && !EMAILJS.serviceId.includes('YOUR_')
      && EMAILJS.adminTemplateId && !EMAILJS.adminTemplateId.includes('YOUR_')
      && EMAILJS.clientTemplateId && !EMAILJS.clientTemplateId.includes('YOUR_');
  }

  async function submitViaApi(webhookPayload) {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Server error (${response.status})`);
    }

    return true;
  }

  async function submitViaWebhook(payload) {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  }

  async function submitViaEmailJs(data, adminHtml, clientHtml) {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS SDK not loaded');
    }

    emailjs.init(EMAILJS.publicKey);

    const templateParams = {
      admin_email: ADMIN_EMAIL,
      client_email: data.email,
      admin_subject: `New Enquiry — ${data.name} (${label(PROJECT_TYPE_LABELS, data.project_type)})`,
      client_subject: 'Your Enquiry is Confirmed — Hexcentric Roof Structures',
      admin_html: adminHtml,
      client_html: clientHtml,
      reply_to: data.email,
      name: data.name,
      company: data.company || '',
      phone: data.phone,
      email: data.email,
      project_type: label(PROJECT_TYPE_LABELS, data.project_type),
      project_size: label(PROJECT_SIZE_LABELS, data.project_size),
      location: data.location || '',
      details: data.details || '',
      source: data.source,
      timestamp: data.timestamp,
    };

    await emailjs.send(EMAILJS.serviceId, EMAILJS.adminTemplateId, {
      ...templateParams,
      to_email: ADMIN_EMAIL,
      message_html: adminHtml,
    });

    await emailjs.send(EMAILJS.serviceId, EMAILJS.clientTemplateId, {
      ...templateParams,
      to_email: data.email,
      message_html: clientHtml,
    });

    return true;
  }

  /* ─── Form submit handler ───────────────────────────────────────── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Honeypot — silent success for bots
    if (data.website_hp && data.website_hp.trim() !== '') {
      showAlert(alertSuccess, '✓ Thank you! Your enquiry has been submitted. Our team will contact you within 24 business hours.');
      form.reset();
      return;
    }

    const validationError = validateForm(data);
    if (validationError) {
      showAlert(alertError, validationError);
      return;
    }

    delete data.website_hp;

    const payload = {
      ...data,
      project_type_label: label(PROJECT_TYPE_LABELS, data.project_type),
      project_size_label: label(PROJECT_SIZE_LABELS, data.project_size),
      source: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const adminHtml = buildAdminEmail(payload);
    const clientHtml = buildClientEmail(payload);

    const webhookPayload = {
      admin_email: ADMIN_EMAIL,
      client_email: payload.email,
      admin_subject: `New Enquiry — ${payload.name} (${payload.project_type_label})`,
      client_subject: 'Your Enquiry is Confirmed — Hexcentric Roof Structures',
      admin_html: adminHtml,
      client_html: clientHtml,
      fields: payload,
    };

    setLoading(true);

    try {
      let submitted = false;

      // Try PHP API first (Hostinger default)
      try {
        submitted = await submitViaApi(webhookPayload);
      } catch (apiErr) {
        console.warn('[Hexcentric Form] API unavailable, trying fallback:', apiErr.message);

        if (isWebhookConfigured()) {
          submitted = await submitViaWebhook(webhookPayload);
        } else if (isEmailJsConfigured()) {
          submitted = await submitViaEmailJs(payload, adminHtml, clientHtml);
        } else {
          throw apiErr;
        }
      }

      if (submitted) {
        showAlert(alertSuccess, '✓ Thank you! Your enquiry has been submitted. A confirmation has been sent to your email. Our team will contact you within 24 business hours.');
        form.reset();
        if (typeof gtag === 'function') {
          gtag('event', 'form_submit', { event_category: 'Lead', event_label: payload.project_type });
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error('[Hexcentric Form]', err);
      showAlert(alertError, `✗ Something went wrong. Please call us at +91 80980 99334 or email ${ADMIN_EMAIL}`);
    } finally {
      setLoading(false);
    }
  });

})();
