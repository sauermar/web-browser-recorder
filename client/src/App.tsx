import React, { useState, useEffect }from 'react';
import './App.css';
import { BrowserWindow } from './components/BrowserWindow';
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:8080";

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, { transports: ["websocket"], rejectUnauthorized: false });
    socket.on("FromAPI", data => {
      setResponse(data);
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <BrowserWindow></BrowserWindow>
        <p>
          It's <time dateTime={response}>{response}</time>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
