/* =========================================================
   SYSTeM
   CORE v0.1.2
   Economy + Upgrade
   ========================================================= */


/* =========================================================
   SYSTEM CONFIG
   ========================================================= */

const SYSTEM_CONFIG = {

    name:
        "SYSTeM",

    version:
        "0.1.2",

    module:
        "CORE",

    initialResource:
        0,

    resourceStep:
        1,

    maxLogEntries:
        50,

    initialCredits:
        0,

    initialEfficiency:
        1,

    initialUpgradeCost:
        10,

    upgradeCostMultiplier:
        1.5,

    resourceToCredits:
        1
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

    ready:
        true,

    initialized:
        false
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


    spend(amount) {

        if (
            amount <= 0 ||
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

        State.credits += amount;

        return State.credits;
    },


    spend(amount) {

        if (
            amount <= 0 ||
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

                    cost:
                        State.upgradeCost
                }
            );

            return false;
        }


        const oldCost =
            State.upgradeCost;


        Credits.spend(
            oldCost
        );


        State.efficiency += 1;


        State.upgradeCost =
            Math.ceil(
                oldCost *
                SYSTEM_CONFIG.upgradeCostMultiplier
            );


        UI.renderEconomy();


        Debug.info(
            "Efficiency upgraded",
            {
                efficiency:
                    State.efficiency,

                nextCost:
                    State.upgradeCost
            }
        );


        return true;
    },


    convertResourceToCredits(
        amount
    ) {

        const credits =
            amount *
            SYSTEM_CONFIG.resourceToCredits;


        Credits.add(
            credits
        );


        return credits;
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


        /*
         * Localization
         */

        SYSTEM_I18N.init();


        /*
         * Global language switcher
         */

        SYSTEM_LANGUAGE_SWITCHER.init();


        /*
         * UI
         */

        UI.bindEvents();


        /*
         * Initial system messages
         */

        Log.add(
            "log.systemInitialized"
        );


        Log.add(
            "log.waitingForInput"
        );


        /*
         * Initial render
         */

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

        this.ensureEconomyUI();

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
       ECONOMY UI
       ----------------------------------------------------- */

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

            Debug.error(
                "Process panel not found"
            );

            return;
        }


        /*
         * Main economy container
         */

        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "system-economy";


        /*
         * Keep the existing visual language.
         * No external CSS is required.
         */

        panel.style.marginTop =
            "8px";

        panel.style.padding =
            "6px 8px";

        panel.style.border =
            "1px solid rgba(80,255,140,.20)";

        panel.style.background =
            "rgba(0,20,10,.18)";

        panel.style.fontFamily =
            "inherit";

        panel.style.fontSize =
            "9px";

        panel.style.letterSpacing =
            "2px";


        /*
         * CREDITS
         */

        const creditsRow =
            document.createElement(
                "div"
            );

        creditsRow.style.marginBottom =
            "4px";


        const creditsLabel =
            document.createElement(
                "span"
            );

        creditsLabel.dataset.i18n =
            "economy.credits";


        this.creditsElement =
            document.createElement(
                "span"
            );

        this.creditsElement.style.marginLeft =
            "8px";


        creditsRow.appendChild(
            creditsLabel
        );

        creditsRow.appendChild(
            this.creditsElement
        );


        /*
         * EFFICIENCY
         */

        const efficiencyRow =
            document.createElement(
                "div"
            );

        efficiencyRow.style.marginBottom =
            "4px";


        const efficiencyLabel =
            document.createElement(
                "span"
            );

        efficiencyLabel.dataset.i18n =
            "economy.efficiency";


        this.efficiencyElement =
            document.createElement(
                "span"
            );

        this.efficiencyElement.style.marginLeft =
            "8px";


        efficiencyRow.appendChild(
            efficiencyLabel
        );

        efficiencyRow.appendChild(
            this.efficiencyElement
        );


        /*
         * NEXT UPGRADE
         */

        const upgradeRow =
            document.createElement(
                "div"
            );

        upgradeRow.style.marginBottom =
            "6px";


        const upgradeLabel =
            document.createElement(
                "span"
            );

        upgradeLabel.dataset.i18n =
            "economy.nextUpgrade";


        this.upgradeCostElement =
            document.createElement(
                "span"
            );

        this.upgradeCostElement.style.marginLeft =
            "8px";


        upgradeRow.appendChild(
            upgradeLabel
        );

        upgradeRow.appendChild(
            this.upgradeCostElement
        );


        /*
         * UPGRADE BUTTON
         */

        this.upgradeButton =
            document.createElement(
                "button"
            );


        this.upgradeButton.type =
            "button";


        this.upgradeButton.className =
            "process-button";


        this.upgradeButton.dataset.i18n =
            "economy.upgrade";


        this.upgradeButton.style.width =
            "100%";

        this.upgradeButton.style.height =
            "30px";

        this.upgradeButton.style.minHeight =
            "30px";

        this.upgradeButton.style.margin =
            "0";

        this.upgradeButton.style.fontFamily =
            "inherit";

        this.upgradeButton.style.fontSize =
            "9px";

        this.upgradeButton.style.letterSpacing =
            "2px";


        this.upgradeButton.addEventListener(
            "click",
            () => {

                Economy.upgrade();

            }
        );


        /*
         * Assemble
         */

        panel.appendChild(
            creditsRow
        );

        panel.appendChild(
            efficiencyRow
        );

        panel.appendChild(
            upgradeRow
        );

        panel.appendChild(
            this.upgradeButton
        );


        processPanel.appendChild(
            panel
        );


        this.economyPanel =
            panel;
    },


    /* -----------------------------------------------------
       ECONOMY RENDER
       ----------------------------------------------------- */

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
                "x" +
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
                    : "0.35";


            this.upgradeButton.style.cursor =
                available
                    ? "pointer"
                    : "default";
        }
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
                 * Store translation KEY,
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

        } catch (
            error
        ) {

            Debug.error(
                "Boot failure",
                error
            );
        }

    }
);
