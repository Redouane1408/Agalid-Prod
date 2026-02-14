import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import About from "@/pages/About";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import AuthLayout from "@/components/AuthLayout";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import Production from "@/pages/dashboard/Production";
import Consumption from "@/pages/dashboard/Consumption";
import Settings from "@/pages/dashboard/Settings";
import IntegrationCallback from "@/pages/dashboard/IntegrationCallback";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          
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
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
              <Route path="production" element={<Production />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
