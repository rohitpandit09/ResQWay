import {
  startSimulation,
  getSimulation,
  stopSimulation,
} from "./src/simulation/simulationManager.js";


const emergencyId = "EMG-TEST-001";


// Start
startSimulation(emergencyId);


// Monitor simulation
const monitor = setInterval(() => {
  const simulation =
    getSimulation(emergencyId);

  if (!simulation) {
    console.log(
      "Simulation no longer active."
    );

    clearInterval(monitor);

    process.exit(0);
  }


  console.log(
    `[${simulation.simulationTime.toFixed(1)}s]`,
    `Status: ${simulation.ambulance.status}`,
    `Current: ${simulation.ambulance.currentNode}`,
    `Next: ${simulation.ambulance.nextNode}`,
    `Speed: ${simulation.ambulance.speed.toFixed(2)}`,
    `Progress: ${simulation.ambulance.progress.toFixed(2)}`
  );

}, 1000);


// Automatically stop after 60 seconds
setTimeout(() => {
  stopSimulation(emergencyId);

  clearInterval(monitor);

  process.exit(0);

}, 60000);