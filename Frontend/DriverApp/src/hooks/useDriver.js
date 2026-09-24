// src/hooks/useDriver.js
// Manages the local driver status (OFFLINE / ONLINE / ON_EMERGENCY).
//
// BACKEND REALITY:
// The backend currently has NO driver status endpoint.
// Driver status is maintained as local frontend state.
// When the backend adds a driver registration/status API,
// this hook should call it on status changes.

import { useState, useCallback, useEffect } from "react";
import { DRIVER_STATUS, EMERGENCY_STATES } from "../constants.js";

// Persist driver status across page refreshes
const STORAGE_KEY = "resqway_driver_status";

// ==================================================
// USE DRIVER
// ==================================================

export function useDriver({ activeEmergency } = {}) {
  const [driverStatus, setDriverStatus] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DRIVER_STATUS.OFFLINE;
    } catch {
      return DRIVER_STATUS.OFFLINE;
    }
  });

  // --------------------------------------------------
  // SYNC TO EMERGENCY STATE
  // When backend pushes an active emergency,
  // automatically set driver to ON_EMERGENCY.
  // --------------------------------------------------

  useEffect(() => {
    if (!activeEmergency) {
      // If driver was ON_EMERGENCY but emergency is gone, go back to ONLINE
      setDriverStatus((prev) => {
        if (prev === DRIVER_STATUS.ON_EMERGENCY) {
          return DRIVER_STATUS.ONLINE;
        }
        return prev;
      });
      return;
    }

    const terminalStates = [
      EMERGENCY_STATES.COMPLETED,
      EMERGENCY_STATES.CANCELLED,
    ];

    if (terminalStates.includes(activeEmergency.state)) {
      // Emergency is done — driver returns to ONLINE
      setDriverStatus((prev) => {
        if (prev === DRIVER_STATUS.ON_EMERGENCY) {
          return DRIVER_STATUS.ONLINE;
        }
        return prev;
      });
    } else {
      // Active emergency in progress
      setDriverStatus(DRIVER_STATUS.ON_EMERGENCY);
    }
  }, [activeEmergency]);

  // --------------------------------------------------
  // PERSIST STATUS
  // --------------------------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, driverStatus);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [driverStatus]);

  // --------------------------------------------------
  // GO ONLINE
  // --------------------------------------------------

  const goOnline = useCallback(() => {
    setDriverStatus(DRIVER_STATUS.ONLINE);
    // TODO: When backend driver status endpoint exists,
    // call: PUT /api/drivers/:driverId/status { status: "ONLINE" }
  }, []);

  // --------------------------------------------------
  // GO OFFLINE
  // --------------------------------------------------

  const goOffline = useCallback(() => {
    setDriverStatus(DRIVER_STATUS.OFFLINE);
    // TODO: When backend driver status endpoint exists,
    // call: PUT /api/drivers/:driverId/status { status: "OFFLINE" }
  }, []);

  // --------------------------------------------------
  // DERIVED BOOLEANS
  // --------------------------------------------------

  const isOffline = driverStatus === DRIVER_STATUS.OFFLINE;
  const isOnline = driverStatus === DRIVER_STATUS.ONLINE;
  const isOnEmergency = driverStatus === DRIVER_STATUS.ON_EMERGENCY;

  return {
    driverStatus,
    isOffline,
    isOnline,
    isOnEmergency,
    goOnline,
    goOffline,
  };
}
