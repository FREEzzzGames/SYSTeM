/* =========================================================
   SYSTeM
   Localization Database
   CORE v0.1.0

   Languages:
   RU - Russian
   DE - German
   EN - English
   ========================================================= */

window.SYSTEM_LOCALES = {


    /* =====================================================
       RUSSIAN
       ===================================================== */

    ru: {

        "header.online":
            "ОНЛАЙН",

        "status.title":
            "СТАТУС СИСТЕМЫ",

        "status.status":
            "СТАТУС",

        "status.online":
            "ОНЛАЙН",

        "status.user":
            "ПОЛЬЗОВАТЕЛЬ",

        "status.purpose":
            "НАЗНАЧЕНИЕ",

        "status.unknown":
            "НЕИЗВЕСТНО",

        "process.title":
            "ПРОЦЕСС",

        "process.resource":
            "РЕСУРС",

        "process.button":
            "[ ЗАПУСК ]",

        "log.title":
            "СИСТЕМНЫЙ ЖУРНАЛ",

        "log.systemInitialized":
            "СИСТЕМА ИНИЦИАЛИЗИРОВАНА",

        "log.waitingForInput":
            "ОЖИДАНИЕ ВВОДА",

        "log.processComplete":
            "ПРОЦЕСС ЗАВЕРШЁН",

        "footer.ready":
            "СОСТОЯНИЕ: ГОТОВО"
    },


    /* =====================================================
       GERMAN
       ===================================================== */

    de: {

        "header.online":
            "ONLINE",

        "status.title":
            "SYSTEMSTATUS",

        "status.status":
            "STATUS",

        "status.online":
            "ONLINE",

        "status.user":
            "BENUTZER",

        "status.purpose":
            "ZWECK",

        "status.unknown":
            "UNBEKANNT",

        "process.title":
            "PROZESS",

        "process.resource":
            "RESSOURCE",

        "process.button":
            "[ START ]",

        "log.title":
            "SYSTEMPROTOKOLL",

        "log.systemInitialized":
            "SYSTEM INITIALISIERT",

        "log.waitingForInput":
            "WARTEN AUF EINGABE",

        "log.processComplete":
            "PROZESS ABGESCHLOSSEN",

        "footer.ready":
            "STATUS: BEREIT"
    },


    /* =====================================================
       ENGLISH
       ===================================================== */

    en: {

        "header.online":
            "ONLINE",

        "status.title":
            "SYSTEM STATUS",

        "status.status":
            "STATUS",

        "status.online":
            "ONLINE",

        "status.user":
            "USER",

        "status.purpose":
            "PURPOSE",

        "status.unknown":
            "UNKNOWN",

        "process.title":
            "PROCESS",

        "process.resource":
            "RESOURCE",

        "process.button":
            "[ PROCESS ]",

        "log.title":
            "SYSTEM LOG",

        "log.systemInitialized":
            "SYSTEM INITIALIZED",

        "log.waitingForInput":
            "WAITING FOR INPUT",

        "log.processComplete":
            "PROCESS COMPLETE",

        "footer.ready":
            "STATE: READY"
    }

};


/* =========================================================
   LOCALIZATION ENGINE
   ========================================================= */

window.SYSTEM_I18N = {

    defaultLanguage: "ru",

    supportedLanguages: [
        "ru",
        "de",
        "en"
    ],

    currentLanguage: "ru",


    /* -----------------------------------------------------
       INITIALIZATION
       ----------------------------------------------------- */

    init() {

        const urlLanguage =
            new URLSearchParams(
                window.location.search
            ).get("lang");


        const savedLanguage =
            localStorage.getItem(
                "system.language"
            );


        const browserLanguage =
            navigator.language
                ? navigator.language
                    .toLowerCase()
                    .split("-")[0]
                : null;


        let language =
            this.defaultLanguage;


        if (
            urlLanguage &&
            this.supportedLanguages.includes(
                urlLanguage
            )
        ) {

            language = urlLanguage;

        } else if (
            savedLanguage &&
            this.supportedLanguages.includes(
                savedLanguage
            )
        ) {

            language = savedLanguage;

        } else if (
            browserLanguage &&
            this.supportedLanguages.includes(
                browserLanguage
            )
        ) {

            language = browserLanguage;
        }


        this.setLanguage(
            language,
            false
        );
    },


    /* -----------------------------------------------------
       CHANGE LANGUAGE
       ----------------------------------------------------- */

    setLanguage(
        language,
        save = true
    ) {

        if (
            !this.supportedLanguages.includes(
                language
            )
        ) {

            language =
                this.defaultLanguage;
        }


        this.currentLanguage =
            language;


        document.documentElement.lang =
            language;


        if (save) {

            localStorage.setItem(
                "system.language",
                language
            );
        }


        this.apply();


        this.updateSwitcher();


        /*
         * Important:
         * Re-render dynamic content immediately.
         * This means existing system log entries
         * change language without page reload.
         */

        if (
            window.SYSTEM &&
            SYSTEM.ui
        ) {

            SYSTEM.ui.renderLog();
        }
    },


    /* -----------------------------------------------------
       TRANSLATE
       ----------------------------------------------------- */

    translate(key) {

        const language =
            SYSTEM_LOCALES[
                this.currentLanguage
            ];


        const fallback =
            SYSTEM_LOCALES[
                this.defaultLanguage
            ];


        if (
            language &&
            Object.prototype.hasOwnProperty.call(
                language,
                key
            )
        ) {

            return language[key];
        }


        if (
            fallback &&
            Object.prototype.hasOwnProperty.call(
                fallback,
                key
            )
        ) {

            return fallback[key];
        }


        /*
         * Missing translation.
         * Useful during development.
         */

        return `[${key}]`;
    },


    /* -----------------------------------------------------
       APPLY STATIC TRANSLATIONS
       ----------------------------------------------------- */

    apply() {

        const elements =
            document.querySelectorAll(
                "[data-i18n]"
            );


        elements.forEach(
            element => {

                const key =
                    element.getAttribute(
                        "data-i18n"
                    );


                element.textContent =
                    this.translate(key);
            }
        );


        /*
         * Process button
         */

        const processButton =
            document.getElementById(
                "process-button"
            );


        if (processButton) {

            processButton.textContent =
                this.translate(
                    "process.button"
                );
        }
    },


    /* -----------------------------------------------------
       UPDATE LANGUAGE BUTTONS
       ----------------------------------------------------- */

    updateSwitcher() {

        const buttons =
            document.querySelectorAll(
                ".language-button"
            );


        buttons.forEach(
            button => {

                const language =
                    button.dataset.language;


                const active =
                    language ===
                    this.currentLanguage;


                button.classList.toggle(
                    "active",
                    active
                );


                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );
            }
        );
    }
};


/* =========================================================
   SHORT TRANSLATION FUNCTION
   ========================================================= */

window.t = function(key) {

    return SYSTEM_I18N.translate(key);

};


/* =========================================================
   GLOBAL LANGUAGE SWITCHER
   ========================================================= */

window.SYSTEM_LANGUAGE_SWITCHER = {

    initialized: false,


    init() {

        if (this.initialized) {

            return;
        }


        this.initialized = true;


        const switcher =
            document.getElementById(
                "language-switcher"
            );


        if (!switcher) {

            return;
        }


        switcher.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".language-button"
                    );


                if (!button) {

                    return;
                }


                const language =
                    button.dataset.language;


                if (!language) {

                    return;
                }


                SYSTEM_I18N.setLanguage(
                    language,
                    true
                );
            }
        );
    }
};
