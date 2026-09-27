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
   RADIO ENGINE
   =========================================================
   Native HTML5 Audio
   No iframe.
   ========================================================= */

const Radio = {

    /*
     * Official GTI Radio external stream.
     */

    streamURL:
        "https://gtiradio.ru/radiohi",


    audio: null,

    playButton: null,

    stopButton: null,

    initialized: false,


    /* -----------------------------------------------------
       INIT
       ----------------------------------------------------- */

    init() {

        if (
            this.initialized
        ) {

            return;
        }


        this.initialized = true;


        this.createControls();


        this.bindEvents();


        this.updateButtons();
    },


    /* -----------------------------------------------------
       CREATE CONTROLS
       ----------------------------------------------------- */

    createControls() {

        const processPanel =
            document.querySelector(
                ".process-panel"
            );


        if (
            !processPanel
        ) {

            return;
        }


        const existing =
            document.getElementById(
                "radio-controls"
            );


        if (
            existing
        ) {

            this.playButton =
                document.getElementById(
                    "radio-play"
                );


            this.stopButton =
                document.getElementById(
                    "radio-stop"
                );


            return;
        }


        const controls =
            document.createElement(
                "div"
            );


        controls.id =
            "radio-controls";


        controls.className =
            "radio-controls";


        controls.innerHTML = `
            <button
                id="radio-play"
                class="radio-button"
                type="button"
                aria-label="Play radio"
                title="Play"
                aria-pressed="false"
            >▶</button>

            <button
                id="radio-stop"
                class="radio-button"
                type="button"
                aria-label="Stop radio"
                title="Stop"
                aria-pressed="true"
            >■</button>
        `;


        processPanel.appendChild(
            controls
        );


        this.playButton =
            document.getElementById(
                "radio-play"
            );


        this.stopButton =
            document.getElementById(
                "radio-stop"
            );
    },


    /* -----------------------------------------------------
       EVENTS
       ----------------------------------------------------- */

    bindEvents() {

        if (
            this.playButton
        ) {

            this.playButton.addEventListener(
                "click",
                () => {

                    this.play();

                }
            );
        }


        if (
            this.stopButton
        ) {

            this.stopButton.addEventListener(
                "click",
                () => {

                    this.stop();

                }
            );
        }
    },


    /* -----------------------------------------------------
       CREATE AUDIO
       ----------------------------------------------------- */

    createAudio() {

        if (
            this.audio
        ) {

            return this.audio;
        }


        const audio =
            new Audio();


        audio.src =
            this.streamURL;


        audio.preload =
            "none";


        audio.autoplay =
            false;


        audio.volume =
            1;


        /*
         * Radio state events.
         */

        audio.addEventListener(
            "playing",
            () => {

                this.updateButtons();


                Debug.info(
                    "Radio playback started"
                );
            }
        );


        audio.addEventListener(
            "pause",
            () => {

                this.updateButtons();
            }
        );


        audio.addEventListener(
            "waiting",
            () => {

                Debug.info(
                    "Radio buffering"
                );
            }
        );


        audio.addEventListener(
            "stalled",
            () => {

                Debug.info(
                    "Radio stream stalled"
                );
            }
        );


        audio.addEventListener(
            "error",
            () => {

                this.updateButtons();


                Debug.error(
                    "Radio playback error",
                    audio.error
                );
            }
        );


        this.audio =
            audio;


        return audio;
    },


    /* -----------------------------------------------------
       PLAY
       ----------------------------------------------------- */

    async play() {

        const audio =
            this.createAudio();


        if (
            !audio
        ) {

            return;
        }


        /*
         * If already playing,
         * do nothing.
         */

        if (
            !audio.paused
        ) {

            return;
        }


        try {

            /*
             * The call is made directly
             * from the user's button action.
             */

            await audio.play();


            this.updateButtons();


            Debug.info(
                "Radio play confirmed"
            );

        } catch (error) {

            this.updateButtons();


            Debug.error(
                "Radio play failed",
                error
            );
        }
    },


    /* -----------------------------------------------------
       STOP
       ----------------------------------------------------- */

    stop() {

        if (
            !this.audio
        ) {

            this.updateButtons();

            return;
        }


        this.audio.pause();


        /*
         * Reset the stream so that
         * the next PLAY starts a
         * fresh connection.
         */

        try {

            this.audio.removeAttribute(
                "src"
            );


            this.audio.load();

        } catch (
            error
        ) {

            Debug.error(
                "Radio reset failed",
                error
            );
        }


        this.audio = null;


        this.updateButtons();


        Debug.info(
            "Radio stopped"
        );
    },


    /* -----------------------------------------------------
       BUTTON STATE
       ----------------------------------------------------- */

    updateButtons() {

        if (
            !this.playButton ||
            !this.stopButton
        ) {

            return;
        }


        const playing =
            Boolean(
                this.audio &&
                !this.audio.paused
            );


        this.playButton.classList.toggle(
            "active",
            playing
        );


        this.stopButton.classList.toggle(
            "active",
            !playing
        );


        this.playButton.setAttribute(
            "aria-pressed",
            String(playing)
        );


        this.stopButton.setAttribute(
            "aria-pressed",
            String(!playing)
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
         * Initialize radio after
         * the base UI exists.
         */

        Radio.init();


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

    radio:
        Radio,

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
