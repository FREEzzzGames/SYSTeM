"use strict";

/*
 * ============================================================
 * SYSTeM
 * CORE FOUNDATION
 * Version: 0.1.0
 *
 * Current modules:
 * - Core
 * - State
 * - Process
 * - Resources
 * - Log
 *
 * Not implemented yet:
 * - Economy
 * - Upgrades
 * - Automation
 * - Technology
 * - Story
 * - Events
 * - Offline
 * - Prestige
 *
 * Architecture rule:
 *
 * UI -> Game API -> State
 *
 * UI must never directly modify game state.
 * ============================================================
 */


/* ============================================================
   CONFIGURATION
   ============================================================ */

const SYSTEM_CONFIG = Object.freeze({

    version: "0.1.0",

    resource: {
        id: "resource",
        initial: 0
    },

    log: {
        maxEntries: 100
    }

});


/* ============================================================
   STATE
   ============================================================ */

const State = {

    data: {

        version: SYSTEM_CONFIG.version,

        resources: {
            resource: SYSTEM_CONFIG.resource.initial
        },

        progression: {
            level: 1
        },

        statistics: {
            totalProcesses: 0,
            sessionProcesses: 0
        },

        story: {
            currentLevel: 1,
            eventsSeen: []
        },

        settings: {},

        session: {
            startedAt: Date.now()
        }

    },


    get() {
        return this.data;
    },


    reset() {

        this.data = {

            version: SYSTEM_CONFIG.version,

            resources: {
                resource: SYSTEM_CONFIG.resource.initial
            },

            progression: {
                level: 1
            },

            statistics: {
                totalProcesses: 0,
                sessionProcesses: 0
            },

            story: {
                currentLevel: 1,
                eventsSeen: []
            },

            settings: {},

            session: {
                startedAt: Date.now()
            }

        };

    }

};


/* ============================================================
   RESOURCES
   ============================================================ */

const Resources = {

    get(id = SYSTEM_CONFIG.resource.id) {

        return State.data.resources[id] ?? 0;

    },


    add(id, amount) {

        if (!Number.isFinite(amount)) {
            return false;
        }

        if (amount <= 0) {
            return false;
        }

        if (!(id in State.data.resources)) {
            State.data.resources[id] = 0;
        }

        State.data.resources[id] += amount;

        return true;

    },


    remove(id, amount) {

        if (!Number.isFinite(amount)) {
            return false;
        }

        if (amount <= 0) {
            return false;
        }

        const current = this.get(id);

        if (current < amount) {
            return false;
        }

        State.data.resources[id] -= amount;

        return true;

    },


    has(id, amount) {

        return this.get(id) >= amount;

    }

};


/* ============================================================
   LOG
   ============================================================ */

const Log = {

    entries: [],


    add(message, type = "system") {

        const entry = {

            id: `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

            timestamp: Date.now(),

            type,

            message

        };

        this.entries.push(entry);


        if (
            this.entries.length >
            SYSTEM_CONFIG.log.maxEntries
        ) {

            this.entries.shift();

        }


        UI.renderLog();

        return entry;

    }

};


/* ============================================================
   PROCESS
   ============================================================ */

const Process = {

    execute() {

        Resources.add(
            SYSTEM_CONFIG.resource.id,
            1
        );


        State.data.statistics.totalProcesses += 1;

        State.data.statistics.sessionProcesses += 1;


        Log.add("PROCESS COMPLETE");


        UI.render();

    }

};


/* ============================================================
   GAME CORE
   ============================================================ */

const Game = {

    initialized: false,


    init() {

        if (this.initialized) {
            return;
        }


        this.initialized = true;


        UI.cache();


        UI.render();


        Log.add("SYSTEM INITIALIZED");

        Log.add("WAITING FOR INPUT");


        console.info(
            `[SYSTeM] CORE ${SYSTEM_CONFIG.version} initialized`
        );

    },


    process() {

        Process.execute();

    },


    tick() {

        /*
         * Reserved for the future game loop.
         *
         * Later this will handle:
         * - passive production
         * - timers
         * - events
         * - offline calculations
         *
         * Nothing is intentionally executed here yet.
         */

    },


    getState() {

        return State.get();

    }

};


/* ============================================================
   UI
   ============================================================ */

const UI = {

    elements: {},


    cache() {

        this.elements.resourceValue =
            document.getElementById(
                "resource-value"
            );


        this.elements.processButton =
            document.getElementById(
                "process-button"
            );


        this.elements.systemLog =
            document.getElementById(
                "system-log"
            );


        this.elements.saveStatus =
            document.getElementById(
                "save-status"
            );


        this.elements.processButton
            .addEventListener(
                "click",
                () => {

                    Game.process();

                }
            );

    },


    render() {

        this.renderResource();

        this.renderLog();

        this.renderSaveStatus();

    },


    renderResource() {

        const value =
            Resources.get(
                SYSTEM_CONFIG.resource.id
            );


        this.elements.resourceValue
            .textContent =
            String(value).padStart(6, "0");

    },


    renderLog() {

        const container =
            this.elements.systemLog;


        if (!container) {
            return;
        }


        container.innerHTML = "";


        for (const entry of Log.entries) {

            const line =
                document.createElement("div");

            line.className = "log-line";


            const prefix =
                document.createElement("span");

            prefix.className = "log-prefix";

            prefix.textContent = ">";


            const message =
                document.createElement("span");

            message.textContent =
                entry.message;


            line.appendChild(prefix);

            line.appendChild(message);

            container.appendChild(line);

        }


        container.scrollTop =
            container.scrollHeight;

    },


    renderSaveStatus() {

        if (!this.elements.saveStatus) {
            return;
        }


        this.elements.saveStatus
            .textContent =
            "STATE: READY";

    }

};


/* ============================================================
   DEBUG
   ============================================================ */

const Debug = {

    inspect() {

        console.log(
            "========== SYSTeM DEBUG =========="
        );


        console.log(
            "Version:",
            SYSTEM_CONFIG.version
        );


        console.log(
            "State:",
            State.get()
        );


        console.log(
            "Resources:",
            State.data.resources
        );


        console.log(
            "Statistics:",
            State.data.statistics
        );


        console.log(
            "Log:",
            Log.entries
        );


        console.log(
            "=================================="
        );

    }

};


/* ============================================================
   GLOBAL DEBUG ACCESS
   ============================================================ */

window.SYSTEM = {

    version: SYSTEM_CONFIG.version,

    Game,

    State,

    Resources,

    Process,

    Log,

    UI,

    Debug

};


/* ============================================================
   BOOT
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Game.init();

    }
);
