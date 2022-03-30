import React from 'react';

import { RecordPage } from "./pages/RecordPage";
import { SocketProvider } from "./context/socket";

function App () {

  return (
    <div>
      <SocketProvider>
        <RecordPage/>
      </SocketProvider>
    </div>
  );
}

export default App;
