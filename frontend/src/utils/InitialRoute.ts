import { routeByPaper } from "./RoutesByLink";
import type { Sessao } from "../api/auth";

export function initialRoute(sessao: Sessao): string {
    const ativos = sessao.vinculos.filter(v => v.encerradoEm === null);

    if (ativos.length === 0) return "/organizacoes/nova";
    if (ativos.length === 1) return routeByPaper(ativos[0].papel);
    return "/entrar-vinculo";
}