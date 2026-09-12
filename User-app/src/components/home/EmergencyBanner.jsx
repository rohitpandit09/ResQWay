import {
  Phone,
  MapPin,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const EmergencyBanner = ({
  onCallAmbulance,
  locationStatus,
}) => {

  const isLocating = locationStatus === "locating";
  const locationFound = locationStatus === "found";
  const locationError = locationStatus === "error";

  return (
    <section className="overflow-hidden rounded-2xl border border-red-100 bg-white">

      <div className="grid min-h-90 lg:grid-cols-2">

        {/* Left */}

        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">

          <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">

            <span className="h-2 w-2 rounded-full bg-red-600" />

            Emergency Assistance

          </div>


          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">

            Need an{" "}

            <span className="text-red-600">
              Ambulance?
            </span>

          </h1>


          <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">

            Get connected with the nearest available
            ambulance when every second matters.

          </p>


          {/* Error */}

          {locationError && (

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-red-600">

              <AlertCircle size={17} />

              Unable to access your location.
              Please allow location access.

            </div>

          )}


          {/* Call Button */}

          <button
            onClick={onCallAmbulance}
            disabled={isLocating}
            className="
              mt-8 flex w-fit items-center
              gap-3 rounded-xl
              bg-red-600 px-7 py-4
              text-sm font-bold text-white
              shadow-lg shadow-red-100
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-80
              active:scale-[0.98]
            "
          >

            {isLocating ? (

              <>
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />

                Finding Location...

              </>

            ) : locationFound ? (

              <>
                <CheckCircle2 size={20} />

                Location Found

              </>

            ) : (

              <>
                <span className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full bg-white/15
                ">

                  <Phone size={18} />

                </span>

                CALL AMBULANCE

              </>

            )}

          </button>

        </div>


        {/* Right */}

        <div className="relative hidden bg-red-50 lg:flex lg:items-center lg:justify-center">

          <div className="absolute inset-0">

            <div className="
              absolute -right-20 -top-20
              h-64 w-64
              rounded-full
              border-30
              border-red-100
            " />

            <div className="
              absolute -bottom-25 -left-25
              h-72 w-72
              rounded-full
              border-35
              border-red-100
            " />

          </div>


          <div className="relative flex flex-col items-center">

            <div className="
              flex h-36 w-36
              items-center justify-center
              rounded-full bg-white
              shadow-sm
            ">

              <MapPin
                size={55}
                strokeWidth={1.5}
                className="text-red-600"
              />

            </div>


            <p className="mt-5 text-sm font-semibold text-slate-700">
              Your location helps us find the nearest ambulance
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default EmergencyBanner;