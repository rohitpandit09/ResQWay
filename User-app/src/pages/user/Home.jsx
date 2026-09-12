import { useState } from "react";
import { useNavigate } from "react-router";

import EmergencyBanner from "../../components/home/EmergencyBanner";
import LocationCard from "../../components/home/LocationCard";
import HowItWorks from "../../components/home/HowItWorks";

const Home = () => {
  const navigate = useNavigate();

  const [locationStatus, setLocationStatus] = useState("idle");

  const handleCallAmbulance = () => {
    setLocationStatus("locating");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("User Latitude:", latitude);
        console.log("User Longitude:", longitude);

        // Temporary:
        // Later these coordinates will be sent to the backend.
        //
        // POST /api/emergency/create
        //
        // {
        //   latitude,
        //   longitude
        // }

        setLocationStatus("found");

        setTimeout(() => {
          navigate("/emergency");
        }, 700);
      },

      (error) => {
        console.error("Location Error:", error);
        setLocationStatus("error");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">

      {/* Heading */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Emergency Assistance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Get help quickly when you need it.
        </p>
      </div>


      {/* Emergency Section */}

      <EmergencyBanner
        onCallAmbulance={handleCallAmbulance}
        locationStatus={locationStatus}
      />


      {/* Location + How it works */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        <LocationCard
          locationStatus={locationStatus}
        />

        <HowItWorks />

      </div>

    </div>
  );
};

export default Home;