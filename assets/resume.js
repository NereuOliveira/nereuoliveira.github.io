(function ($) {
  'use strict';

  var storageKey = 'preferred-theme';
  var root = document.documentElement;
  var mainSections = document.querySelector('.main-sections');
  var toggleButton = document.getElementById('themeToggle');
  var toggleIcon = toggleButton ? toggleButton.querySelector('.theme-toggle-icon i') : null;
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getSavedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
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

  function updateToggleUi(theme) {
    if (!toggleButton) {
      return;
    }
    var nextTheme = theme === 'dark' ? 'light' : 'dark';
    var toggleLabel = 'Switch to ' + nextTheme + ' mode';
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

  function initTheme() {
    applyTheme(resolveInitialTheme());

    if (toggleButton) {
      toggleButton.addEventListener('click', function () {
        var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        saveTheme(nextTheme);
      });
    }

    mediaQuery.addEventListener('change', function (event) {
      var savedTheme = getSavedTheme();
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light');
    });
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

  initTheme();
  initScrollNavigation();
  initSectionIndicators();
  initRevealEffects();
})(jQuery);
