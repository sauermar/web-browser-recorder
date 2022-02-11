import React from 'react';
import './App.css';
import { BrowserWindow } from './components/BrowserWindow';
import { SocketProvider } from './context/socket';

function App() {

  return (
    <SocketProvider>
      <div className="App">
          <BrowserWindow></BrowserWindow>
      </div>
    </SocketProvider>
  );
}

export default App;
