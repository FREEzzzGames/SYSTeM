/* =========================================================
   SYSTeM
   CORE v0.1.1
   ECONOMY FOUNDATION
   ========================================================= */


/* =========================================================
   SYSTEM CONFIG
   ========================================================= */

const SYSTEM_CONFIG = {

    name: "SYSTeM",

    version: "0.1.1",

    module: "CORE",

    initialResource: 0,

    resourceStep: 1,

    maxLogEntries: 50,

    /* -----------------------------------------------------
       ECONOMY
       ----------------------------------------------------- */

    initialCredits: 0,

    initialEfficiency: 1,

    initialUpgradeCost: 10,

    upgradeCostMultiplier: 1.5,

    resourceToCredits: 1
};


/* =========================================================
   GAME STATE
   ========================================================= */

const State = {

    resource:
        SYSTEM_CONFIG.initialResource,

    credits:
        SYSTEM_CONFIG.initialCredits,

    efficiency:
        SYSTEM_CONFIG.initialEfficiency,

    upgradeCost:
        SYSTEM_CONFIG.initialUpgradeCost,

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

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount)
        ) {

            return State.resource;
        }


        State.resource += amount;

        return State.resource;
    },


    spend(amount) {

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            return false;
        }


        if (
            State.resource < amount
        ) {

            return false;
        }


        State.resource -= amount;

        return true;
    },


    format(value) {

        return String(
            Math.floor(value)
        ).padStart(
            6,
            "0"
        );
    }
};


/* =========================================================
   CREDIT ENGINE
   ========================================================= */

const Credits = {

    get() {

        return State.credits;
    },


    add(amount) {

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount)
        ) {

            return State.credits;
        }


        State.credits += amount;

        return State.credits;
    },


    spend(amount) {

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            return false;
        }


        if (
            State.credits < amount
        ) {

            return false;
        }


        State.credits -= amount;

        return true;
    },


    format(value) {

        return String(
            Math.floor(value)
        ).padStart(
            6,
            "0"
        );
    }
};


/* =========================================================
   ECONOMY ENGINE
   ========================================================= */

const Economy = {

    /* -----------------------------------------------------
       RESOURCE → CREDITS
       ----------------------------------------------------- */

    convertResourceToCredits(amount) {

        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return 0;
        }


        const credits =
            amount *
            SYSTEM_CONFIG.resourceToCredits;


        Credits.add(
            credits
        );


        return credits;
    },


    /* -----------------------------------------------------
       CURRENT PRODUCTION VALUE
       ----------------------------------------------------- */

    getProductionAmount() {

        return (
            SYSTEM_CONFIG.resourceStep *
            State.efficiency
        );
    },


    /* -----------------------------------------------------
       UPGRADE
       ----------------------------------------------------- */

    canUpgrade() {

        return (
            State.credits >=
            State.upgradeCost
        );
    },


    upgrade() {

        if (
            !this.canUpgrade()
        ) {

            return false;
        }


        const cost =
            State.upgradeCost;


        if (
            !Credits.spend(cost)
        ) {

            return false;
        }


        State.efficiency += 1;


        State.upgradeCost =
            Math.ceil(
                State.upgradeCost *
                SYSTEM_CONFIG.upgradeCostMultiplier
            );


        Log.add(
            "log.upgradeComplete"
        );


        UI.renderEconomy();


        Debug.info(
            "Efficiency upgraded",
            {

                efficiency:
                    State.efficiency,

                nextCost:
                    State.upgradeCost,

                credits:
                    State.credits

            }
        );


        return true;
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


        if (
            typeof UI !== "undefined"
        ) {

            UI.renderLog();
        }
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

        const amount =
            Economy.getProductionAmount();


        Resources.add(
            amount
        );


        Economy.convertResourceToCredits(
            amount
        );


        Log.add(
            "log.processComplete"
        );


        UI.renderResource();

        UI.renderEconomy();


        Debug.info(
            "Process executed",
            {

                resource:
                    State.resource,

                credits:
                    State.credits,

                efficiency:
                    State.efficiency

            }
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


        /* -------------------------------------------------
           INITIALIZE LOCALIZATION
           ------------------------------------------------- */

        SYSTEM_I18N.init();


        /* -------------------------------------------------
           INITIALIZE LANGUAGE SWITCHER
           ------------------------------------------------- */

        SYSTEM_LANGUAGE_SWITCHER.init();


        /* -------------------------------------------------
           INITIALIZE UI
           ------------------------------------------------- */

        UI.bindEvents();


        /* -------------------------------------------------
           INITIAL SYSTEM MESSAGES
           ------------------------------------------------- */

        Log.add(
            "log.systemInitialized"
        );


        Log.add(
            "log.waitingForInput"
        );


        /* -------------------------------------------------
           RENDER
           ------------------------------------------------- */

        UI.render();


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

        this.renderEconomy();

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
       ECONOMY
       ----------------------------------------------------- */

    renderEconomy() {

        /*
         * Economy is intentionally not added
         * to the visible interface yet.
         *
         * This keeps the current geometry
         * completely unchanged.
         *
         * The values remain available through:
         *
         * SYSTEM.credits
         * SYSTEM.state.efficiency
         * SYSTEM.economy
         */

        return;
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
                 * The log stores translation keys,
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

    credits:
        Credits,

    economy:
        Economy,

    process:
        Process,

    log:
        Log,

    game:
        Game,

    ui:
        UI,

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
