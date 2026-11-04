import SideMenu from '../components/SideMenu'

function Home() {
  return (
    <div className="flex min-h-screen bg-page">
      <SideMenu />

      {/* Conteúdo da página: por enquanto vazio */}
      <main className="flex-1" />
    </div>
  )
}

export default Home;