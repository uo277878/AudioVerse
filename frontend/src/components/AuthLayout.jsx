import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="pl-64 min-h-screen bg-zinc-600">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;