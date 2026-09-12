import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

const RegisterForm = ({ onLogin }) => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log("Register Data:", formData);

    // Backend registration will be added later.

    alert("Registration successful!");

    onLogin();
  };

  return (
    <div>

      <h2 className="text-center text-3xl font-bold text-slate-900">
        Create an Account
      </h2>

      <p className="mt-2 text-center text-sm text-slate-500">
        Join ResQWay and be prepared for emergencies.
      </p>


      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >

        <FormInput
          icon={User}
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
        />

        <FormInput
          icon={Mail}
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <FormInput
          icon={Phone}
          label="Mobile Number"
          name="mobile"
          type="tel"
          placeholder="Enter mobile number"
          value={formData.mobile}
          onChange={handleChange}
        />

        <FormInput
          icon={Lock}
          label="Password"
          name="password"
          type="password"
          placeholder="Create password"
          value={formData.password}
          onChange={handleChange}
        />

        <FormInput
          icon={Lock}
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />


        <button
          type="submit"
          className="
            mt-2 h-12 w-full rounded-lg
            bg-red-600
            text-sm font-bold text-white
            transition
            hover:bg-red-700
          "
        >
          Register
        </button>

      </form>


      <div className="mt-6 text-center text-sm text-slate-500">

        Already have an account?

        <button
          type="button"
          onClick={onLogin}
          className="ml-1 font-bold text-red-600 hover:underline"
        >
          Login
        </button>

      </div>

    </div>
  );
};


/* Reusable Input Component */

const FormInput = ({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) => {

  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">

        <Icon
          size={17}
          className="
            absolute left-3 top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="
            h-11 w-full rounded-lg
            border border-slate-200
            bg-white
            pl-10 pr-4
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
  );
};

export default RegisterForm;