import './MainPage.css'
import Navbar from '../../components/Navbar/Navbar.jsx'
import Hero from '../../components/Hero/Hero.jsx'
import Section from '../../components/Section/Section.jsx'
import GameCard from '../../components/GameCard/GameCard.jsx'
import Leaderboard from '../../components/Leaderboard/Leaderboard.jsx'
import Footer from '../../components/Footer/Footer.jsx'

const LEADERBOARD = [
  { rank: 1, name: 'Valentina R.', points: 2340 },
  { rank: 2, name: 'Tomás G.', points: 2180 },
  { rank: 3, name: 'Camila S.', points: 1950 },
  { rank: 4, name: 'Mateo L.', points: 1720 },
  { rank: 5, name: 'Sofía M.', points: 1580 },
]

const GAMES = [
  { id: 'wordle', title: 'Wordle', description: 'Tenés 6 intentos para adivinar la palabra del día.', icon: '🇼' },
  { id: 'connections', title: 'Connections', description: 'Encontrá los cuatro grupos de palabras que tienen algo en común.', icon: '🧩' },
  { id: 'memoria', title: 'Memoria', description: 'Encontrá los pares antes que nadie.', icon: '🧠' },
  { id: 'palabras', title: 'Cadena de Palabras', description: 'Formá la cadena más larga.', icon: '🔗' },
]

export default function MainPage({ onGoLogin, onGoRegister, onLogout, user, setPage }) {
  const isLoggedIn = !!user

  return (
    <div className="main-page">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={onLogout}
        onGoLogin={onGoLogin}
        onGoRegister={onGoRegister}
      />

      <Hero
        isLoggedIn={isLoggedIn}
        onGoLogin={onGoLogin}
        onGoRegister={onGoRegister}
      />

      <Section title="Juegos" id="games-heading">
        <div className="games-grid">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isLoggedIn={isLoggedIn}
              onPlay={setPage}
            />
          ))}
        </div>
      </Section>

      <Section title="Ranking" id="leaderboard-heading">
        <Leaderboard entries={LEADERBOARD} />
      </Section>

      <Footer />
    </div>
  )
}
