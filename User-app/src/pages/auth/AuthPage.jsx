import { useState } from "react";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">

      {/* Left Branding */}
      <div className="hidden bg-red-50 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-lg px-12">

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            ResQ<span className="text-red-600">Way</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Faster Help. Safer Lives.
          </p>

          <div className="my-10 h-1 w-16 rounded-full bg-red-600" />

          <h2 className="text-5xl font-bold leading-tight text-slate-900">
            Emergency help,
            <br />
            when you need it.
          </h2>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-600">
            Connect with the nearest ambulance quickly
            and get help when every second matters.
          </p>

        </div>
      </div>

      {/* Authentication */}
      <div className="flex min-h-screen items-center justify-center px-5 py-10">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">

            <h1 className="text-3xl font-extrabold text-slate-900">
              ResQ<span className="text-red-600">Way</span>
            </h1>

          </div>

          {isRegister ? (
            <RegisterForm
              onLogin={() => setIsRegister(false)}
            />
          ) : (
            <LoginForm
              onRegister={() => setIsRegister(true)}
            />
          )}

        </div>

      </div>

    </div>
  );
};

export default AuthPage;