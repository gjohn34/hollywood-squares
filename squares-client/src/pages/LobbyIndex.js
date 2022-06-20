import { useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import Context from '../context'

export default function LobbyIndex({ gameName, setGameName }) {
	const { state, dispatch } = useContext(Context)
	const { client, user } = state
	const [games, setGames] = useState([])
	let navigate = useNavigate();

	useEffect(() => {
		if (!client) {
			connect();
		}
		fetchGames();
	}, [])

	const newGame = e => {
		console.log(JSON.stringify({ name: gameName, playerOne: user.username }))
		fetch("http://localhost:8080/lobbies", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ name: gameName, playerOne: user.username }),
		})
			.then(response => response.json())
			.then(data => {
				if (client) client.close()
				dispatch({ type: "setGameId", value: data._id })
				window.sessionStorage.setItem("gid", data._id)
				navigate('/game')
			})
	}
	const joinGame = async (id) => {
		fetch("http://localhost:8080/games/" + id, {
			method: "PATCH",
			headers: { 'Content-Type': "application/json" },
			credentials: 'include',
			body: JSON.stringify({ playerTwo: user.username })
		})
			.then(response => response.json())
			.then(data => {
				if (client) client.close()
				dispatch({ type: "setGameId", value: data._id })
				window.sessionStorage.setItem("gid", data._id)
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
			console.log("Making lobby connection")
			dispatch({ type: "setClient", value: ws })
		}
		ws.onmessage = ({ data }) => { console.log("new game"); fetchGames() }
		ws.onclose = (x) => {
			console.log("closing connection to lobby");
		}

	}


	return (
		<>
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