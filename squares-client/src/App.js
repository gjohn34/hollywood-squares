import {useState, useEffect} from 'react'

function App() {
  const [username, setUsername] = useState("")
  const [clients, setClients] = useState({main: null, game: null});
  const [lobbies, setLobbies] = useState([])

  useEffect(() => {
    fetchLobbies();
  }, [])

  const newLobby = e => {
    fetch("http://localhost:8080/lobbies", 
    {method: "POST", headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({name: username})})
  }

  const fetchLobbies = () => {
    fetch("http://localhost:8080/lobbies")
    .then(response => response.json())
    .then(data => setLobbies(data))
  }

  const ping = () => {
    console.log("send")
    clients.main.send("ping")
  }

  const close = () => {
    clients.main.close()
  }

  const connect = () => {
    const ws = new WebSocket(`ws://localhost:8080/new?username=${username}`);

    ws.onopen = (x) => {
      console.log("Making connection")
      // ws.bizbang = 
      console.log(x);

    }
    ws.onmessage = ({data}) => {console.log("new lobby");fetchLobbies()}
    ws.onclose = (x) => {
      console.log("closing");
      console.log(x) 
    }

    setClients({...clients, main: ws})
  }

  const handleChange = e => {
    setUsername(e.target.value)
  }

  return (
    <>
      <label>new lobby</label>
      <input value={username} onChange={handleChange}/>
      <button onClick={newLobby}>new lobby</button>
      <button onClick={connect}>Connect</button>
      <button onClick={close}>Close</button>  
      <button onClick={ping}>ping</button>
      <ul>
        {lobbies.map((lobby, index) => 
        <li key={index}>
          <p>{lobby.name}</p>
          <button onClick={() => {}}>Join</button>
        </li>)}
      </ul>
    </>
  )
}

export default App;
