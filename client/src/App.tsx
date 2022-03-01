import React from 'react';
import './App.css';

import { SocketProvider } from './context/socket';
import { RecordPage } from "./pages/RecordPage";

function App() {

  return (
    <SocketProvider>
      <div className="App">
          <RecordPage></RecordPage>
      </div>
    </SocketProvider>
  );
}

export default App;
