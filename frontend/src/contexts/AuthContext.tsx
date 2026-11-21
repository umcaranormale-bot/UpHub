import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

import { entrar, buscarSessao, sair } from '../api/auth';
import type { Sessao, LoginResposta } from '../api/auth';

interface AuthContextData {
    sessao: Sessao | null;
    autenticado: boolean;
    carregando: boolean;
    login: (email: string, senha: string) => Promise<LoginResposta>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [sessao, setSessao] = useState<Sessao | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarSessao() {
            try {
                const dados = await buscarSessao();
                setSessao(dados);
            } catch {
                setSessao(null);
            } finally {
                setCarregando(false);
            }
        }

        carregarSessao();
    }, []);

    async function login(email: string, senha: string) {
        const resposta = await entrar(email, senha);

        setSessao({
            pessoa: resposta.pessoa,
            vinculos: resposta.vinculos,
        });

        return resposta;
    }

    function logout() {
        sair();
        setSessao(null);
    }

    return (
        <AuthContext.Provider
            value={{
                sessao,
                autenticado: sessao !== null,
                carregando,
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
            'useAuth deve ser utilizado dentro de AuthProvider'
        );
    }

    return contexto;
}