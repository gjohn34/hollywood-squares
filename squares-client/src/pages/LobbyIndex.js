import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import GameContext from '../gameContext';
import UserContext from '../userContext'
import '../css/lobby.css'

export default function LobbyIndex() {
	const [gameName, setGameName] = useState("")

	const { userStore, userDispatch } = useContext(UserContext)
	const { gameStore, gameDispatch } = useContext(GameContext)
	const { gameClient } = gameStore

	const { lobbyClient, user } = userStore
	const [games, setGames] = useState([])
	// const [gameState, setGameState] = useState(null)
	const [lobbyUpdate, setLobbyUpdate] = useState(null)
	let navigate = useNavigate();

	useEffect(() => {
		if (!lobbyClient) {
			// somehow this is causing some screen tearing?
			connect();
		}
		if (gameClient) {
			gameClient.close()
		}
		fetchGames();
	}, [])

	useEffect(() => {
		if (!lobbyUpdate) return

		switch (lobbyUpdate.type) {
			case "new":
				setGames([...games, lobbyUpdate.value])
				break;
			case "update":
				let docs = [...games]
				let game = docs.find(x => x._id == lobbyUpdate.value.gid)
				game.playerTwo = lobbyUpdate.value.uid

				setGames(docs)
				break;
			case "delete":
				setGames(games.filter(x => x._id != lobbyUpdate.value))
				break;
			default:
				break;
		}
		setLobbyUpdate(null)

	}, [lobbyUpdate])

	const newGame = e => {
		if (lobbyClient) lobbyClient.close()

		fetch(`${process.env.REACT_APP_API_BASE}/lobbies`, {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name: gameName, playerOne: user.username }),
		})
			.then(response => response.json())
			.then(data => {
				gameDispatch({ type: "setGameId", value: data._id })
				localStorage.setItem("gid", data._id)
				navigate('/game')
			})
	}
	const joinGame = async (id) => {
		// the point for this??
		lobbyClient.send(JSON.stringify({ type: "join", value: id }))

		if (lobbyClient) lobbyClient.close()
		if (gameClient) { gameClient.close() }



		fetch(`${process.env.REACT_APP_API_BASE}/games/` + id, {
			method: "PATCH",
			headers: { 'Content-Type': "application/json" },
			credentials: 'include',
			body: JSON.stringify({ playerTwo: user.username })
		})
			.then(response => response.json())
			.then(data => {
				gameDispatch({ type: "setGameId", value: data._id })
				localStorage.setItem("gid", data._id)
				navigate('/game')

			})
	}

	const fetchGames = () => {
		fetch(`${process.env.REACT_APP_API_BASE}/lobbies`)
			.then(response => response.json())
			.then(data => setGames(data))
	}

	const watchGame = () => {
		throw new Error()
	}

	const connect = () => {
		const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE}/lobby?uid=${user._id}`);

		ws.onopen = (x) => {
			userDispatch({ type: "setLobbyClient", value: ws })
		}
		ws.onmessage = ({ data }) => {
			const json = JSON.parse(data)
			switch (json.type) {
				case "new":
					setLobbyUpdate({ type: "new", value: json.value })
					break
				case "join":
					setLobbyUpdate({ type: "update", value: { ...json.value } })
					break
				case "delete":
					setLobbyUpdate({ type: "delete", value: json.value })
					break;
				default:
					break;
			}
		}
		ws.onclose = (x) => {
		}

	}


	return (
		<>
			<div>
				<label>Lobby name:</label>
				<input value={gameName} onChange={e => setGameName(e.target.value)} />
				<button onClick={newGame}>new game</button>
			</div>
			<section >
				{games.map((game) =>
					<article key={game._id} >
						<h3>{game.playerOne.username}'s game</h3>
						<h4>{game.name}</h4>
						{!!game.playerTwo ? (
							<>
								<p>{game.playerOne.username} vs {game.playerTwo.username}</p>
								<button onClick={() => watchGame(game._id)}>Watch</button>
							</>
						) : (
							<>
								<p>Waiting for p2</p>
								<button onClick={() => joinGame(game._id)}>Play</button>
							</>

						)}
					</article>)}
			</section>
		</>
	)
}