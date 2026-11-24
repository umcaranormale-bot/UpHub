const ATUALIZADA_EM = '15 de novembro de 2026';

interface Secao {
    titulo: string;
    paragrafos: string[];
}

const secoes: Secao[] = [
    {
        titulo: 'Quem somos',
        paragrafos: [
            'O Up Hub é um projeto acadêmico da Residência do Porto Digital, desenvolvido pelo Squad 3 da FICR. A plataforma conecta organizações do ecossistema a oportunidades de fomento, investimento e formação.',
        ],
    },
    {
        titulo: 'Quais dados coletamos',
        paragrafos: [
            'Da sua conta: nome, e-mail e, se você informar, telefone. A senha nunca é guardada como você digitou: guardamos só uma versão embaralhada (hash), que ninguém consegue ler.',
            'Das organizações e candidaturas: os dados que você preenche, os documentos que você envia e o andamento das avaliações.',
        ],
    },
    {
        titulo: 'Para que usamos',
        paragrafos: [
            'Para criar e proteger a sua conta, para que você participe das oportunidades e para enviar os e-mails do próprio Up Hub: código de confirmação, link para criar uma senha nova e convites.',
        ],
    },
    {
        titulo: 'Como enviamos os e-mails',
        paragrafos: [
            'Os e-mails saem do endereço naoresponda.uphub@gmail.com, pela API do Gmail. O Up Hub usa essa conta só para enviar. Ele não lê caixas de entrada e não acessa a conta Google de quem usa a plataforma.',
        ],
    },
    {
        titulo: 'Com quem compartilhamos',
        paragrafos: [
            'Uma candidatura é vista pela organização que publicou a oportunidade e pelos avaliadores designados para ela. A autodeclaração para vagas reservadas é vista só pela organização que publicou. Não vendemos nem cedemos dados para propaganda.',
            'Os dados ficam em serviços contratados para hospedar a plataforma: Render (servidor), Supabase (banco de dados) e Cloudflare (site).',
        ],
    },
    {
        titulo: 'Seus direitos',
        paragrafos: [
            'Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou apagar os seus dados. Para isso, fale com a equipe do Up Hub pelo repositório do projeto no GitHub.',
        ],
    },
];

export default function PrivacidadePage() {
    return (
        <section className="bg-page px-6 py-16">
            <div className="mx-auto max-w-3xl">
                <span className="text-sm font-semibold text-acento">Up Hub</span>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-titulo sm:text-4xl">
                    Política de privacidade
                </h1>
                <p className="mt-2 text-sm text-secundario">Atualizada em {ATUALIZADA_EM}</p>

                <div className="mt-10 space-y-8">
                    {secoes.map((secao) => (
                        <article key={secao.titulo}>
                            <h2 className="mb-3 text-xl font-semibold text-titulo">{secao.titulo}</h2>
                            <div className="space-y-3">
                                {secao.paragrafos.map((paragrafo) => (
                                    <p key={paragrafo} className="leading-relaxed text-secundario">
                                        {paragrafo}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}