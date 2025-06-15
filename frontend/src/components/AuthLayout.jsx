import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex flex-col md:pl-64 md:flex-row min-h-screen bg-zinc-900">
      <Navbar />
      <main className="flex-1 ml-0 md:ml-50 p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;