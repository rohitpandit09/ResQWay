import {
  Ambulance,
  Navigation,
  Clock3,
} from "lucide-react";

const AmbulanceStatus = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl bg-red-50
          ">

            <Ambulance
              size={21}
              className="text-red-600"
            />

          </div>

          <div>

            <p className="text-sm font-bold text-slate-900">
              Ambulance
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Approaching your location
            </p>

          </div>

        </div>


        <span className="
          rounded-full
          bg-green-50
          px-3 py-1
          text-[11px]
          font-bold
          text-green-600
        ">
          ON THE WAY
        </span>

      </div>


      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <Clock3
              size={16}
              className="text-slate-500"
            />

            <span className="text-xs text-slate-500">
              ETA
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-slate-900">
            07:32
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Estimated arrival
          </p>

        </div>


        <div className="rounded-xl bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <Navigation
              size={16}
              className="text-slate-500"
            />

            <span className="text-xs text-slate-500">
              Distance
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-slate-900">
            2.4 km
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Remaining distance
          </p>

        </div>

      </div>

    </div>
  );
};

export default AmbulanceStatus;