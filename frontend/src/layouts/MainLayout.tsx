import { Outlet } from "react-router-dom";
import { Navbar, type VarianteDaNavbar } from "../components/Navbar";

function MainLayout({ variante = 'site' }: { variante?: VarianteDaNavbar }) {
  return (
    <div className="min-h-screen bg-page">
      <Navbar variante={variante} />

      <main id="conteudo">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout;