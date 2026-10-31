import { Link } from "react-router-dom";

const trails = [
  {
    color: "bg-trilha-fomento",
    title: "Fomento",
    description: "Editais e programas de órgãos e instituições",
    detail: "Órgão de Fomento PE ⋅ Sebrae ⋅ Porto Digital",
  },
  {
    color: "bg-trilha-investimento",
    title: "Investimento",
    description: "Rodadas e programas de aceleração",
    detail: "Investe Recife ⋅ aceleradoras ⋅ fundos",
  },
  {
    color: "bg-trilha-investimento",
    title: "Formação",
    description: "Residências e desafios reais de empresas",
    detail: "Empresas parceiras ⋅ squads de estudantes",
  },
];

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-page">

      {/* Conteúdo principal */}
      <section className="grid flex-1 grid-cols-[1.5fr_1fr] items-center gap-12 py-16 px-[8%]">
        {/* Texto à esquerda */}
        <div className="max-w-2xl">
          <span className="mb-5 inline-block text-sm font-semibold text-acento">
            Porto Digital ⋅ Recife
          </span>

          <h1 className="mb-6 text-5xl text-titulo leading-tight font-bold tracking-tight">
            Todas as oportunidades do ecossistema em um só lugar.
          </h1>

          <p className="mb-8 max-w-lg text-base leading-8 text-slate-500 sm:text-lg">
            Editais, rodadas de investimento e residências.
            Você descobre o que combina com o seu perfil, confere se pode concorrer antes de montar a
            proposta e acompanha cada etapa até o resultado.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              className="rounded-lg border border-acento bg-acento px-5 py-3 font-semibold text-white transition hover:bg-card hover:text-acento"
            >
              Criar conta
            </Link>

            <Link
              to="/entrar"
              className="rounded-lg border border-profundo px-5 py-3 font-semibold text-profundo transition hover:bg-profundo hover:text-white"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Indicadores */}
          <div className="mt-12 grid grid-cols-4 gap-4 pt-6">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">12</h1>
              <p className="mt-1 text-sm text-slate-500">
                Oportunidades abertas
              </p>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-indigo-600">541</h1>
              <p className="mt-1 text-sm text-slate-500">
                Empresas parceiras
              </p>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-indigo-600">3</h1>
              <p className="mt-1 text-sm text-slate-500">
                Programas de apoio
              </p>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-indigo-600">14,9%</h1>
              <p className="mt-1 text-sm text-slate-500">
                Taxa de conexão
              </p>
            </div>
          </div>
        </div>

        {/* Trilhas */}
        <div id="caracteristicas" className="flex flex-col max-w-2xl gap-4">
          {trails.map((trails) => (
            <article
              key={trails.title}
              className="rounded-2xl border-2 border-zinc-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-950"
            >
              <div
                className={`h-1 w-10 rounded-full ${trails.color}`}
                aria-hidden="true"
              />

              <h2 className="mt-3 mb-2 text-2xl font-semibold">
                {trails.title}
              </h2>

              <p className="leading-relaxed mb-1 text-base text-slate-500">
                {trails.description}
              </p>
              <p className="leading-relaxed text-slate-500">
                {trails.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
      {/* Cadastro de organizações */}
      <section className="flex flex-col items-start justify-between gap-6 bg-profundo px-8 py-8 text-white md:flex-row md:items-center md:px-12">
        <div className="max-w-2xl">
          <h2 className="mb-1 text-2xl font-bold">
            Publica editais, programas ou desafios?
          </h2>

          <p className="leading-relaxed text-acento-suave">
            Cadastre a sua organização. A permissão de publicar é liberada
            pela gestão do Porto Digital depois da conferência dos dados.
          </p>
        </div>

        <Link
          to="/register-organization"
          className="shrink-0 rounded-lg border border-white bg-card px-5 py-3 font-semibold text-profundo transition hover:bg-acento-suave"
        >
          Cadastrar organização
        </Link>
      </section>
    </main>
  );
}
export default LandingPage;