/**
 * Hexcentric Roof Structures — Bilingual EN / Tamil Toggle
 * Translates key UI strings; full page translation requires server-side i18n.
 */

(function () {
  'use strict';

  const TRANSLATIONS = {
    en: {
      nav_home:       'Home',
      nav_about:      'About',
      nav_services:   'Services',
      nav_projects:   'Projects',
      nav_contact:    'Contact',
      nav_cta:        'Request Assessment',
      hero_eyebrow:   'Coimbatore, Tamil Nadu',
      hero_h1:        "Engineered Steel Structures Built for Tamil Nadu's Most Demanding Projects",
      hero_sub:       'From large-span PEB factories and geometric space-frame roofing to mezzanine floors and prefab homes — Hexcentric designs, fabricates, and installs complete structural solutions from our SIDCO facility in Coimbatore.',
      hero_btn1:      'Request a Free Site Assessment',
      hero_btn2:      'View Completed Projects',
      proof_projects: '50+ Projects Delivered',
      proof_steel:    'BIS-Standard Steel',
      proof_delivery: '6–10 Week Delivery',
      proof_comply:   'IS 875 & IS 800 Compliant',
      footer_copy:    '© 2025 Hexcentric Roof Structures P Ltd. All rights reserved.',
    },
    ta: {
      nav_home:       'முகப்பு',
      nav_about:      'எங்களை பற்றி',
      nav_services:   'சேவைகள்',
      nav_projects:   'திட்டங்கள்',
      nav_contact:    'தொடர்பு',
      nav_cta:        'மதிப்பீடு கோரவும்',
      hero_eyebrow:   'கோயம்புத்தூர், தமிழ்நாடு',
      hero_h1:        'தமிழ்நாட்டின் மிகவும் கடினமான திட்டங்களுக்கு வடிவமைக்கப்பட்ட எஃகு கட்டமைப்புகள்',
      hero_sub:       'பெரிய-விரிவான PEB தொழிற்சாலைகள் மற்றும் வடிவியல் விண்வெளி-கட்டமைப்பு கூரைகள் முதல் மேசனைன் தளங்கள் மற்றும் முன்பே தயாரிக்கப்பட்ட வீடுகள் வரை.',
      hero_btn1:      'இலவச தள மதிப்பீடு கோரவும்',
      hero_btn2:      'திட்டங்களைக் காண்க',
      proof_projects: '50+ திட்டங்கள் முடிந்தன',
      proof_steel:    'BIS தரநிலை எஃகு',
      proof_delivery: '6–10 வார விநியோகம்',
      proof_comply:   'IS 875 & IS 800 இணக்கமான',
      footer_copy:    '© 2025 Hexcentric Roof Structures P Ltd. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    },
  };

  let currentLang = localStorage.getItem('hx_lang') || 'en';

  function applyTranslations(lang) {
    const t = TRANSLATIONS[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';

    // Update toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    localStorage.setItem('hx_lang', lang);
    currentLang = lang;
  }

  // Attach click handlers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      applyTranslations(this.dataset.lang);
    });
  });

  // Apply on load
  applyTranslations(currentLang);

})();
