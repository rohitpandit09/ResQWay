import {
  TrafficCone,
  Clock3,
  Route,
} from "lucide-react";

const NextSignalCard = () => {
  return (
    <div className="
      rounded-2xl
      border border-slate-200
      bg-white
      p-5
    ">

      <div className="flex items-center justify-between">

        <div>

          <p className="
            text-xs font-bold
            uppercase tracking-wider
            text-slate-400
          ">
            Upcoming Traffic Signal
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Signal S1
          </h2>

        </div>


        <div className="
          flex h-10 w-10
          items-center justify-center
          rounded-lg bg-slate-50
        ">

          <TrafficCone
            size={20}
            className="text-slate-600"
          />

        </div>

      </div>


      <div className="mt-5 space-y-3">

        <div className="
          flex items-center
          justify-between
          rounded-lg bg-slate-50
          px-4 py-3
        ">

          <div className="flex items-center gap-3">

            <Route
              size={17}
              className="text-slate-500"
            />

            <span className="text-sm text-slate-600">
              Distance
            </span>

          </div>

          <span className="text-sm font-bold text-slate-900">
            420 m
          </span>

        </div>


        <div className="
          flex items-center
          justify-between
          rounded-lg bg-slate-50
          px-4 py-3
        ">

          <div className="flex items-center gap-3">

            <Clock3
              size={17}
              className="text-slate-500"
            />

            <span className="text-sm text-slate-600">
              Estimated arrival
            </span>

          </div>

          <span className="text-sm font-bold text-slate-900">
            01:05
          </span>

        </div>


        <div className="
          rounded-lg
          border border-red-100
          bg-red-50
          px-4 py-3
        ">

          <p className="text-xs font-semibold text-red-600">
            Emergency Priority
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Signal timing will be coordinated for the approaching
            active ambulance.
          </p>

        </div>

      </div>

    </div>
  );
};

export default NextSignalCard;