import {
  Home,
  Siren,
  User,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router";

const Navbar = () => {

  const navigate = useNavigate();

  const navigation = [
    {
      name: "Home",
      path: "/home",
      icon: Home,
    },
    {
      name: "Live Emergency",
      path: "/emergency",
      icon: Siren,
    },

  ];

  const handleLogout = () => {

    // Later:
    // clear authentication token
    // clear user session

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

        {/* Logo */}

        <NavLink
          to="/home"
          className="flex items-center"
        >

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">

            ResQ
            <span className="text-red-600">
              Way
            </span>

          </h1>

        </NavLink>


        {/* Navigation */}

        <nav className="hidden items-center gap-1 md:flex">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-2
                  rounded-lg px-4 py-2.5
                  text-sm font-medium
                  transition
                  ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-red-600"
                  }
                  `
                }
              >

                <Icon size={17} />

                {item.name}

              </NavLink>
            );

          })}

        </nav>


        {/* User / Logout */}

        <div className="flex items-center gap-3">

          <NavLink
            to="/profile"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-slate-100
              text-slate-600
              transition
              hover:bg-red-50
              hover:text-red-600
            "
          >

            <User size={18} />

          </NavLink>


          <button
            onClick={handleLogout}
            className="
              hidden items-center gap-2
              rounded-lg px-3 py-2
              text-sm font-medium
              text-slate-500
              transition
              hover:bg-red-50
              hover:text-red-600
              sm:flex
            "
          >

            <LogOut size={17} />

            Logout

          </button>

        </div>

      </div>


      {/* Mobile Navigation */}

      <div className="border-t border-slate-100 px-3 py-2 md:hidden">

        <nav className="flex items-center justify-between">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex flex-col
                  items-center gap-1
                  rounded-lg px-3 py-1.5
                  text-[10px] font-medium
                  ${
                    isActive
                      ? "text-red-600"
                      : "text-slate-500"
                  }
                  `
                }
              >

                <Icon size={18} />

                {item.name}

              </NavLink>
            );

          })}

        </nav>

      </div>

    </header>
  );
};

export default Navbar;