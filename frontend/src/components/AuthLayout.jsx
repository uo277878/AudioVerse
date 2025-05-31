import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import PlayerBar from "./PlayerBar";

function AuthLayout() {
  return (
    <div className="pl-64 min-h-screen bg-zinc-900">
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}

export default AuthLayout;