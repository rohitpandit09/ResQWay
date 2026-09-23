import { SignalController } from "./src/signals/signalController.js";

console.log("\n========== SIGNAL CONTROLLER TEST ==========\n");

const signal = new SignalController("INT-01");

for (let second = 1; second <= 45; second++) {

    signal.tick(1);

    const state = signal.getState();

    console.log(
        `T+${second}s | ${state.phase} | ${state.remainingSeconds}s`
    );
}

console.log("\n============================================\n");