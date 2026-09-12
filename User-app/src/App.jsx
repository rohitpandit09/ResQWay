import { Routes, Route, Navigate } from "react-router";

import AuthPage from "./pages/auth/AuthPage";

// ================= USER =================

import Home from "./pages/user/Home";
import LiveEmergency from "./pages/user/LiveEmergency";

// ================= DRIVER =================



import Navbar from "./components/layout/Navbar";


// =================================================
// USER LAYOUT
// =================================================

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8">
        {children}
      </main>

    </div>
  );
};


// =================================================
// APP
// =================================================

function App() {

  return (
    <Routes>

      {/* =========================================
          USER AUTHENTICATION
      ========================================= */}

      <Route
        path="/login"
        element={<AuthPage />}
      />


      {/* =========================================
          USER WEBSITE
      ========================================= */}

      <Route
        path="/home"
        element={
          <UserLayout>
            <Home />
          </UserLayout>
        }
      />

      <Route
        path="/emergency"
        element={
          <UserLayout>
            <LiveEmergency />
          </UserLayout>
        }
      />




      {/* =========================================
          UNKNOWN URL
      ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;