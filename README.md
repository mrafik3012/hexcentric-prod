# Hexcentric Roof Structures P Ltd — Website

**URL:** https://hexcentric.in  
**Stack:** Static HTML5 / CSS3 / Vanilla JS  
**Hosting:** Hostinger (public_html deployment)

---

## Project Structure

```
hexcentric-website/
├── index.html                  Home page
├── about.html                  About page
├── services.html               Services overview (11 sections)
├── projects.html               Case studies + project portfolio
├── contact.html                Contact form + WhatsApp CTA
├── css/
│   └── global.css              Design system, CSS vars, all component styles
├── js/
│   ├── main.js                 Navigation, scroll animations, glassmorphism
│   └── form.js                 Honeypot validation, form submission
├── assets/
│   ├── logo.svg                Hexcentric HC monogram (placeholder — replace with actual)
│   └── images/                 Put client-supplied images here
├── llms.txt                    AI crawler context map (llms.txt standard)
├── llms-full.txt               Extended AI knowledge base
├── robots.txt                  Allows GPTBot, ClaudeBot, Google-Extended, etc.
└── sitemap.xml                 XML sitemap for hexcentric.in
```

---

## Hostinger Deployment Guide

### Step 1 — Prepare Files
Ensure all files are in this folder. No build step is required — this is a pure static site.

### Step 2 — Log in to Hostinger
1. Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Click **Websites** → select your domain (hexcentric.in)
3. Click **Manage** → **File Manager**

### Step 3 — Upload Files
1. In File Manager, navigate to the `public_html` folder
2. Delete the default Hostinger placeholder `index.html` if present
3. Select all files and folders from this project:
   - `index.html`, `about.html`, `services.html`, `projects.html`, `contact.html`
   - `css/` folder
   - `js/` folder
   - `assets/` folder
   - `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`, `.htaccess`
4. Upload using **Upload Files** or drag-and-drop
5. Maintain the same folder structure inside `public_html`

### Step 4 — Verify Upload
Visit `https://hexcentric.in` in a browser. The home page should display.

Check these URLs work:
- `https://hexcentric.in/`
- `https://hexcentric.in/about`
- `https://hexcentric.in/services`
- `https://hexcentric.in/projects`
- `https://hexcentric.in/contact`
- `https://hexcentric.in/sitemap.xml`
- `https://hexcentric.in/robots.txt`
- `https://hexcentric.in/llms.txt`

### Alternative: FTP Upload
If using FTP (FileZilla or similar):
- **Host:** ftp.hexcentric.in (or provided FTP host from Hostinger panel)
- **Username/Password:** From Hostinger panel → Hosting → FTP Accounts
- **Port:** 21
- Upload contents to `/public_html/`

### Alternative: Git Deploy (Hostinger Git)
If Hostinger Git is enabled:
```bash
git init
git remote add origin <your-hostinger-git-remote>
git add .
git commit -m "Initial deploy"
git push origin main
```

---

## Post-Deployment Checklist

- [ ] Replace placeholder Unsplash images with actual project photos (images tagged `data-replace="true"`)
- [ ] Replace `assets/logo.svg` with the official Hexcentric SVG or PNG logo
- [ ] Configure dual-email form in `js/form.js` (Make.com webhook or EmailJS)
- [ ] Set up WordPress blog at `blog.hexcentric.in` for 100+ posts/month
- [ ] Submit sitemap to Google Search Console: `https://hexcentric.in/sitemap.xml`
- [ ] Verify JSON-LD schema at [schema.org validator](https://validator.schema.org/)
- [ ] Test mobile navigation drawer on real device
- [ ] Test contact form submission (end-to-end with webhook configured)
- [ ] Enable HTTPS / SSL in Hostinger panel (free via Let's Encrypt)
- [ ] Enable Gzip/Brotli compression in Hostinger → Optimisation settings (improves Lighthouse score)

---

## Connecting the Contact Form (Dual Email)

On submit, the form sends **two emails**:
1. **To support@hexcentric.com** — structured enquiry with all form fields
2. **To the client** — branded thank-you confirmation

Email is now a **required field** (needed for the client confirmation).

### Option A: Make.com Webhook (Recommended)

1. Create a free account at [make.com](https://www.make.com)
2. Create a scenario: **Webhooks → Custom webhook** (trigger)
3. Add two **Email** modules (or Gmail/SMTP):
   - **Email 1 (admin):** To `{{admin_email}}`, Subject `{{admin_subject}}`, Body type HTML, Content `{{admin_html}}`
   - **Email 2 (client):** To `{{client_email}}`, Subject `{{client_subject}}`, Body type HTML, Content `{{client_html}}`
4. Copy the webhook URL and paste it in `js/form.js`:
   ```js
   const WEBHOOK_URL = 'https://hook.eu1.make.com/YOUR_WEBHOOK_ID';
   ```
5. Test on the live site (webhooks may not work on localhost)

The webhook payload includes pre-built HTML in `admin_html` and `client_html`, plus raw fields in `fields`.

### Option B: EmailJS

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create an email service (Gmail, Outlook, or SMTP for support@hexcentric.com)
3. Create **two templates** — one for admin, one for client — using variables like `{{message_html}}`, `{{name}}`, `{{email}}`
4. Set the constants in `js/form.js`:
   ```js
   const EMAILJS = {
     publicKey: 'your_public_key',
     serviceId: 'your_service_id',
     adminTemplateId: 'template_admin',
     clientTemplateId: 'template_client',
   };
   ```
5. In each EmailJS template, set the "To" field to `{{to_email}}`

### Demo Mode

If neither webhook nor EmailJS is configured, the form simulates success (1.2s delay) and logs the payload to the browser console for testing.

---

## Blog at Scale (100+ Posts/Month)

The current site is **static HTML** — it cannot support 100+ blog posts per month without a CMS.

**Recommended setup: WordPress on a subdomain**

| Item | Detail |
|------|--------|
| URL | `https://blog.hexcentric.in` |
| Platform | WordPress (one-click install on Hostinger) |
| Why | Built-in editor, categories, tags, SEO plugins, scheduling, multiple authors |
| Nav link | Already added to all pages → Blog |

### Hostinger WordPress Setup

1. In hPanel → **Websites** → **Add Website** → **WordPress**
2. Choose subdomain: `blog.hexcentric.in`
3. Install WordPress + enable SSL
4. Install plugins: **Yoast SEO** (or Rank Math), **WP Super Cache**, **Wordfence** (security)
5. Match brand colours: `#C4622D` (copper), `#0D1117` (dark background)
6. Submit `https://blog.hexcentric.in/sitemap_index.xml` to Google Search Console

### Publishing Workflow

- Writers use the WordPress admin panel (`blog.hexcentric.in/wp-admin`)
- Posts publish instantly — no code changes or Hostinger file uploads needed
- At 100+ posts/month, consider **editorial roles** (Author vs Editor) and a **content calendar** plugin

### Alternatives (if not WordPress)

| Platform | Best for |
|----------|----------|
| **Ghost** (`blog.hexcentric.in`) | Clean writing experience, good SEO |
| **Headless CMS** (Sanity, Contentful) | Custom front-end, needs developer for template changes |
| **Medium / LinkedIn** | Easiest, but SEO stays on their domain |

---

## Connecting the Contact Form (Legacy — Single Email)

The form previously ran in **demo mode** (simulated 1.2-second delay → success message). See **Connecting the Contact Form (Dual Email)** above for the current setup.

### Option A: Formspree (Single email only)
1. Sign up at [formspree.io](https://formspree.io) → Create a new form
2. Copy your form endpoint (e.g. `https://formspree.io/f/abcdefgh`)
3. Open `js/form.js` and replace:
   ```js
   const WEBHOOK_URL = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
4. Remove the `'your-webhook-url'` demo check condition

### Option B: EmailJS (No server needed)
1. Sign up at [emailjs.com](https://emailjs.com)
2. Create a service and template
3. Replace the fetch block in `js/form.js` with `emailjs.sendForm(...)` call

### Option C: Custom Webhook (n8n / Make)
Replace `WEBHOOK_URL` with your n8n webhook URL or Make.com webhook URL that sends email notifications.

---

## Tailwind v4 (Optional — For CSS Utility Classes)

The `css/global.css` file contains Tailwind v4 `@theme` configuration. To use Tailwind utility classes in HTML:

### Install Tailwind CLI
```bash
npm install -D tailwindcss@latest @tailwindcss/cli
```

### Compile
```bash
npx @tailwindcss/cli -i css/global.css -o css/output.css --watch
```

Then in HTML files, replace `<link rel="stylesheet" href="css/global.css">` with:
```html
<link rel="stylesheet" href="css/output.css">
```

For the current static build, all styles are implemented as standalone CSS in `global.css` and do not require Tailwind compilation.

---

## Replacing Images

All placeholder images have `data-replace="true"` attribute. Replace Unsplash URLs with:
1. Your own project photos (recommended: upload to `assets/images/`)
2. Compressed WebP format (run through [Squoosh](https://squoosh.app) — target < 150KB per image)
3. Recommended dimensions: Hero 1800×900px, Service cards 600×400px, Case studies 700×480px

---

## Design System Tokens

| Token | Value | Usage |
|---|---|---|
| `--brand-primary` | `#C4622D` | Copper — CTAs, accents, active states |
| `--brand-secondary` | `#4A6274` | Steel blue — panels, borders |
| `--base-950` | `#0D1117` | Page background |
| `--base-900` | `#111820` | Section backgrounds |
| `--base-800` | `#1A2332` | Card/panel backgrounds |
| `--base-700` | `#243041` | Hover/elevated cards |
| `--base-300` | `#8CA0AC` | Body text |
| `--base-100` | `#E8EDF0` | Primary headings |

---

## Browser Support

- Chrome 90+ / Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

IE is not supported.

---

## Accessibility

- WCAG 2.1 AA targeted
- Skip-to-content link on all pages
- All images have descriptive `alt` attributes
- Form fields have associated `<label>` elements
- Interactive elements have `:focus-visible` styles
- ARIA labels on nav, buttons, and decorative icons
- Color contrast ratio ≥ 4.5:1 on all text/background combinations

---

## Performance Notes

- Google Fonts loaded with `preconnect` and `display=swap` (no layout shift)
- Images use `loading="lazy"` for below-fold elements
- All JS loaded with `defer` attribute (non-blocking)
- No third-party JS libraries (pure vanilla JS)
- CSS is a single file reference (no render-blocking cascades)

Target Lighthouse scores:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

*Built by Cursor AI — July 2025*  
*For technical support, contact the web developer.*
