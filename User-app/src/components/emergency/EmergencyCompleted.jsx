import { CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router";

const EmergencyCompleted = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">

      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">

        {/* Success Icon */}

        <div className="flex justify-center">

          <div className="
            flex h-20 w-20
            items-center justify-center
            rounded-full bg-green-50
          ">

            <CheckCircle2
              size={42}
              strokeWidth={1.8}
              className="text-green-600"
            />

          </div>

        </div>


        {/* Heading */}

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Emergency Completed
        </h1>


        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          The ambulance has reached the hospital and the emergency
          session has been completed successfully.
        </p>


        {/* Status */}

        <div className="
          mx-auto mt-7
          flex max-w-sm
          items-center justify-center
          gap-2 rounded-xl
          bg-green-50 px-4 py-3
        ">

          <CheckCircle2
            size={17}
            className="text-green-600"
          />

          <span className="text-sm font-semibold text-green-700">
            Emergency Session Ended
          </span>

        </div>


        {/* Home Button */}

        <button
          onClick={() => navigate("/home")}
          className="
            mt-7 inline-flex
            items-center justify-center
            gap-2 rounded-xl
            bg-red-600
            px-6 py-3
            text-sm font-bold
            text-white
            shadow-lg shadow-red-100
            transition
            hover:bg-red-700
            active:scale-[0.98]
          "
        >

          <Home size={17} />

          Back to Home

        </button>

      </div>

    </div>
  );
};

export default EmergencyCompleted;