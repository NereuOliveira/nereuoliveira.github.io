(function ($) {
  'use strict';

  var themeStorageKey = 'preferred-theme';
  var languageStorageKey = 'preferred-language';
  var supportedLanguages = ['en', 'pt-br', 'es'];
  var localeMap = {
    en: 'en-CA',
    'pt-br': 'pt-BR',
    es: 'es-ES'
  };
  var languageLabelMap = {
    en: 'EN',
    'pt-br': 'PT',
    es: 'ES'
  };

  var i18nData = window.__I18N__ || {};
  var root = document.documentElement;
  var mainSections = document.querySelector('.main-sections');
  var toggleButton = document.getElementById('themeToggle');
  var toggleIcon = toggleButton ? toggleButton.querySelector('.theme-toggle-icon i') : null;
  var languageToggle = document.getElementById('languageToggle');
  var currentLanguageLabel = document.getElementById('currentLangLabel');
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var currentLanguage = 'en';
  var i18nDebug = false;
  var skillsState = {
    activeTier: 'all'
  };
  var skillTierOrder = ['core', 'advanced', 'working'];

  function debugLog() {
    if (!i18nDebug || !window.console || typeof window.console.log !== 'function') {
      return;
    }
    window.console.log.apply(window.console, arguments);
  }

  function normalizeLanguage(language) {
    if (!language) {
      return 'en';
    }
    var candidate = String(language).toLowerCase();
    if (candidate === 'pt' || candidate.indexOf('pt-') === 0) {
      return 'pt-br';
    }
    if (candidate === 'es' || candidate.indexOf('es-') === 0) {
      return 'es';
    }
    if (candidate === 'en' || candidate.indexOf('en-') === 0) {
      return 'en';
    }
    return supportedLanguages.indexOf(candidate) >= 0 ? candidate : 'en';
  }

  function getNestedValue(source, path) {
    if (!source || !path) {
      return '';
    }
    return path.split('.').reduce(function (acc, key) {
      return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : null;
    }, source);
  }

  function getLocaleData(language) {
    return i18nData[language] || i18nData.en || null;
  }

  function getTranslation(path, fallback) {
    var locale = getLocaleData(currentLanguage);
    var value = getNestedValue(locale, path);
    if (typeof value === 'string') {
      return value;
    }
    return fallback || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMonthYear(dateValue) {
    if (!dateValue) {
      return '';
    }
    var date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    var formatter = new Intl.DateTimeFormat(localeMap[currentLanguage] || 'en-CA', {
      month: 'short',
      year: 'numeric'
    });
    return formatter.format(date);
  }

  function formatYear(dateValue) {
    if (!dateValue) {
      return '';
    }
    var date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return String(date.getFullYear());
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(themeStorageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      // Ignore storage write errors in private mode or restricted contexts.
    }
  }

  function getSavedLanguage() {
    try {
      return localStorage.getItem(languageStorageKey);
    } catch (error) {
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(languageStorageKey, language);
    } catch (error) {
      // Ignore storage write errors in private mode or restricted contexts.
    }
  }

  function resolveInitialTheme() {
    var savedTheme = getSavedTheme();
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return mediaQuery.matches ? 'dark' : 'light';
  }

  function resolveInitialLanguage() {
    var savedLanguageRaw = getSavedLanguage();
    var savedLanguage = normalizeLanguage(savedLanguageRaw);
    if (savedLanguageRaw && supportedLanguages.indexOf(savedLanguage) >= 0) {
      return savedLanguage;
    }
    return normalizeLanguage(navigator.language || 'en');
  }

  function updateToggleUi(theme) {
    if (!toggleButton) {
      return;
    }
    var nextTheme = theme === 'dark' ? 'light' : 'dark';
    var toggleLabel = nextTheme === 'light'
      ? getTranslation('common.switch_to_light', 'Switch to light mode')
      : getTranslation('common.switch_to_dark', 'Switch to dark mode');

    toggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
    toggleButton.setAttribute('aria-label', toggleLabel);
    toggleButton.setAttribute('title', toggleLabel);

    if (toggleIcon) {
      toggleIcon.classList.toggle('fa-moon-o', theme !== 'dark');
      toggleIcon.classList.toggle('fa-sun-o', theme === 'dark');
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    updateToggleUi(theme);
  }

  function updateLanguageUi(language) {
    if (currentLanguageLabel) {
      currentLanguageLabel.textContent = languageLabelMap[language] || 'EN';
    }

    if (languageToggle) {
      languageToggle.setAttribute('aria-label', getTranslation('nav.language', 'Language'));
      languageToggle.setAttribute('title', getTranslation('nav.language', 'Language'));
    }

    document.querySelectorAll('.lang-option').forEach(function (option) {
      var isActive = option.getAttribute('data-lang') === language;
      option.classList.toggle('active', isActive);
      if (isActive) {
        option.setAttribute('aria-current', 'true');
      } else {
        option.removeAttribute('aria-current');
      }
    });
  }

  function updateDotLabels() {
    var goToTemplate = getTranslation('common.go_to_section', 'Go to {section} section');

    document.querySelectorAll('.section-dots .dot-link').forEach(function (dot) {
      var section = dot.getAttribute('data-section');
      var sectionLabel = getTranslation('sections.' + section, section);
      dot.dataset.tooltip = sectionLabel;
      dot.setAttribute('aria-label', goToTemplate.replace('{section}', sectionLabel));
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
      var key = element.getAttribute('data-i18n-aria-label');
      var value = getTranslation(key, '');
      if (value) {
        element.setAttribute('aria-label', value);
      }
    });
  }

  function renderExperience() {
    var locale = getLocaleData(currentLanguage);
    var items = locale && Array.isArray(locale.experience) ? locale.experience : [];
    var target = document.getElementById('experienceList');

    if (!target) {
      return;
    }

    var presentLabel = getTranslation('common.present', 'Present');
    var html = items.map(function (item) {
      var highlights = Array.isArray(item.highlights) ? item.highlights : [];
      var list = highlights
        .map(function (entry) {
          return '<li>' + escapeHtml(entry) + '</li>';
        })
        .join('');

      var start = formatMonthYear(item.start_date);
      var end = item.end_date ? formatMonthYear(item.end_date) : presentLabel;
      var companyLine = [item.company, item.country].filter(Boolean).join(', ');

      return '' +
        '<div class="resume-item modern-card d-flex flex-column flex-md-row mb-4 reveal-card is-visible">' +
        '  <div class="resume-content mr-auto">' +
        '    <h3 class="mb-0">' + escapeHtml(item.position || '') + '</h3>' +
        '    <div class="subheading mb-3">' + escapeHtml(companyLine) + '</div>' +
        '    <ul class="mb-0 pl-3">' + list + '</ul>' +
        '  </div>' +
        '  <div class="resume-date text-md-right">' +
        '    <span class="text-primary">' + escapeHtml(start + ' - ' + end) + '</span>' +
        '  </div>' +
        '</div>';
    }).join('');

    target.innerHTML = html;
  }

  function renderEducation() {
    var locale = getLocaleData(currentLanguage);
    var items = locale && Array.isArray(locale.education) ? locale.education : [];
    var target = document.getElementById('educationList');

    if (!target) {
      return;
    }

    var logoAltTemplate = getTranslation('education_ui.logo_alt_template', 'Logo of {institution}');
    var badgesAriaLabel = getTranslation('education_ui.badges_label', 'Education badges');

    var html = items.map(function (item) {
      var start = formatYear(item.start_date);
      var end = formatYear(item.end_date);
      var countryLine = item.country ? ', ' + escapeHtml(item.country) : '';
      var programBlurb = String(item.program_blurb || '').trim();
      var logoAlt = logoAltTemplate.replace('{institution}', item.institution || '');
      var logoDark = item.institution_logo_dark ? String(item.institution_logo_dark).trim() : '';
      var logoHtml = item.institution_logo
        ? '<div class="education-logo-wrap">' +
          '<img class="education-logo education-logo--light" src="' + escapeHtml(item.institution_logo) + '" alt="' + escapeHtml(logoAlt) + '">' +
          (logoDark ? '<img class="education-logo education-logo--dark" src="' + escapeHtml(logoDark) + '" alt="' + escapeHtml(logoAlt) + '">' : '') +
          '</div>'
        : '';
      var badgeHtml = '';
      var blurbHtml = programBlurb
        ? '<p class="education-program-blurb">' + escapeHtml(programBlurb) + '</p>'
        : '';

      if (item.credential_tag || item.equivalency_tag) {
        badgeHtml = '<div class="education-badges" aria-label="' + escapeHtml(badgesAriaLabel) + '">' +
          (item.credential_tag ? '<span class="education-badge">' + escapeHtml(item.credential_tag) + '</span>' : '') +
          (item.equivalency_tag ? '<span class="education-badge education-badge-alt">' + escapeHtml(item.equivalency_tag) + '</span>' : '') +
          '</div>';
      }

      return '' +
        '<article class="education-timeline-item reveal-card is-visible">' +
        '  <div class="education-rail" aria-hidden="true">' +
        '    <span class="education-marker-dot"></span>' +
        '    <div class="education-rail-date">' + escapeHtml(start + '-' + end) + '</div>' +
        '  </div>' +
        '  <div class="education-card">' +
        '    <div class="education-card-header">' +
        '      ' + logoHtml +
        '      <div class="education-title-wrap">' +
        '        <h3 class="mb-0">' + escapeHtml(item.course || '') + '</h3>' +
        '        <div class="subheading mb-0">' + escapeHtml(item.institution || '') + countryLine + '</div>' +
        '      </div>' +
        '    </div>' +
        '    ' + blurbHtml +
        '    ' + badgeHtml +
        '  </div>' +
        '</article>';
    }).join('');

    target.innerHTML = html;
  }

  function normalizeSkillTier(tier) {
    var value = String(tier || '').toLowerCase();
    return skillTierOrder.indexOf(value) >= 0 ? value : 'advanced';
  }

  function getSkillsModel(sections) {
    var items = [];

    sections.forEach(function (section) {
      var groupId = String(section.id || section.group || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      var groupLabel = String(section.group || '').trim();

      if (!groupId || !groupLabel) {
        return;
      }

      var skills = Array.isArray(section.skills) ? section.skills : [];
      skills.forEach(function (skill) {
        items.push({
          groupId: groupId,
          groupLabel: groupLabel,
          name: String(skill.name || '').trim(),
          icon: String(skill.icon || '').trim(),
          tier: normalizeSkillTier(skill.tier)
        });
      });
    });

    return {
      items: items.filter(function (item) {
        return item.name;
      })
    };
  }

  function renderSkills() {
    var locale = getLocaleData(currentLanguage);
    var sections = locale && Array.isArray(locale.skills) ? locale.skills : [];
    var target = document.getElementById('skillsGrid');
    var tierFilters = document.getElementById('skillsTierFilters');
    var emptyState = document.getElementById('skillsEmptyState');

    if (!target || !tierFilters || !emptyState) {
      return;
    }

    var model = getSkillsModel(sections);
    var allLabel = getTranslation('skills_ui.filter_all', 'All');
    var tierLabel = getTranslation('skills_ui.filter_tier', 'Tier');
    var coreBadgeLabel = getTranslation('skills_ui.core_badge', 'Core skill');
    debugLog('[skills] model size', model.items.length);
    if (skillsState.activeTier !== 'all' && skillTierOrder.indexOf(skillsState.activeTier) < 0) {
      skillsState.activeTier = 'all';
    }

    tierFilters.setAttribute('aria-label', tierLabel);

    var tierButtons = [{ id: 'all', label: allLabel }].concat(skillTierOrder.map(function (tier) {
      return {
        id: tier,
        label: getTranslation('skills_ui.tiers.' + tier, tier)
      };
    }));
    tierFilters.innerHTML = tierButtons.map(function (item) {
      var activeClass = skillsState.activeTier === item.id ? ' is-active' : '';
      var pressed = skillsState.activeTier === item.id ? 'true' : 'false';
      return '' +
        '<button type="button" class="skills-filter-btn' + activeClass + '" data-tier-filter="' + escapeHtml(item.id) + '" aria-pressed="' + pressed + '">' +
        escapeHtml(item.label) +
        '</button>';
    }).join('');

    var filtered = model.items.filter(function (item) {
      return skillsState.activeTier === 'all' || item.tier === skillsState.activeTier;
    });

    var tierRank = {
      core: 0,
      advanced: 1,
      working: 2
    };
    filtered.sort(function (a, b) {
      if (a.groupLabel !== b.groupLabel) {
        return a.groupLabel.localeCompare(b.groupLabel);
      }
      if (a.tier !== b.tier) {
        return (tierRank[a.tier] || 99) - (tierRank[b.tier] || 99);
      }
      return a.name.localeCompare(b.name);
    });

    var hasData = model.items.length > 0;
    if (!hasData) {
      debugLog('[skills] no normalized skill items found for locale', currentLanguage);
      target.innerHTML = '';
      emptyState.hidden = false;
      return;
    }

    target.innerHTML = filtered.map(function (item) {
      var iconHtml = item.icon
        ? '<span class="skill-chip-icon" aria-hidden="true"><i class="' + escapeHtml(item.icon) + '"></i></span>'
        : '';
      var coreStarHtml = item.tier === 'core'
        ? '<span class="skill-chip-core-star" aria-label="' + escapeHtml(coreBadgeLabel) + '" title="' + escapeHtml(coreBadgeLabel) + '">★</span>'
        : '';
      return '' +
        '<article class="skill-chip tier-' + escapeHtml(item.tier) + ' group-' + escapeHtml(item.groupId) + '">' +
        coreStarHtml +
        iconHtml +
        '<span class="skill-chip-label">' + escapeHtml(item.name) + '</span>' +
        '<span class="skill-chip-group">' + escapeHtml(item.groupLabel) + '</span>' +
        '</article>';
    }).join('');

    emptyState.hidden = filtered.length > 0;
    if (filtered.length === 0) {
      target.innerHTML = '';
    }

    tierFilters.querySelectorAll('[data-tier-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        skillsState.activeTier = button.getAttribute('data-tier-filter') || 'all';
        renderSkills();
      });
    });
  }

  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      var key = element.getAttribute('data-i18n');
      var value = getTranslation(key, element.textContent.trim());
      if (value) {
        element.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
      var key = element.getAttribute('data-i18n-placeholder');
      var value = getTranslation(key, element.getAttribute('placeholder') || '');
      if (value) {
        element.setAttribute('placeholder', value);
      }
    });

    var heroImage = document.getElementById('aboutHeroImage');
    if (heroImage) {
      heroImage.alt = getTranslation('about.image_alt', heroImage.alt);
    }

    updateDotLabels();
  }

  function applyLanguage(language) {
    currentLanguage = normalizeLanguage(language);
    root.setAttribute('lang', currentLanguage);
    debugLog('[i18n] applyLanguage', currentLanguage);

    applyStaticTranslations();
    renderExperience();
    renderEducation();
    renderSkills();
    updateLanguageUi(currentLanguage);

    var currentTheme = root.getAttribute('data-theme') || 'light';
    updateToggleUi(currentTheme);
  }

  function initLanguage() {
    applyLanguage(resolveInitialLanguage());

    document.querySelectorAll('.lang-option').forEach(function (option) {
      option.addEventListener('click', function () {
        var lang = option.getAttribute('data-lang');
        if (!lang || supportedLanguages.indexOf(lang) < 0) {
          return;
        }
        applyLanguage(lang);
        saveLanguage(lang);
      });
    });

    document.addEventListener('click', function (event) {
      var option = event.target && event.target.closest ? event.target.closest('.lang-option[data-lang]') : null;
      if (!option) {
        return;
      }
      var lang = option.getAttribute('data-lang');
      if (!lang || supportedLanguages.indexOf(lang) < 0) {
        return;
      }
      applyLanguage(lang);
      saveLanguage(lang);
    });
  }

  function initTheme() {
    applyTheme(resolveInitialTheme());

    if (toggleButton) {
      toggleButton.addEventListener('click', function () {
        var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        saveTheme(nextTheme);
      });
    }

    var themeChangeHandler = function (event) {
      var savedTheme = getSavedTheme();
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', themeChangeHandler);
    } else if (mediaQuery && typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(themeChangeHandler);
    }
  }

  function getScrollContainer() {
    return mainSections || window;
  }

  function getSectionScrollTop(target) {
    var scrollContainer = getScrollContainer();
    if (scrollContainer === window) {
      return target.getBoundingClientRect().top + window.pageYOffset;
    }
    return target.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop;
  }

  function scrollToSection(target) {
    var scrollContainer = getScrollContainer();
    var top = getSectionScrollTop(target);
    var behavior = reduceMotion ? 'auto' : 'smooth';

    if (scrollContainer === window) {
      window.scrollTo({
        top: top,
        behavior: behavior
      });
      return;
    }

    scrollContainer.scrollTo({
      top: top,
      behavior: behavior
    });
  }

  function setActiveSection(sectionId) {
    if (!sectionId) {
      return;
    }

    document.querySelectorAll('#mainNav .nav-link').forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + sectionId;
      link.classList.toggle('active', isActive);
    });

    document.querySelectorAll('.section-dots .dot-link').forEach(function (dot) {
      var isActive = dot.dataset.section === sectionId;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  }

  function initScrollNavigation() {
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
      if (
        location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
        location.hostname === this.hostname
      ) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

        if (target.length) {
          scrollToSection(target[0]);
          return false;
        }
      }
      return true;
    });

    $('.js-scroll-trigger').click(function () {
      $('.navbar-collapse').collapse('hide');
    });
  }

  function initSectionIndicators() {
    var sections = document.querySelectorAll('section.resume-section');
    if (!sections.length) {
      return;
    }

    setActiveSection(sections[0].id);

    if (!('IntersectionObserver' in window)) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        var bestEntry = null;

        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        });

        if (bestEntry && bestEntry.target && bestEntry.target.id) {
          setActiveSection(bestEntry.target.id);
        }
      },
      {
        root: mainSections || null,
        threshold: [0.5, 0.65, 0.8]
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initRevealEffects() {
    var revealSelectors = '.reveal-on-load, .reveal-on-scroll, .reveal-card';
    var revealElements = document.querySelectorAll(revealSelectors);

    if (reduceMotion) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    root.classList.add('motion-safe');

    window.requestAnimationFrame(function () {
      document.querySelectorAll('.reveal-on-load').forEach(function (el) {
        el.classList.add('is-visible');
      });
    });

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, io) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      {
        root: mainSections || null,
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    document.querySelectorAll('.reveal-on-scroll, .reveal-card').forEach(function (el) {
      observer.observe(el);
    });
  }

  try {
    initTheme();
  } catch (error) {
    debugLog('[theme] init failed', error);
  }

  try {
    initLanguage();
  } catch (error) {
    debugLog('[i18n] init failed', error);
  }

  initScrollNavigation();
  initSectionIndicators();
  initRevealEffects();
})(jQuery);
