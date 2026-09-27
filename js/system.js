/* =========================================================
   RADIO ENGINE
   Native HTML5 Audio
   ========================================================= */

const Radio = {

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
       Put radio directly into
       language switcher.
       ----------------------------------------------------- */

    createControls() {

        const languageSwitcher =
            document.querySelector(
                ".language-switcher"
            );


        if (
            !languageSwitcher
        ) {

            Debug.error(
                "Language switcher not found"
            );

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


        /*
         * IMPORTANT:
         * Radio is now physically inside
         * the language switcher.
         */

        languageSwitcher.appendChild(
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


        if (
            !audio.paused
        ) {

            return;
        }


        try {

            await audio.play();


            this.updateButtons();


            Debug.info(
                "Radio play confirmed"
            );

        } catch (
            error
        ) {

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
