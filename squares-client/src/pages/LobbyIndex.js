import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import GameContext from '../gameContext';
import UserContext from '../userContext'

export default function LobbyIndex({ gameName, setGameName }) {
	const { userStore, userDispatch } = useContext(UserContext)
	const { gameDispatch } = useContext(GameContext)
	const { client, user } = userStore
	const [games, setGames] = useState([])
	// const [gameState, setGameState] = useState(null)
	const [lobbyUpdate, setLobbyUpdate] = useState(null)
	let navigate = useNavigate();

	useEffect(() => {
		if (!client) {
			// somehow this is causing some screen tearing?
			connect();
		}
		fetchGames();
	}, [])

	useEffect(() => {
		if (!lobbyUpdate) return

		switch (lobbyUpdate.type) {
			case "update":
				let docs = [...games]
				let game = docs.find(x => x._id == lobbyUpdate.value.gid)
				game.playerTwo = lobbyUpdate.value.uid

				setGames(docs)
			case "delete":
				setGames(games.filter(x => x._id != lobbyUpdate.value))
				break;
			default:
				break;
		}
		setLobbyUpdate(null)

	}, [lobbyUpdate])

	const newGame = e => {
		fetch("http://localhost:8080/lobbies", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name: gameName, playerOne: user.username }),
		})
			.then(response => response.json())
			.then(data => {
				if (client) client.close()
				gameDispatch({ type: "setGameId", value: data._id })
				localStorage.setItem("gid", data._id)
				navigate('/game')
			})
	}
	const joinGame = async (id) => {
		client.send(JSON.stringify({ type: "join", value: id }))
		fetch("http://localhost:8080/games/" + id, {
			method: "PATCH",
			headers: { 'Content-Type': "application/json" },
			credentials: 'include',
			body: JSON.stringify({ playerTwo: user.username })
		})
			.then(response => response.json())
			.then(data => {
				if (client) client.close()
				gameDispatch({ type: "setGameId", value: data._id })
				localStorage.setItem("gid", data._id)
				navigate('/game')

			})
	}

	const fetchGames = () => {
		fetch("http://localhost:8080/lobbies")
			.then(response => response.json())
			.then(data => setGames(data))
	}

	const watchGame = () => {
		throw new Error()
	}

	const ping = () => {
		client.send("ping")
	}

	const close = () => {
		client.close()
	}

	const connect = () => {
		const ws = new WebSocket(`ws://localhost:8080/lobby?uid=${user._id}`);
		console.log("connecting")

		ws.onopen = (x) => {
			userDispatch({ type: "setClient", value: ws })
		}
		ws.onmessage = ({ data }) => {
			const json = JSON.parse(data)
			switch (json.type) {
				case "new":
					console.log("new game")
					fetchGames()
					break
				case "join":
					// const { gid, uid } = json.value
					setLobbyUpdate({ type: "update", value: { ...json.value } })
					// updateGames(json.value.gid, json.value.uid)
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
			<div style={{ textAlign: "right" }}>
				<div>
					<label>new Game</label>
					<input value={gameName} onChange={e => setGameName(e.target.value)} />
				</div>
				<div>
					<button onClick={newGame}>new game</button>
					<button onClick={close}>Close</button>
					<button onClick={ping}>ping</button>
				</div>
			</div>
			<section style={{
				display: "flex",
				flexWrap: "wrap"
			}}>
				{games.map((game) =>
					<article key={game._id} style={{
						border: "solid 1px black",
						width: "30%",
						margin: "10px",
						padding: "10px"

					}}>
						<p>{game.name}</p>
						{!!game.playerTwo ? (
							<>
								<p>{game.playerOne} vs {game.playerTwo}</p>
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