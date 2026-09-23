import {
    TrafficVehicle,
    VEHICLE_TYPES
} from "./trafficVehicle.js";


// --------------------------------------------------
// DEFAULT TRAFFIC MIX
// --------------------------------------------------

const DEFAULT_TRAFFIC_TYPES = [
    VEHICLE_TYPES.CAR,
    VEHICLE_TYPES.CAR,
    VEHICLE_TYPES.BIKE,
    VEHICLE_TYPES.BIKE,
    VEHICLE_TYPES.AUTO,
    VEHICLE_TYPES.BUS,
    VEHICLE_TYPES.TRUCK
];


// --------------------------------------------------
// TRAFFIC GENERATOR
// --------------------------------------------------

export class TrafficGenerator {

    constructor() {

        this.vehicleCounter = 0;

        this.vehicles = [];
    }


    generateVehicle({
        type,
        roadId,
        laneId,
        currentNode,
        nextNode,
        route = []
    }) {

        this.vehicleCounter++;

        const vehicleId =
            `TRAFFIC-${String(this.vehicleCounter).padStart(3, "0")}`;


        const vehicle = new TrafficVehicle({

            id: vehicleId,

            type,

            roadId,

            laneId,

            currentNode,

            nextNode,

            route

        });


        this.vehicles.push(vehicle);


        return vehicle;
    }


    generateInitialTraffic() {

        const generatedVehicles = [];


        const spawnConfig = [

            {
                type: VEHICLE_TYPES.CAR,
                roadId: "ROAD-01",
                laneId: "ROAD-01-FORWARD-1",
                currentNode: "INT-01",
                nextNode: "INT-02",
                route: [
                    "INT-01",
                    "INT-02",
                    "INT-03"
                ]
            },

            {
                type: VEHICLE_TYPES.BIKE,
                roadId: "ROAD-01",
                laneId: "ROAD-01-FORWARD-2",
                currentNode: "INT-01",
                nextNode: "INT-02",
                route: [
                    "INT-01",
                    "INT-02",
                    "INT-03"
                ]
            },

            {
                type: VEHICLE_TYPES.AUTO,
                roadId: "ROAD-02",
                laneId: "ROAD-02-FORWARD-1",
                currentNode: "INT-02",
                nextNode: "INT-03",
                route: [
                    "INT-02",
                    "INT-03",
                    "INT-04"
                ]
            },

            {
                type: VEHICLE_TYPES.BUS,
                roadId: "ROAD-03",
                laneId: "ROAD-03-FORWARD-1",
                currentNode: "INT-03",
                nextNode: "INT-04",
                route: [
                    "INT-03",
                    "INT-04",
                    "INT-01"
                ]
            },

            {
                type: VEHICLE_TYPES.TRUCK,
                roadId: "ROAD-04",
                laneId: "ROAD-04-FORWARD-1",
                currentNode: "INT-04",
                nextNode: "INT-01",
                route: [
                    "INT-04",
                    "INT-01",
                    "INT-02"
                ]
            },

            {
                type: VEHICLE_TYPES.CAR,
                roadId: "ROAD-02",
                laneId: "ROAD-02-BACKWARD-1",
                currentNode: "INT-03",
                nextNode: "INT-02",
                route: [
                    "INT-03",
                    "INT-02",
                    "INT-01"
                ]
            },

            {
                type: VEHICLE_TYPES.BIKE,
                roadId: "ROAD-03",
                laneId: "ROAD-03-BACKWARD-2",
                currentNode: "INT-04",
                nextNode: "INT-03",
                route: [
                    "INT-04",
                    "INT-03",
                    "INT-02"
                ]
            }
        ];


        for (const config of spawnConfig) {

            const vehicle =
                this.generateVehicle(config);

            generatedVehicles.push(vehicle);
        }


        return generatedVehicles;
    }


    getVehicles() {

        return this.vehicles;
    }


    getVehicle(vehicleId) {

        return this.vehicles.find(
            vehicle => vehicle.id === vehicleId
        ) || null;
    }


    getVehicleStates() {

        return this.vehicles.map(
            vehicle => vehicle.getState()
        );
    }
}