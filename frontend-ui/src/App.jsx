import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    const response = await fetch("http://localhost:5001/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setReply(data.reply);
  }

  return (
    <div>
      <h1>AI Web App</h1>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={sendMessage}>Send</button>

      <p>{reply}</p>
    </div>
  )

  
  
}

export default App
