
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from "react";

import { entrar, sair, buscarSessao } from "../api/auth";
import type { Sessao, LoginResposta } from "../api/auth";

interface AuthContextData {
    sessao: Sessao | null;
    autenticado: boolean;
    carregando: boolean;
    sessaoVerificada: boolean;
    verificarSessao: () => Promise<Sessao | null>;
    login: (email: string, senha: string) => Promise<LoginResposta>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [sessao, setSessao] = useState<Sessao | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [sessaoVerificada, setSessaoVerificada] = useState(false);

    // Evita fazer várias requisições simultâneas para verificar a sessão.
    const verificacaoRef = useRef<Promise<Sessao | null> | null>(null);

    async function login(email: string, senha: string) {
        const resposta = await entrar(email, senha);

        const novaSessao: Sessao = {
            pessoa: resposta.pessoa,
            vinculos: resposta.vinculos,
        };

        setSessao(novaSessao);
        setSessaoVerificada(true);

        return resposta;
    }

    const verificarSessao = useCallback((): Promise<Sessao | null> => {
        if (sessaoVerificada) {
            return Promise.resolve(sessao);
        }

        if (verificacaoRef.current) {
            return verificacaoRef.current;
        }

        setCarregando(true);

        const requisicao = (async () => {
            try {
                const dados = await buscarSessao();
                setSessao(dados);
                return dados;
            } catch {
                setSessao(null);
                return null;
            } finally {
                setSessaoVerificada(true);
                setCarregando(false);
                verificacaoRef.current = null;
            }
        })();

        verificacaoRef.current = requisicao;

        return requisicao;
    }, [sessao, sessaoVerificada]);

    function logout() {
        void sair();
        setSessao(null);
        setSessaoVerificada(true);
    }

    return (
        <AuthContext.Provider
            value={{
                sessao,
                autenticado: sessao !== null,
                carregando,
                sessaoVerificada,
                verificarSessao,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error(
            "useAuth deve ser utilizado dentro de AuthProvider"
        );
    }

    return contexto;
}