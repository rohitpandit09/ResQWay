import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";

const LoginForm = ({ onRegister }) => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", formData);

    // Temporary navigation.
    // Backend authentication will be added later.
    navigate("/home");
  };

  return (
    <div>

      <h2 className="text-center text-3xl font-bold text-slate-900">
        Welcome Back
      </h2>

      <p className="mt-2 text-center text-sm text-slate-500">
        Login to continue and get help when it matters most.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >

        {/* Email / Mobile */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email or Mobile Number
          </label>

          <div className="relative">

            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              name="emailOrMobile"
              value={formData.emailOrMobile}
              onChange={handleChange}
              placeholder="Enter email or mobile number"
              required
              className="
                h-12 w-full rounded-lg
                border border-slate-200
                bg-white pl-10 pr-4
                text-sm text-slate-900
                outline-none
                transition
                focus:border-red-500
                focus:ring-4
                focus:ring-red-50
              "
            />

          </div>

        </div>


        {/* Password */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="
                h-12 w-full rounded-lg
                border border-slate-200
                bg-white pl-10 pr-4
                text-sm text-slate-900
                outline-none
                transition
                focus:border-red-500
                focus:ring-4
                focus:ring-red-50
              "
            />

          </div>

        </div>


        {/* Forgot Password */}

        <div className="text-right">

          <button
            type="button"
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Forgot Password?
          </button>

        </div>


        {/* Login */}

        <button
          type="submit"
          className="
            h-12 w-full rounded-lg
            bg-red-600
            text-sm font-bold text-white
            transition
            hover:bg-red-700
          "
        >
          Login
        </button>

      </form>


      {/* Register */}

      <div className="mt-6 text-center text-sm text-slate-500">

        Don't have an account?

        <button
          type="button"
          onClick={onRegister}
          className="ml-1 font-bold text-red-600 hover:underline"
        >
          Register
        </button>

      </div>

    </div>
  );
};

export default LoginForm;