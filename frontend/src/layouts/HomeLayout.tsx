import { Outlet } from "react-router-dom";
import MenuLateral from "../components/MenuLateral";
import { MENU_HOME } from "../navegacao/menus";

function HomeLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <MenuLateral itens={MENU_HOME} rotulo="Menu principal" grudento />
      </div>

      <main className="flex-1 min-w-0 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default HomeLayout;
