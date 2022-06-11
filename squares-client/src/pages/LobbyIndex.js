import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import Context from '../context'

export default function LobbyIndex({gameName, setGameName, username, setUsername}) {
	const {state, dispatch} = useContext(Context)
	const {client} = state
	const [games, setGames] = useState([])
	let navigate = useNavigate();

	useEffect(() => {
		if (!client) {
			connect();
		}
		fetchGames();
	}, [])

	const newGame = e => {
		fetch("http://localhost:8080/lobbies", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: gameName, playerOne: username })
		})
			.then(response => response.json())
			.then(data => {
				client.close()
				console.log(data.id)
				dispatch({type: "setGameId", value: data.id})
				navigate('/game')
			})
	}

	const fetchGames = () => {
		fetch("http://localhost:8080/lobbies")
			.then(response => response.json())
			.then(data => setGames(data))
	}

	const ping = () => {
		client.send("ping")
	}

	const close = () => {
		client.close()
	}

	const connect = () => {
		const ws = new WebSocket(`ws://localhost:8080/lobby`);

		ws.onopen = (x) => {
			console.log("Making connection")
			dispatch({type: "setClient", value: ws})
		}
		ws.onmessage = ({ data }) => { console.log("new game"); fetchGames() }
		ws.onclose = (x) => {
			console.log("closing connection to lobby");
		}

	}

	const joinGame = async (id) => {
		client.close()
		fetch("http://localhost:8080/games/" + id, {
			method: "PATCH",
			headers: {
				'Content-Type': "application/json",
			},
			body: JSON.stringify({
				playerTwo: username,
			})
		})
			.then(response => response.json())
			.then(data => {
				
				dispatch({type: "setGameId", value: data._id})
				navigate('/game')

			})
	}

	return (
		<>
			<div>
				<label>Your Name: </label>
				<input value={username} onChange={e => setUsername(e.target.value)} />
			</div>
			<div>
				<label>new Game</label>
				<input value={gameName} onChange={e => setGameName(e.target.value)} />
			</div>
			<div>
				<button onClick={newGame}>new game</button>
				<button onClick={close}>Close</button>
				<button onClick={ping}>ping</button>
			</div>
			<ul>
				{games.map((game, index) =>
					<li key={index}>
						<p>{game.name}</p>
						<button onClick={() => joinGame(game._id)}>Join</button>
						{/* <Link to="/game">Join</Link> */}
					</li>)}
			</ul>
		</>
	)
}