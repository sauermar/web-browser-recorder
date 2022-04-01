import React from 'react';
import './App.css';

import { SocketProvider } from './context/socket';
import { RecordPage } from "./pages/RecordPage";
import { RecordingPage } from "./pages/RecordingPage";

function App() {

  return (
      <SocketProvider>
        <div>
            <RecordingPage/>
        </div>
      </SocketProvider>
  );
}

export default App;
