import React from 'react';

import { SocketProvider } from "./context/socket";
import { RecordingPage } from "./pages/RecordingPage";
import { BrowserDimensionsProvider } from "./context/browserDimensions";
import { NavBar } from "./components/molecules/NavBar";
import { MainPage } from "./pages/MainPage";

function App () {

  const [isRecording, setIsRecording] = React.useState(false);

  return (
    <div>
      <NavBar/>
      <SocketProvider>
        {isRecording
          ? (
            <BrowserDimensionsProvider>
              <RecordingPage/>
            </BrowserDimensionsProvider>
          )
          : <MainPage newRecording={() => setIsRecording(true)}/>}
      </SocketProvider>
    </div>
  );
}

export default App;
