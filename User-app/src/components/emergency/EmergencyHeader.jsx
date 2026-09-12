import { Siren } from "lucide-react";

const EmergencyHeader = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />

          <p className="text-xs font-bold uppercase tracking-wider text-red-600">
            Emergency Active
          </p>
        </div>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Ambulance is on the way
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your emergency route is being monitored in real time.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5">
        <Siren size={17} className="text-red-600" />

        <span className="text-xs font-bold text-red-600">
          LIVE
        </span>
      </div>

    </div>
  );
};

export default EmergencyHeader;