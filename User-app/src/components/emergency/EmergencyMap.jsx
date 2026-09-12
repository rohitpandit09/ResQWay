import {
  Navigation,
  MapPin,
  Ambulance,
  Hospital,
} from "lucide-react";

const EmergencyMap = () => {
  return (
    <div className="relative h-125 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

      {/* Fake Map Background */}

      <div className="absolute inset-0">

        {/* Roads */}

        <div className="
          absolute left-1/2 top-[-10%]
          h-[120%] w-20
          -translate-x-1/2
          rotate-18
          bg-white
          shadow-sm
        " />

        <div className="
          absolute left-[-10%] top-1/2
          h-16 w-[120%]
          -translate-y-1/2
          -rotate-12
          bg-white
          shadow-sm
        " />

        <div className="
          absolute left-[20%] top-[20%]
          h-3/4 w-8
          rotate-65
          bg-white
        " />

        {/* Secondary roads */}

        <div className="
          absolute left-[10%] top-[35%]
          h-3/4 w-5
          rotate-30
          bg-white
        " />

        <div className="
          absolute right-[15%] top-[10%]
          h-[80%] w-6
          rotate-55
          bg-white
        " />

      </div>


      {/* Route */}

      <div className="
        absolute left-[25%] top-[58%]
        h-1.25 w-[48%]
        rotate-[-18deg]
        rounded-full bg-red-500
        shadow-sm
      " />


      {/* Ambulance */}

      <div className="
        absolute left-[22%] top-[63%]
        flex h-12 w-12
        items-center justify-center
        rounded-full border-4 border-white
        bg-red-600 text-white
        shadow-lg
      ">

        <Ambulance size={23} />

      </div>


      {/* User */}

      <div className="
        absolute right-[20%] top-[39%]
        flex h-11 w-11
        items-center justify-center
        rounded-full border-4 border-white
        bg-slate-900 text-white
        shadow-lg
      ">

        <MapPin size={21} />

      </div>


      {/* Hospital */}

      <div className="
        absolute right-[9%] top-[20%]
        flex h-10 w-10
        items-center justify-center
        rounded-full border-4 border-white
        bg-white text-red-600
        shadow-md
      ">

        <Hospital size={19} />

      </div>


      {/* Map Controls */}

      <div className="
        absolute right-4 top-4
        flex flex-col gap-2
      ">

        <button className="
          flex h-10 w-10
          items-center justify-center
          rounded-lg bg-white
          text-slate-600
          shadow-md
          hover:text-red-600
        ">
          +
        </button>

        <button className="
          flex h-10 w-10
          items-center justify-center
          rounded-lg bg-white
          text-slate-600
          shadow-md
          hover:text-red-600
        ">
          −
        </button>

      </div>


      {/* Current Location */}

      <button className="
        absolute bottom-4 right-4
        flex h-11 w-11
        items-center justify-center
        rounded-lg bg-white
        text-slate-600
        shadow-md
        hover:text-red-600
      ">

        <Navigation size={18} />

      </button>


      {/* Map Legend */}

      <div className="
        absolute bottom-4 left-4
        rounded-lg bg-white/95
        px-4 py-3
        shadow-md
      ">

        <div className="flex items-center gap-2 text-xs">

          <span className="h-3 w-3 rounded-full bg-red-600" />

          <span className="text-slate-600">
            Ambulance
          </span>

        </div>

        <div className="mt-2 flex items-center gap-2 text-xs">

          <span className="h-3 w-3 rounded-full bg-slate-900" />

          <span className="text-slate-600">
            Your location
          </span>

        </div>

      </div>

    </div>
  );
};

export default EmergencyMap;