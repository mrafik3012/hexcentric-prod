/**
 * Hexcentric Roof Structures — Form Handler
 * Handles: Honeypot validation, form submission, inline alert
 */

(function () {
  'use strict';

  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const alertSuccess = document.getElementById('form-success');
  const alertError   = document.getElementById('form-error');
  const submitBtn    = form.querySelector('[type="submit"]');

  function showAlert(el, message) {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
    if (message && el) el.querySelector('span') && (el.querySelector('span').textContent = message);
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

  function validateForm(data) {
    const required = ['name', 'phone', 'project_type'];
    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        return `Please fill in the required field: ${field.replace('_', ' ')}.`;
      }
    }
    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        return 'Please enter a valid email address.';
      }
    }
    if (data.phone) {
      const digits = data.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        return 'Please enter a valid phone number (at least 10 digits).';
      }
    }
    return null;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Honeypot check
    if (data.website_hp && data.website_hp.trim() !== '') {
      // Silent fail for bots
      showAlert(alertSuccess, '✓ Your enquiry has been submitted successfully! We will contact you within 24 hours.');
      form.reset();
      return;
    }

    // Validation
    const validationError = validateForm(data);
    if (validationError) {
      showAlert(alertError, validationError);
      return;
    }

    setLoading(true);

    // Remove honeypot from payload
    delete data.website_hp;

    // Construct payload
    const payload = {
      ...data,
      source: window.location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      // Replace the URL below with your actual webhook (e.g. n8n, Make, Formspree)
      const WEBHOOK_URL = 'https://your-webhook-url.com/hexcentric-enquiry';

      // Try to submit; if no webhook configured, simulate success
      let submitted = false;
      if (WEBHOOK_URL && !WEBHOOK_URL.includes('your-webhook-url')) {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        submitted = response.ok;
      } else {
        // Demo mode — simulate delay
        await new Promise(res => setTimeout(res, 1200));
        submitted = true;
      }

      if (submitted) {
        showAlert(alertSuccess, '✓ Thank you! Your enquiry has been submitted. Our team will contact you within 24 business hours.');
        form.reset();
        // Track conversion (if analytics configured)
        if (typeof gtag === 'function') {
          gtag('event', 'form_submit', { event_category: 'Lead', event_label: data.project_type });
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      showAlert(alertError, '✗ Something went wrong. Please call us directly at +91 80980 99334 or email support@hexcentric.in');
    } finally {
      setLoading(false);
    }
  });

})();
