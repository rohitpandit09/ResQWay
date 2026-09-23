import {
    SIGNAL_PHASES,
    DEFAULT_SIGNAL_TIMINGS,
    getNextPhase
} from "./signalPhases.js";


export class SignalController {

    constructor(intersectionId) {

        this.intersectionId = intersectionId;

        this.phase = SIGNAL_PHASES.NORTH_SOUTH_GREEN;

        this.remainingSeconds =
            DEFAULT_SIGNAL_TIMINGS[this.phase];

        this.mode = "NORMAL";
    }


    tick(seconds = 1) {

        this.remainingSeconds -= seconds;

        if (this.remainingSeconds <= 0) {

            this.advancePhase();
        }
    }


    advancePhase() {

        this.phase = getNextPhase(this.phase);

        this.remainingSeconds =
            DEFAULT_SIGNAL_TIMINGS[this.phase];
    }


    getState() {

        return {
            intersectionId: this.intersectionId,

            phase: this.phase,

            remainingSeconds:
                Math.max(0, this.remainingSeconds),

            mode: this.mode
        };
    }
}