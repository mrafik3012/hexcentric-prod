/**
 * Hexcentric Roof Structures — Form Handler
 * Sends two emails on submit:
 *   1. Structured enquiry to support@hexcentric.com
 *   2. Branded thank-you note to the client
 *
 * Setup (choose one):
 *   A) Make.com / n8n webhook — set WEBHOOK_URL below (recommended)
 *   B) EmailJS — set EMAILJS_* constants below
 */

(function () {
  'use strict';

  /* ─── Configuration ─────────────────────────────────────────────── */
  const ADMIN_EMAIL = 'support@hexcentric.com';

  // Option A: Make.com or n8n webhook (recommended for dual HTML emails)
  // Create a scenario: Webhook → Send Email (admin) → Send Email (client)
  const WEBHOOK_URL = 'https://hook.eu1.make.com/YOUR_WEBHOOK_ID';

  // Option B: EmailJS (https://www.emailjs.com) — create two templates
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
    peb: 'PEB / Pre-Engineered Building',
    roofing: 'Roofing & Shed Works',
    space_frame: 'Space Frame / Geometric Roof',
    mezzanine: 'Mezzanine Flooring',
    prefab: 'Prefab Home / LGSF',
    multi_storey: 'Multi-Storey Steel Building',
    cladding: 'Cladding & Facade',
    polycarbonate: 'Polycarbonate Roofing',
    tensile: 'Tensile Roofing',
    other: 'Other / Not Sure',
  };

  const PROJECT_SIZE_LABELS = {
    small: 'Small (under 2,000 sq ft)',
    medium: 'Medium (2,000 – 10,000 sq ft)',
    large: 'Large (10,000 – 50,000 sq ft)',
    industrial: 'Industrial (50,000+ sq ft)',
    not_sure: 'Not sure yet',
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

  function validateForm(data) {
    const required = ['name', 'phone', 'email', 'project_type'];
    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        const label = field.replace('_', ' ');
        return `Please fill in the required field: ${label}.`;
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
  function emailShell(title, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:Inter,Arial,sans-serif;color:#E8EDF0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111820;border-radius:12px;border:1px solid #243041;overflow:hidden;">
        <tr><td style="background:#C4622D;padding:20px 28px;">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">Hexcentric Roof Structures</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#fff;">${escapeHtml(title)}</p>
        </td></tr>
        <tr><td style="padding:28px;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 28px;background:#0D1117;border-top:1px solid #243041;">
          <p style="margin:0;font-size:12px;color:#8CA0AC;line-height:1.6;">
            Hexcentric Roof Structures P Ltd · SIDCO, Sundarapuram, Coimbatore – 641021<br>
            +91 80980 99334 · <a href="mailto:${ADMIN_EMAIL}" style="color:#C4622D;">${ADMIN_EMAIL}</a> · <a href="https://hexcentric.in" style="color:#C4622D;">hexcentric.in</a>
          </p>
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
      ['Submitted', new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
      ['Source Page', data.source],
    ];

    const tableRows = rows.map(([k, v]) =>
      `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #243041;color:#8CA0AC;font-size:13px;font-weight:600;width:140px;vertical-align:top;">${escapeHtml(k)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #243041;color:#E8EDF0;font-size:14px;">${escapeHtml(v)}</td>
      </tr>`
    ).join('');

    const details = data.details
      ? `<h3 style="margin:20px 0 8px;font-size:14px;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Project Details</h3>
         <p style="margin:0;font-size:14px;line-height:1.7;color:#E8EDF0;white-space:pre-wrap;">${escapeHtml(data.details)}</p>`
      : '';

    const body = `
      <p style="margin:0 0 16px;font-size:15px;color:#E8EDF0;">A new project enquiry has been submitted via the website contact form.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #243041;border-radius:8px;overflow:hidden;">
        ${tableRows}
      </table>
      ${details}
      <p style="margin:20px 0 0;">
        <a href="mailto:${escapeHtml(data.email)}" style="display:inline-block;background:#C4622D;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">Reply to ${escapeHtml(data.name)}</a>
      </p>`;

    return emailShell('New Project Enquiry', body);
  }

  function buildClientEmail(data) {
    const firstName = data.name.trim().split(/\s+/)[0];
    const projectLabel = label(PROJECT_TYPE_LABELS, data.project_type);

    const body = `
      <p style="margin:0 0 16px;font-size:16px;color:#E8EDF0;">Dear ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#E8EDF0;">
        Thank you for contacting <strong>Hexcentric Roof Structures</strong>. We have received your enquiry regarding <strong>${escapeHtml(projectLabel)}</strong> and our engineering team is reviewing the details.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1A2332;border-radius:8px;border:1px solid #243041;margin:20px 0;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#C4622D;text-transform:uppercase;letter-spacing:0.06em;">Your Submission Summary</p>
          <p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Project:</strong> ${escapeHtml(projectLabel)}</p>
          ${data.location ? `<p style="margin:0 0 6px;font-size:14px;color:#E8EDF0;"><strong>Location:</strong> ${escapeHtml(data.location)}</p>` : ''}
          <p style="margin:0;font-size:14px;color:#E8EDF0;"><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#E8EDF0;">
        <strong>What happens next?</strong><br>
        One of our structural engineers will contact you within <strong>24 business hours</strong> with a preliminary assessment. For urgent enquiries, call us directly at <a href="tel:+918098099334" style="color:#C4622D;">+91 80980 99334</a> or WhatsApp us.
      </p>
      <p style="margin:0;font-size:14px;color:#8CA0AC;line-height:1.7;">
        With regards,<br>
        <strong style="color:#E8EDF0;">Hexcentric Roof Structures P Ltd</strong><br>
        SIDCO, Sundarapuram, Coimbatore
      </p>`;

    return emailShell('Thank You for Your Enquiry', body);
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
      client_subject: 'Thank you — Hexcentric Roof Structures',
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
      client_subject: 'Thank you — Hexcentric Roof Structures',
      admin_html: adminHtml,
      client_html: clientHtml,
      fields: payload,
    };

    setLoading(true);

    try {
      let submitted = false;

      if (isWebhookConfigured()) {
        submitted = await submitViaWebhook(webhookPayload);
      } else if (isEmailJsConfigured()) {
        submitted = await submitViaEmailJs(payload, adminHtml, clientHtml);
      } else {
        // Demo mode — log payload for developer setup
        console.info('[Hexcentric Form] Configure WEBHOOK_URL or EMAILJS in js/form.js');
        console.info('[Hexcentric Form] Admin email preview:', webhookPayload);
        await new Promise(res => setTimeout(res, 1200));
        submitted = true;
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
