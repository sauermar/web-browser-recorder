import React from 'react';

import { RecordPage } from "./pages/RecordPage";
import { SocketProvider } from "./context/socket";
import { RecordingPage } from "./pages/RecordingPage";

function App () {

  return (
    <div>
      <SocketProvider>
        <RecordingPage/>
      </SocketProvider>
    </div>
  );
}

export default App;
