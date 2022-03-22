import React from 'react';

import { SocketProvider } from './context/socket';
import { RecordPage } from "./pages/RecordPage";

function App() {

  return (
      <div>
          <RecordPage></RecordPage>
      </div>
  );
}

export default App;
