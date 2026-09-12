import { useState } from "react";

import EmergencyHeader from "../../components/emergency/EmergencyHeader";
import GoogleEmergencyMap from "../../components/emergency/GoogleEmergencyMap";
import AmbulanceStatus from "../../components/emergency/AmbulanceStatus";
import NextSignalCard from "../../components/emergency/NextSignalCard";
import EmergencyCompleted from "../../components/emergency/EmergencyCompleted";

const LiveEmergency = () => {

  const [sessionCompleted, setSessionCompleted] = useState(false);

  const userLocation = {
    lat: 19.0760,
    lng: 72.8777,
  };

  const ambulanceLocation = {
    lat: 19.0660,
    lng: 72.8877,
  };

  const hospitalLocation = {
    lat: 19.0850,
    lng: 72.8650,
  };


  /*
    TEMPORARY DEMO

    Remove this button later.

    Actual flow:

    Driver reaches hospital
          ↓
    Driver manually ends session
          ↓
    Backend updates session
          ↓
    Frontend receives:
    EMERGENCY_COMPLETED
          ↓
    Show completed screen
  */


  if (sessionCompleted) {

    return <EmergencyCompleted />;

  }


  return (
    <div className="mx-auto max-w-7xl">

      <EmergencyHeader />


      {/* Live Map */}

      <div className="mt-6">

        <GoogleEmergencyMap
          userLocation={userLocation}
          ambulanceLocation={ambulanceLocation}
          hospitalLocation={hospitalLocation}
        />

      </div>


      {/* Emergency Information */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        <AmbulanceStatus />

        <NextSignalCard />

      </div>


      {/* TEMPORARY DEMO BUTTON */}

      <div className="mt-6 flex justify-center">

        <button
          onClick={() => setSessionCompleted(true)}
          className="
            rounded-lg
            border border-slate-200
            bg-white
            px-5 py-2.5
            text-sm font-semibold
            text-slate-600
            transition
            hover:border-red-200
            hover:text-red-600
          "
        >
          Demo: Complete Emergency
        </button>

      </div>

    </div>
  );
};

export default LiveEmergency;