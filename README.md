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
│   ├── form.js                 Honeypot validation, form submission
│   └── lang.js                 EN / Tamil bilingual toggle
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
   - `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`
4. Upload using **Upload Files** or drag-and-drop
5. Maintain the same folder structure inside `public_html`

### Step 4 — Verify Upload
Visit `https://hexcentric.in` in a browser. The home page should display.

Check these URLs work:
- `https://hexcentric.in/`
- `https://hexcentric.in/about.html`
- `https://hexcentric.in/services.html`
- `https://hexcentric.in/projects.html`
- `https://hexcentric.in/contact.html`
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
- [ ] Update form webhook URL in `js/form.js` (line: `const WEBHOOK_URL = '...'`)
  - Recommended: [Formspree](https://formspree.io), [n8n](https://n8n.io), [Make](https://make.com), or [EmailJS](https://emailjs.com)
- [ ] Submit sitemap to Google Search Console: `https://hexcentric.in/sitemap.xml`
- [ ] Verify JSON-LD schema at [schema.org validator](https://validator.schema.org/)
- [ ] Test mobile navigation drawer on real device
- [ ] Test contact form submission (end-to-end with webhook configured)
- [ ] Enable HTTPS / SSL in Hostinger panel (free via Let's Encrypt)
- [ ] Enable Gzip/Brotli compression in Hostinger → Optimisation settings (improves Lighthouse score)

---

## Connecting the Contact Form

The form currently runs in **demo mode** (simulated 1.2-second delay → success message). To connect to a real backend:

### Option A: Formspree (Recommended for simplicity)
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
