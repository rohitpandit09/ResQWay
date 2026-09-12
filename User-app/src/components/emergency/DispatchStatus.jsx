import {
  Ambulance,
  MapPin,
  LoaderCircle,
  Phone,
  CheckCircle2,
} from "lucide-react";

const DispatchStatus = ({
  status = "searching",
  driverName = null,
  countdown = 10,
}) => {
  return (
    <div className="mx-auto max-w-2xl">

      {/* Main Card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Icon */}

        <div className="flex justify-center">

          <div className="
            flex h-20 w-20
            items-center justify-center
            rounded-full bg-red-50
          ">

            {status === "accepted" ? (

              <CheckCircle2
                size={38}
                className="text-green-600"
              />

            ) : (

              <Ambulance
                size={38}
                className="text-red-600"
              />

            )}

          </div>

        </div>


        {/* Heading */}

        <div className="mt-6 text-center">

          {status === "searching" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Finding an Ambulance
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                We're finding the nearest available ambulance for you.
              </p>
            </>
          )}


          {status === "contacting" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Contacting Ambulance
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Waiting for the nearest ambulance to respond.
              </p>
            </>
          )}


          {status === "accepted" && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Ambulance Confirmed
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Your ambulance is on the way.
              </p>
            </>
          )}

        </div>


        {/* Searching */}

        {status === "searching" && (

          <div className="
            mt-8 flex items-center
            justify-center gap-3
            rounded-xl bg-slate-50 p-5
          ">

            <LoaderCircle
              size={20}
              className="animate-spin text-red-600"
            />

            <span className="text-sm font-medium text-slate-700">
              Searching nearby ambulances...
            </span>

          </div>

        )}


        {/* Driver Contact */}

        {status === "contacting" && (

          <div className="mt-8 rounded-xl bg-slate-50 p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full bg-white
                ">

                  <Ambulance
                    size={20}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    {driverName || "Nearest Ambulance"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Waiting for response
                  </p>

                </div>

              </div>


              {/* Countdown */}

              <div className="
                flex h-12 w-12
                items-center justify-center
                rounded-full border-2 border-red-100
                text-sm font-bold text-red-600
              ">

                {countdown}s

              </div>

            </div>

          </div>

        )}


        {/* Accepted */}

        {status === "accepted" && (

          <div className="mt-8 rounded-xl border border-green-100 bg-green-50 p-5">

            <div className="flex items-center gap-3">

              <CheckCircle2
                size={22}
                className="text-green-600"
              />

              <div>

                <p className="text-sm font-bold text-slate-800">
                  Ambulance accepted your request
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Preparing your emergency session...
                </p>

              </div>

            </div>

          </div>

        )}


        {/* Location */}

        <div className="
          mt-5 flex items-center
          gap-3 rounded-xl
          border border-slate-200
          p-4
        ">

          <MapPin
            size={19}
            className="text-red-600"
          />

          <div>

            <p className="text-sm font-semibold text-slate-800">
              Your current location
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Shared securely for ambulance matching
            </p>

          </div>

        </div>


        {/* Emergency Information */}

        <div className="
          mt-5 flex items-center
          gap-3 rounded-xl
          bg-red-50 p-4
        ">

          <Phone
            size={18}
            className="text-red-600"
          />

          <p className="text-xs leading-5 text-slate-600">

            Please keep your phone available.
            The ambulance driver may contact you.

          </p>

        </div>

      </div>

    </div>
  );
};

export default DispatchStatus;