import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import AuthLayout from "@/components/AuthLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import IntegrationCallback from "@/pages/dashboard/IntegrationCallback";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes with Shared Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        
        <Route path="/integrations/callback" element={<IntegrationCallback />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="production" element={<div className="p-8 text-white">Production Details - Coming Soon</div>} />
            <Route path="consumption" element={<div className="p-8 text-white">Consumption Details - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-8 text-white">Settings - Coming Soon</div>} />
          </Route>
        </Route>

        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
