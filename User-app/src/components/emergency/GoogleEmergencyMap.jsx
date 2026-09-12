import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "520px",
};

const defaultCenter = {
  lat: 19.076,
  lng: 72.8777,
};

const GoogleEmergencyMap = ({
  userLocation,
  ambulanceLocation,
  hospitalLocation,
}) => {

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);


  /*
    Calculate route:

    Ambulance
       ↓
    User
       ↓
    Hospital

    For the demo we calculate two route sections.
  */

  useEffect(() => {

    if (
      !isLoaded ||
      !ambulanceLocation ||
      !userLocation ||
      !hospitalLocation
    ) {
      return;
    }

    const service =
      new window.google.maps.DirectionsService();


    // Ambulance → User

    service.route(
      {
        origin: ambulanceLocation,
        destination: userLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },

      (result, status) => {

        if (status === "OK") {
          setDirections(result);
        } else {
          console.error(
            "Directions request failed:",
            status
          );
        }

      }
    );

  }, [
    isLoaded,
    ambulanceLocation,
    userLocation,
    hospitalLocation,
  ]);


  if (loadError) {

    return (
      <div className="
        flex h-130
        items-center justify-center
        rounded-2xl
        border border-red-100
        bg-red-50
        p-6
        text-center
      ">

        <div>

          <p className="font-bold text-red-600">
            Map unavailable
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Unable to load Google Maps.
          </p>

        </div>

      </div>
    );
  }


  if (!isLoaded) {

    return (
      <div className="
        flex h-130
        items-center justify-center
        rounded-2xl
        border border-slate-200
        bg-slate-50
      ">

        <p className="text-sm font-medium text-slate-500">
          Loading emergency map...
        </p>

      </div>
    );
  }


  const center =
    ambulanceLocation ||
    userLocation ||
    defaultCenter;


  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
        }}
      >

        {/* Ambulance */}

        {ambulanceLocation && (

          <MarkerF
            position={ambulanceLocation}
            label={{
              text: "🚑",
              fontSize: "22px",
            }}
          />

        )}


        {/* User */}

        {userLocation && (

          <MarkerF
            position={userLocation}
            label={{
              text: "📍",
              fontSize: "22px",
            }}
          />

        )}


        {/* Hospital */}

        {hospitalLocation && (

          <MarkerF
            position={hospitalLocation}
            label={{
              text: "🏥",
              fontSize: "22px",
            }}
          />

        )}


        {/* Route */}

        {directions && (

          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeOpacity: 0.8,
                strokeWeight: 5,
              },
            }}
          />

        )}

      </GoogleMap>

    </div>
  );
};

export default GoogleEmergencyMap;