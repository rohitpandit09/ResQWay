// src/hooks/useEmergency.js
// Manages emergency state for the DriverApp.
//
// Backend reality (from inspecting emergencyService.js + emergencyRoutes.js):
//
//   POST   /api/emergencies          → create emergency (UserApp triggers this)
//   GET    /api/emergencies          → list all emergencies
//   GET    /api/emergencies/:id      → get single emergency
//
// There is NO driver-accept/reject endpoint on the backend yet.
// The backend auto-dispatches the ambulance immediately on creation.
//
// MISSING BACKEND CAPABILITIES reported at bottom of this file.

import { useState, useCallback, useRef } from "react";
import { API_ENDPOINTS, EMERGENCY_STATES } from "../constants.js";

// ==================================================
// USE EMERGENCY
// ==================================================

export function useEmergency() {
  // The active emergency assigned to this driver
  const [activeEmergency, setActiveEmergency] = useState(null);

  // History of completed/cancelled emergencies
  const [emergencyHistory, setEmergencyHistory] = useState([]);

  // Pending incoming emergency (waiting for driver accept/reject)
  const [pendingEmergency, setPendingEmergency] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track emergency IDs we've already seen to avoid duplicates
  const seenIdsRef = useRef(new Set());

  // --------------------------------------------------
  // HANDLE EMERGENCY CREATED (from socket)
  // Called by useSocket when emergency:created fires.
  // --------------------------------------------------

  const handleEmergencyCreated = useCallback((emergency) => {
    if (!emergency?.id) return;

    // Ignore if we've already processed this emergency
    if (seenIdsRef.current.has(emergency.id)) return;
    seenIdsRef.current.add(emergency.id);

    console.log("[useEmergency] Emergency created:", emergency);

    // Present to driver as a pending request to accept/reject
    setPendingEmergency(emergency);
  }, []);

  // --------------------------------------------------
  // HANDLE EMERGENCY UPDATED (from socket)
  // Called by useSocket when emergency:updated fires.
  // Backend auto-transitions ambulance states — this
  // keeps the driver UI in sync.
  // --------------------------------------------------

  const handleEmergencyUpdated = useCallback((emergency) => {
    if (!emergency?.id) return;

    console.log("[useEmergency] Emergency updated:", emergency);

    setActiveEmergency((prev) => {
      if (prev?.id === emergency.id) {
        return { ...emergency };
      }
      return prev;
    });

    setPendingEmergency((prev) => {
      if (prev?.id === emergency.id) {
        return { ...emergency };
      }
      return prev;
    });

    // Move to history when terminal state is reached
    if (
      emergency.state === EMERGENCY_STATES.COMPLETED ||
      emergency.state === EMERGENCY_STATES.CANCELLED
    ) {
      setActiveEmergency(null);
      setPendingEmergency(null);
      setEmergencyHistory((prev) => {
        // Avoid duplicate history entries
        const exists = prev.some((e) => e.id === emergency.id);
        if (exists) {
          return prev.map((e) => (e.id === emergency.id ? emergency : e));
        }
        return [emergency, ...prev];
      });
    }
  }, []);

  // --------------------------------------------------
  // ACCEPT EMERGENCY
  // Driver accepts the pending emergency.
  //
  // BACKEND GAP: The backend has no driver-accept endpoint.
  // EmergencyService auto-dispatches on creation.
  // So "accepting" here means the driver acknowledges
  // the dispatch and moves it from pending → active.
  // This is a local state transition only.
  //
  // When the backend adds a driver-accept endpoint,
  // this function should call it first.
  // --------------------------------------------------

  const acceptEmergency = useCallback(() => {
    if (!pendingEmergency) return;

    console.log("[useEmergency] Driver accepted emergency:", pendingEmergency.id);
    setActiveEmergency(pendingEmergency);
    setPendingEmergency(null);
  }, [pendingEmergency]);

  // --------------------------------------------------
  // REJECT EMERGENCY
  //
  // BACKEND GAP: No reject endpoint exists.
  // This clears the pending emergency from the driver's
  // view only. The backend ambulance is already
  // dispatched and continues regardless.
  //
  // When the backend adds a driver-reject endpoint,
  // this function should call it first.
  // --------------------------------------------------

  const rejectEmergency = useCallback(() => {
    if (!pendingEmergency) return;

    console.log("[useEmergency] Driver rejected emergency:", pendingEmergency.id);
    setPendingEmergency(null);
  }, [pendingEmergency]);

  // --------------------------------------------------
  // FETCH ALL EMERGENCIES (REST)
  // Useful for restoring state on page reload.
  // --------------------------------------------------

  const fetchEmergencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_ENDPOINTS.EMERGENCIES);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch emergencies");
      }

      const emergencies = data.emergencies || [];

      // Restore active emergency if backend has one in-progress
      const inProgress = emergencies.find((e) =>
        [
          EMERGENCY_STATES.DRIVER_ASSIGNED,
          EMERGENCY_STATES.EN_ROUTE_TO_CLIENT,
          EMERGENCY_STATES.ARRIVED_AT_CLIENT,
          EMERGENCY_STATES.PICKUP,
          EMERGENCY_STATES.EN_ROUTE_TO_HOSPITAL,
          EMERGENCY_STATES.ARRIVED_AT_HOSPITAL,
        ].includes(e.state)
      );

      if (inProgress) {
        seenIdsRef.current.add(inProgress.id);
        setActiveEmergency(inProgress);
      }

      // Load history
      const done = emergencies.filter(
        (e) =>
          e.state === EMERGENCY_STATES.COMPLETED ||
          e.state === EMERGENCY_STATES.CANCELLED
      );
      setEmergencyHistory(done);

      return emergencies;
    } catch (err) {
      setError(err.message);
      console.error("[useEmergency] fetchEmergencies error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH SINGLE EMERGENCY (REST)
  // --------------------------------------------------

  const fetchEmergency = useCallback(async (emergencyId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_ENDPOINTS.EMERGENCY(emergencyId));
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Emergency not found");
      }

      return data.emergency;
    } catch (err) {
      setError(err.message);
      console.error("[useEmergency] fetchEmergency error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // CLEAR ACTIVE EMERGENCY (local reset)
  // --------------------------------------------------

  const clearActiveEmergency = useCallback(() => {
    setActiveEmergency(null);
    setPendingEmergency(null);
  }, []);

  return {
    activeEmergency,
    pendingEmergency,
    emergencyHistory,
    loading,
    error,
    handleEmergencyCreated,
    handleEmergencyUpdated,
    acceptEmergency,
    rejectEmergency,
    fetchEmergencies,
    fetchEmergency,
    clearActiveEmergency,
  };
}

// ==================================================
// MISSING BACKEND CAPABILITIES
// ==================================================
//
// The following operations DO NOT currently exist
// in the backend and are required for a complete
// driver workflow:
//
// 1. DRIVER ACCEPT EMERGENCY
//    Endpoint:  PUT /api/emergencies/:id/accept
//    Payload:   { driverId }
//    Response:  { success, emergency }
//    Purpose:   Confirms driver has accepted the dispatch.
//
// 2. DRIVER REJECT EMERGENCY
//    Endpoint:  PUT /api/emergencies/:id/reject
//    Payload:   { driverId, reason }
//    Response:  { success, emergency }
//    Purpose:   Reassign to another ambulance or cancel.
//
// 3. DRIVER ONLINE/OFFLINE STATUS
//    Endpoint:  PUT /api/drivers/:driverId/status
//    Payload:   { status: "ONLINE" | "OFFLINE" }
//    Response:  { success, driver }
//    Purpose:   Backend knows which drivers are available.
//
// Until these endpoints exist, the DriverApp manages
// accept/reject/status as local UI state only.
// The backend ambulance continues its lifecycle
// regardless of driver UI interaction.
// ==================================================
