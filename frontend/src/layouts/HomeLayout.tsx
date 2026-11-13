import { Outlet } from "react-router-dom";
import Sidemenu from "../components/SideMenu";
function HomeLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidemenu />

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;