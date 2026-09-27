/* =========================================================
   SYSTeM
   CORE v0.1.2
   ECONOMY + FIRST UPGRADE
   ========================================================= */


/* =========================================================
   SYSTEM CONFIG
   ========================================================= */

const SYSTEM_CONFIG = {

    name: "SYSTeM",

    version: "0.1.2",

    module: "CORE",

    initialResource: 0,

    resourceStep: 1,

    maxLogEntries: 50,

    /* ECONOMY */

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

    getProductionAmount() {

        return (
            SYSTEM_CONFIG.resourceStep *
            State.efficiency
        );
    },


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

            Debug.info(
                "Upgrade unavailable",
                {

                    credits:
                        State.credits,

                    required:
                        State.upgradeCost

                }
            );

            return false;
        }


        const cost =
            State.upgradeCost;


        const spent =
            Credits.spend(cost);


        if (!spent) {

            return false;
        }


        State.efficiency += 1;


        State.upgradeCost =
            Math.ceil(
                State.upgradeCost *
                SYSTEM_CONFIG.upgradeCostMultiplier
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

            key:
                key,

            time:
                Date.now()

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
   ECONOMY CONVERSION
   ========================================================= */

Economy.convertResourceToCredits =
    function(amount) {

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


        /* LOCALIZATION */

        SYSTEM_I18N.init();


        /* LANGUAGE SWITCHER */

        SYSTEM_LANGUAGE_SWITCHER.init();


        /* UI */

        UI.bindEvents();


        /* INITIAL LOG */

        Log.add(
            "log.systemInitialized"
        );


        Log.add(
            "log.waitingForInput"
        );


        /* RENDER */

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

    resourceElement:
        null,

    processButton:
        null,

    logElement:
        null,

    economyPanel:
        null,

    creditsElement:
        null,

    efficiencyElement:
        null,

    upgradeCostElement:
        null,

    upgradeButton:
        null,


    /* =====================================================
       CACHE DOM
       ===================================================== */

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


    /* =====================================================
       EVENTS
       ===================================================== */

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


    /* =====================================================
       COMPLETE RENDER
       ===================================================== */

    render() {

        this.renderResource();

        this.ensureEconomyUI();

        this.renderEconomy();

        SYSTEM_I18N.apply();

        this.renderLog();

        SYSTEM_I18N.updateSwitcher();
    },


    /* =====================================================
       RESOURCE
       ===================================================== */

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


    /* =====================================================
       ECONOMY UI
       ===================================================== */

    ensureEconomyUI() {

        if (
            this.economyPanel
        ) {

            return;
        }


        if (
            !this.processButton
        ) {

            return;
        }


        const processPanel =
            this.processButton.closest(
                ".process-panel"
            );


        if (
            !processPanel
        ) {

            Debug.info(
                "Economy UI target not found"
            );

            return;
        }


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "system-economy";


        panel.style.marginTop =
            "10px";


        panel.style.padding =
            "8px";


        panel.style.border =
            "1px solid rgba(0,255,120,0.25)";


        panel.style.fontFamily =
            "inherit";


        panel.style.fontSize =
            "12px";


        panel.style.lineHeight =
            "1.6";


        panel.style.textAlign =
            "left";


        panel.style.boxSizing =
            "border-box";


        const credits =
            document.createElement(
                "div"
            );


        credits.innerHTML =
            "CREDITS: <span></span>";


        this.creditsElement =
            credits.querySelector(
                "span"
            );


        const efficiency =
            document.createElement(
                "div"
            );


        efficiency.innerHTML =
            "EFFICIENCY: x<span></span>";


        this.efficiencyElement =
            efficiency.querySelector(
                "span"
            );


        const cost =
            document.createElement(
                "div"
            );


        cost.innerHTML =
            "NEXT UPGRADE: <span></span>";


        this.upgradeCostElement =
            cost.querySelector(
                "span"
            );


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            "[ UPGRADE ]";


        button.style.marginTop =
            "6px";


        button.style.width =
            "100%";


        button.style.padding =
            "6px";


        button.style.background =
            "transparent";


        button.style.color =
            "inherit";


        button.style.border =
            "1px solid currentColor";


        button.style.fontFamily =
            "inherit";


        button.style.cursor =
            "pointer";


        button.addEventListener(
            "click",
            () => {

                Economy.upgrade();

            }
        );


        this.upgradeButton =
            button;


        panel.appendChild(
            credits
        );


        panel.appendChild(
            efficiency
        );


        panel.appendChild(
            cost
        );


        panel.appendChild(
            button
        );


        processPanel.appendChild(
            panel
        );


        this.economyPanel =
            panel;
    },


    /* =====================================================
       ECONOMY RENDER
       ===================================================== */

    renderEconomy() {

        this.ensureEconomyUI();


        if (
            !this.economyPanel
        ) {

            return;
        }


        if (
            this.creditsElement
        ) {

            this.creditsElement.textContent =
                Credits.format(
                    Credits.get()
                );
        }


        if (
            this.efficiencyElement
        ) {

            this.efficiencyElement.textContent =
                State.efficiency;
        }


        if (
            this.upgradeCostElement
        ) {

            this.upgradeCostElement.textContent =
                Credits.format(
                    State.upgradeCost
                );
        }


        if (
            this.upgradeButton
        ) {

            const available =
                Economy.canUpgrade();


            this.upgradeButton.disabled =
                !available;


            this.upgradeButton.style.opacity =
                available
                    ? "1"
                    : "0.45";


            this.upgradeButton.style.cursor =
                available
                    ? "pointer"
                    : "not-allowed";
        }
    },


    /* =====================================================
       LOG
       ===================================================== */

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

    enabled:
        true,


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
