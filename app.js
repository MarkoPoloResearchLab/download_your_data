(function () {
    'use strict';

    /** -----------------------------------------------------------
     *  App state & constants
     *  --------------------------------------------------------- */
    var STORAGE_KEYS = {
        language: 'download-your-data.lang',
        theme: 'download-your-data.theme'
    };

    var appState = {
        data: null,
        language: 'en'
    };

    /** -----------------------------------------------------------
     *  DOM helpers (descriptive names; no single-letter vars)
     *  --------------------------------------------------------- */
    function query(selector, root) {
        return (root || document).querySelector(selector);
    }

    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function createElement(tagName, attributes, children) {
        var element = document.createElement(tagName);
        var attributeName;

        attributes = attributes || {};
        for (attributeName in attributes) {
            if (!Object.prototype.hasOwnProperty.call(attributes, attributeName)) continue;
            var attributeValue = attributes[attributeName];
            if (attributeName === 'class') {
                element.className = attributeValue;
            } else if (attributeName === 'text') {
                element.textContent = attributeValue;
            } else {
                element.setAttribute(attributeName, attributeValue);
            }
        }

        if (children != null) {
            if (!Array.isArray(children)) children = [children];
            children.forEach(function (childNode) {
                if (childNode == null) return;
                element.appendChild(typeof childNode === 'string' ? document.createTextNode(childNode) : childNode);
            });
        }
        return element;
    }

    function getStringsForCurrentLanguage() {
        if (!appState.data || !appState.data.strings) return null;
        return appState.data.strings[appState.language] || null;
    }

    /** -----------------------------------------------------------
     *  Rendering
     *  --------------------------------------------------------- */
    function renderChromeText() {
        var strings = getStringsForCurrentLanguage();
        if (!strings) return;

        if (strings.site_title) {
            document.title = strings.site_title;
            var brandAnchor = query('#brand');
            if (brandAnchor) brandAnchor.textContent = strings.site_title;
            var footerBrand = query('#footer-brand');
            if (footerBrand) footerBrand.textContent = strings.site_title;
        }

        var heroHeading = query('#hero-heading');
        if (heroHeading) heroHeading.textContent = strings.hero_heading || '';

        var heroSub = query('#hero-sub');
        if (heroSub) heroSub.textContent = strings.hero_sub || '';

        var footerTagline = query('#footer-tagline');
        if (footerTagline) footerTagline.textContent = strings.footer_tagline || '';

        var builtWith = query('#built-with');
        if (builtWith) builtWith.textContent = strings.built_with || '';

        var hostedOn = query('#hosted-on');
        if (hostedOn) hostedOn.textContent = strings.hosted_on || '';
    }

    function renderTopNavPlatforms() {
        var strings = getStringsForCurrentLanguage();
        if (!strings) return;

        var navList = query('#nav-platforms');
        if (!navList) return;
        navList.innerHTML = '';

        (strings.platforms || []).forEach(function (platform) {
            var labelText = platform.nav || platform.title || platform.id || '';
            var anchor = createElement('a', {
                class: 'nav-link py-1 px-2 text-nowrap',
                href: '#' + platform.id,
                text: labelText
            });
            navList.appendChild(createElement('li', {class: 'nav-item'}, anchor));
        });
    }

    function renderPlatformCards() {
        var strings = getStringsForCurrentLanguage();
        if (!strings) return;

        var contentHost = query('#content');
        var loadingAlert = query('#loading');
        if (loadingAlert) loadingAlert.remove();
        if (!contentHost) return;

        contentHost.innerHTML = '';

        (strings.platforms || []).forEach(function (platform) {
            var section = createElement('section', {id: platform.id, class: 'pt-4 mb-4'});

            var cardBodyChildren = [];

            if (platform.title) {
                cardBodyChildren.push(createElement('h2', {class: 'h4 mb-2', text: platform.title}));
            }
            if (platform.intro) {
                cardBodyChildren.push(createElement('p', {class: 'mb-3', text: platform.intro}));
            }

            // Steps
            var stepList = platform.steps || [];
            if (stepList.length) {
                var orderedList = createElement('ol', {class: 'mb-3'});
                stepList.forEach(function (stepText) {
                    orderedList.appendChild(createElement('li', {text: stepText}));
                });
                cardBodyChildren.push(orderedList);
            }

            // Official refs
            var referenceList = platform.refs || [];
            if (referenceList.length) {
                var referencesWrapper = createElement('div', {class: 'mb-3'});
                var stringsDict = getStringsForCurrentLanguage();
                if (stringsDict && stringsDict.official_help) {
                    referencesWrapper.appendChild(createElement('p', {
                        class: 'text-muted mb-1',
                        text: stringsDict.official_help
                    }));
                }
                var refsUl = createElement('ul', {class: 'mb-0'});
                referenceList.forEach(function (referenceItem) {
                    refsUl.appendChild(
                        createElement('li', {}, createElement('a', {
                            class: 'link-primary link-offset-2 link-underline-opacity-75-hover',
                            href: referenceItem.href,
                            target: '_blank',
                            rel: 'noopener',
                            text: referenceItem.label || referenceItem.href
                        }))
                    );
                });
                referencesWrapper.appendChild(refsUl);
                cardBodyChildren.push(referencesWrapper);
            }

            // Images
            var imageSpecs = platform.images || [];
            if (imageSpecs.length) {
                var row = createElement('div', {class: 'row g-3'});
                imageSpecs.forEach(function (imageSpec) {
                    var column = createElement('div', {class: 'col-md-6'});
                    if (imageSpec.src) {
                        column.appendChild(createElement('img', {
                            class: 'img-fluid rounded border',
                            src: imageSpec.src,
                            alt: imageSpec.alt || ''
                        }));
                    } else {
                        column.appendChild(createElement(
                            'div',
                            {
                                class: 'ratio ratio-16x9 bg-body-secondary border rounded d-flex align-items-center justify-content-center text-muted'
                            },
                            imageSpec.alt || ''
                        ));
                    }
                    row.appendChild(column);
                });
                cardBodyChildren.push(row);
            }

            if (platform.note) {
                cardBodyChildren.push(createElement('p', {class: 'text-muted mt-3', text: platform.note}));
            }

            var card = createElement('div', {class: 'card shadow-sm border'},
                createElement('div', {class: 'card-body'}, cardBodyChildren)
            );

            section.appendChild(card);
            contentHost.appendChild(section);
        });
    }

    function updateLanguageTogglePressedState() {
        var switcherGroup = query('#lang-switcher');
        if (!switcherGroup) return;
        queryAll('.btn', switcherGroup).forEach(function (buttonElement) {
            var isActive = buttonElement.getAttribute('data-lang') === appState.language;
            buttonElement.classList.toggle('active', isActive);
            buttonElement.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function renderAll() {
        renderChromeText();
        renderTopNavPlatforms();
        renderPlatformCards();
        updateLanguageTogglePressedState();
    }

    /** -----------------------------------------------------------
     *  Language selection
     *  --------------------------------------------------------- */
    function pickInitialLanguage() {
        var savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
        if (savedLanguage && appState.data && appState.data.strings && appState.data.strings[savedLanguage]) {
            return savedLanguage;
        }
        var availableLanguages = appState.data && appState.data.strings ? Object.keys(appState.data.strings) : [];
        var browserLangTwo = (navigator.language || 'en').slice(0, 2);
        if (availableLanguages.indexOf(browserLangTwo) !== -1) return browserLangTwo;
        return availableLanguages[0] || 'en';
    }

    function setLanguageAndRender(newLanguage) {
        if (!appState.data || !appState.data.strings || !appState.data.strings[newLanguage]) return;
        appState.language = newLanguage;
        localStorage.setItem(STORAGE_KEYS.language, newLanguage);
        renderAll();
    }

    /** -----------------------------------------------------------
     *  Theme
     *  --------------------------------------------------------- */
    function initializeThemeToggle() {
        var themeToggleButton = query('#theme-toggle');
        var systemPrefersDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var initialTheme = localStorage.getItem(STORAGE_KEYS.theme) || (systemPrefersDark ? 'dark' : 'light');

        applyTheme(initialTheme);

        function applyTheme(themeMode) {
            document.body.setAttribute('data-bs-theme', themeMode);
            localStorage.setItem(STORAGE_KEYS.theme, themeMode);
            if (themeToggleButton) themeToggleButton.textContent = (themeMode === 'dark' ? '☀️' : '🌙');
        }

        function toggleTheme() {
            var currentMode = document.body.getAttribute('data-bs-theme');
            applyTheme(currentMode === 'dark' ? 'light' : 'dark');
        }

        if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
    }

    /** -----------------------------------------------------------
     *  Bootstrapping
     *  --------------------------------------------------------- */
    function attachLanguageClickHandler() {
        document.addEventListener('click', function (event) {
            var button = event.target.closest('#lang-switcher [data-lang]');
            if (!button) return;
            setLanguageAndRender(button.getAttribute('data-lang'));
        });
    }

    async function boot() {
        attachLanguageClickHandler();

        try {
            var response = await fetch('data.json', {cache: 'no-store'});
            if (!response.ok) throw new Error('data.json HTTP ' + response.status);
            appState.data = await response.json();
        } catch (error) {
            var contentHost = query('#content');
            var loadingAlert = query('#loading');
            if (loadingAlert) loadingAlert.remove();
            if (contentHost) {
                contentHost.appendChild(
                    createElement('div', {class: 'alert alert-danger'},
                        'Failed to load data.json. Check the file path or CORS.'
                    )
                );
            }
            console.error(error);
            return;
        }

        appState.language = pickInitialLanguage();
        initializeThemeToggle();
        renderAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
