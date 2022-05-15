import React from 'react';

import { SocketProvider } from "./context/socket";
import { RecordingPage } from "./pages/RecordingPage";
import { BrowserDimensionsProvider } from "./context/browserDimensions";

function App () {

  return (
    <div>
      <SocketProvider>
        <BrowserDimensionsProvider>
          <RecordingPage/>
        </BrowserDimensionsProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
