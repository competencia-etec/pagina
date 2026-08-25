import { fetchWithAuth } from './auth.js'

export async function startWordle() {
  const res = await fetchWithAuth('/wordle/start/', { method: 'GET' })
  return res.json()
}

export async function guessWordle(guess) {
  const res = await fetchWithAuth('/wordle/guess/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ guess }),
  })
  return res.json()
}

export async function getWordleGame() {
  const res = await fetchWithAuth('/wordle/get_game/', {
    headers: { Accept: 'application/json' },
  })
  return res.json()
}

export async function startMaze(difficulty = 1) {
  const res = await fetchWithAuth(`/maze/start/?difficulty=${difficulty}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  return res.json()
}

export async function moveMaze(direction) {
  const res = await fetchWithAuth('/maze/move/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ direction }),
  })
  return res.json()
}

export async function getMazeGame() {
  const res = await fetchWithAuth('/maze/get_game/', {
    headers: { Accept: 'application/json' },
  })
  return res.json()
}