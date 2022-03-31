import React from 'react';
import './App.css';

import { SocketProvider } from './context/socket';
import { RecordPage } from "./pages/RecordPage";
import { RecordingPage } from "./pages/RecordingPage";

function App() {

  return (
    <html>
    <head>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
    </head>
    <body>
      <SocketProvider>
        <div>
            <RecordingPage/>
        </div>
      </SocketProvider>
    </body>
    </html>

  );
}

export default App;
