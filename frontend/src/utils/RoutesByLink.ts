import type { Papel } from "../api/vinculos";

export const routesByLink: Record<Papel, string> = {
    CANDIDATO: "/inicio",
    PROVEDOR: "/provedor",
    AVALIADOR: "/avaliador",
    MENTOR: "/mentor",
    GESTAO: "/gestao",
};

export function routeByPaper(papel: Papel): string {
    return routesByLink[papel];
}