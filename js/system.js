/* =========================================================
   SYSTeM
   CORE v0.1.0
   Core Foundation
   ========================================================= */


/* =========================================================
   SYSTEM CONFIG
   ========================================================= */

const SYSTEM_CONFIG = {

    name: "SYSTeM",

    version: "0.1.0",

    module: "CORE",

    initialResource: 0,

    resourceStep: 1,

    maxLogEntries: 50
};


/* =========================================================
   GAME STATE
   ========================================================= */

const State = {

    resource:
        SYSTEM_CONFIG.initialResource,

    ready: true,

    initialized: false
};


/* =========================================================
   RESOURCE ENGINE
   ========================================================= */

const Resources = {

    get() {

        return State.resource;
    },


    add(amount) {

        State.resource += amount;

        return State.resource;
    },


    format(value) {

        return String(value)
            .padStart(6, "0");
    }
};


/* =========================================================
   SYSTEM LOG
   ========================================================= */

const Log = {

    entries: [],


    add(key) {

        this.entries.push({

            key: key,

            time: Date.now()

        });


        if (
            this.entries.length >
            SYSTEM_CONFIG.maxLogEntries
        ) {

            this.entries.shift();
        }


        UI.renderLog();
    },


    clear() {

        this.entries = [];

        UI.renderLog();
    }
};


/* =========================================================
   PROCESS ENGINE
   ========================================================= */

const Process = {

    execute() {

        Resources.add(
            SYSTEM_CONFIG.resourceStep
        );


        Log.add(
            "log.processComplete"
        );


        UI.renderResource();


        Debug.info(
            "Process executed",
            {

                resource:
                    State.resource

            }
        );
    }
};


/* =========================================================
   RADIO BUTTONS
   VISUAL ONLY
   =========================================================
   
   IMPORTANT:
   No audio.
   No iframe.
   No external stream.
   No radio initialization.
   No click handlers.
   
   These buttons are only placeholders.
   The real Radio module will be connected later.
   ========================================================= */

const RadioButtons = {

    initialized: false,


    init() {

        if (
            this.initialized
        ) {

            return;
        }


        const switcher =
            document.getElementById(
                "language-switcher"
            );


        if (
            !switcher
        ) {

            return;
        }


        this.initialized = true;


        /*
         * Prevent duplicate buttons.
         */

        if (
            document.getElementById(
                "radio-play"
            )
        ) {

            return;
        }


        const play =
            document.createElement(
                "button"
            );


        play.id =
            "radio-play";


        play.className =
            "radio-button";


        play.type =
            "button";


        play.textContent =
            "▶";


        play.setAttribute(
            "aria-label",
            "Radio"
        );


        play.setAttribute(
            "title",
            "Radio"
        );


        const stop =
            document.createElement(
                "button"
            );


        stop.id =
            "radio-stop";


        stop.className =
            "radio-button";


        stop.type =
            "button";


        stop.textContent =
            "■";


        stop.setAttribute(
            "aria-label",
            "Radio stop"
        );


        stop.setAttribute(
            "title",
            "Radio stop"
        );


        /*
         * VISUAL ONLY.
         *
         * No event listeners are attached.
         *
         * Therefore these buttons cannot:
         * - start audio
         * - load an iframe
         * - open another page
         * - change the game state
         */

        switcher.appendChild(
            play
        );


        switcher.appendChild(
            stop
        );
    }
};


/* =========================================================
   GAME
   ========================================================= */

const Game = {

    boot() {

        if (
            State.initialized
        ) {

            return;
        }


        State.initialized =
            true;


        /*
         * Initialize localization
         * before rendering anything.
         */

        SYSTEM_I18N.init();


        /*
         * Initialize global language
         * switcher.
         */

        SYSTEM_LANGUAGE_SWITCHER.init();


        /*
         * Initialize UI.
         */

        UI.bindEvents();


        /*
         * Initial system messages.
         */

        Log.add(
            "log.systemInitialized"
        );


        Log.add(
            "log.waitingForInput"
        );


        /*
         * Render.
         */

        UI.render();


        /*
         * Add only the visual
         * radio buttons.
         *
         * No radio engine exists yet.
         */

        RadioButtons.init();


        Debug.info(
            "SYSTeM boot complete",
            {

                version:
                    SYSTEM_CONFIG.version,

                language:
                    SYSTEM_I18N.currentLanguage

            }
        );
    }
};


/* =========================================================
   UI
   ========================================================= */

const UI = {

    resourceElement: null,

    processButton: null,

    logElement: null,


    /* -----------------------------------------------------
       CACHE DOM
       ----------------------------------------------------- */

    cache() {

        this.resourceElement =
            document.getElementById(
                "resource-value"
            );


        this.processButton =
            document.getElementById(
                "process-button"
            );


        this.logElement =
            document.getElementById(
                "system-log"
            );
    },


    /* -----------------------------------------------------
       EVENTS
       ----------------------------------------------------- */

    bindEvents() {

        this.cache();


        if (
            this.processButton
        ) {

            this.processButton.addEventListener(
                "click",
                () => {

                    Process.execute();

                }
            );
        }
    },


    /* -----------------------------------------------------
       COMPLETE RENDER
       ----------------------------------------------------- */

    render() {

        this.renderResource();

        SYSTEM_I18N.apply();

        this.renderLog();

        SYSTEM_I18N.updateSwitcher();
    },


    /* -----------------------------------------------------
       RESOURCE
       ----------------------------------------------------- */

    renderResource() {

        if (
            !this.resourceElement
        ) {

            return;
        }


        this.resourceElement.textContent =
            Resources.format(
                Resources.get()
            );
    },


    /* -----------------------------------------------------
       LOG
       ----------------------------------------------------- */

    renderLog() {

        if (
            !this.logElement
        ) {

            return;
        }


        this.logElement.innerHTML =
            "";


        Log.entries.forEach(
            entry => {

                const line =
                    document.createElement(
                        "div"
                    );


                line.className =
                    "log-line";


                const prefix =
                    document.createElement(
                        "span"
                    );


                prefix.className =
                    "log-prefix";


                prefix.textContent =
                    ">";


                const text =
                    document.createElement(
                        "span"
                    );


                text.className =
                    "log-text";


                /*
                 * The log stores the
                 * translation KEY,
                 * not translated text.
                 *
                 * Therefore changing language
                 * immediately updates old messages.
                 */

                text.textContent =
                    t(entry.key);


                line.appendChild(
                    prefix
                );


                line.appendChild(
                    text
                );


                this.logElement.appendChild(
                    line
                );
            }
        );


        this.logElement.scrollTop =
            this.logElement.scrollHeight;
    }
};


/* =========================================================
   DEBUG
   ========================================================= */

const Debug = {

    enabled: true,


    info(
        message,
        data = null
    ) {

        if (
            !this.enabled
        ) {

            return;
        }


        if (
            data !== null
        ) {

            console.info(
                `[SYSTeM] ${message}`,
                data
            );

        } else {

            console.info(
                `[SYSTeM] ${message}`
            );
        }
    },


    error(
        message,
        error = null
    ) {

        if (
            error
        ) {

            console.error(
                `[SYSTeM] ${message}`,
                error
            );

        } else {

            console.error(
                `[SYSTeM] ${message}`
            );
        }
    }
};


/* =========================================================
   PUBLIC SYSTEM OBJECT
   ========================================================= */

window.SYSTEM = {

    config:
        SYSTEM_CONFIG,

    state:
        State,

    resources:
        Resources,

    process:
        Process,

    log:
        Log,

    game:
        Game,

    ui:
        UI,

    radioButtons:
        RadioButtons,

    debug:
        Debug,

    i18n:
        SYSTEM_I18N
};


/* =========================================================
   BOOT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            Game.boot();

        } catch (error) {

            Debug.error(
                "Boot failure",
                error
            );
        }

    }
);
