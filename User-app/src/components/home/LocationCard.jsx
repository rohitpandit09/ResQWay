import {
  MapPin,
  LocateFixed,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const LocationCard = ({ locationStatus }) => {

  const isLocating = locationStatus === "locating";
  const locationFound = locationStatus === "found";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-base font-bold text-slate-900">
            Your Location
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Used to find the nearest ambulance
          </p>

        </div>


        <div className="
          flex h-10 w-10
          items-center justify-center
          rounded-full bg-red-50
        ">

          <MapPin
            size={20}
            className="text-red-600"
          />

        </div>

      </div>


      <div className="
        mt-5 flex items-center gap-3
        rounded-xl bg-slate-50 p-4
      ">

        {isLocating ? (

          <LoaderCircle
            size={19}
            className="animate-spin text-red-600"
          />

        ) : locationFound ? (

          <CheckCircle2
            size={19}
            className="text-green-600"
          />

        ) : (

          <LocateFixed
            size={19}
            className="text-slate-500"
          />

        )}


        <div>

          <p className="text-sm font-semibold text-slate-800">

            {isLocating
              ? "Detecting your location..."
              : locationFound
                ? "Location detected"
                : "Current location"
            }

          </p>


          <p className="mt-0.5 text-xs text-slate-500">

            {isLocating
              ? "Please allow location access"
              : locationFound
                ? "Ready to find nearby ambulance"
                : "Location will be detected automatically"
            }

          </p>

        </div>

      </div>

    </div>
  );
};

export default LocationCard;