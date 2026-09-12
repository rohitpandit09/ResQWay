import {
  MapPin,
  Ambulance,
  Navigation,
} from "lucide-react";

const HowItWorks = () => {

  const steps = [
    {
      icon: MapPin,
      title: "Share Location",
      text: "Your current location is detected automatically.",
    },
    {
      icon: Ambulance,
      title: "Ambulance Matched",
      text: "The nearest available ambulance is contacted.",
    },
    {
      icon: Navigation,
      title: "Help Is On The Way",
      text: "Track the ambulance while it reaches you.",
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

      <h2 className="text-lg font-bold text-slate-900">
        How ResQWay Works
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">

        {steps.map((step, index) => {

          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="rounded-xl bg-slate-50 p-5"
            >

              <div className="flex items-center gap-3">

                <div className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-lg bg-red-50
                ">

                  <Icon
                    size={19}
                    className="text-red-600"
                  />

                </div>

                <span className="text-xs font-bold text-slate-400">
                  0{index + 1}
                </span>

              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {step.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {step.text}
              </p>

            </div>
          );

        })}

      </div>

    </section>
  );
};

export default HowItWorks;