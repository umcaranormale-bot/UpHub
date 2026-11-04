import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const itens = [
  { rotulo: "Painel", caminho: "/provedor/painel" },
  { rotulo: "Oportunidades", caminho: "/provedor/oportunidades" },
  { rotulo: "Candidaturas", caminho: "/provedor/candidaturas" },
  { rotulo: "Avaliadores", caminho: "/provedor/avaliadores" },
  { rotulo: "Notificações e prazos", caminho: "/provedor/notificacoes" },
  { rotulo: "Histórico de auditoria", caminho: "/provedor/auditoria" },
  { rotulo: "Conta", caminho: "/provedor/conta" },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      {itens.map((item) => (
        <NavLink
          key={item.caminho}
          to={item.caminho}
          className={({ isActive }) =>
            isActive ? "sidebar-item ativo" : "sidebar-item"
          }
        >
          {item.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
