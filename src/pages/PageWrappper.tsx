import React, { useEffect } from 'react';
import { NavBar } from "../components/molecules/NavBar";
import { SocketProvider } from "../context/socket";
import { BrowserDimensionsProvider } from "../context/browserDimensions";
import { RecordingPage } from "./RecordingPage";
import { MainPage } from "./MainPage";
import { useGlobalInfoStore } from "../context/globalInfo";
import { getActiveBrowserId } from "../api/recording";


export const PageWrapper = () => {

  const { browserId, setBrowserId } =  useGlobalInfoStore();

  const handleNewRecording = () => {
    setBrowserId('new-recording');
  }

  useEffect(() => {
    const isRecordingInProgress = async() => {
      const id = await getActiveBrowserId();
      if (id) {
        setBrowserId(id);
      }
    }

    isRecordingInProgress();
  }, []);

  return (
    <div>
      <NavBar/>
        {browserId
          ? (
            <SocketProvider>
              <BrowserDimensionsProvider>
                <RecordingPage/>
              </BrowserDimensionsProvider>
            </SocketProvider>
          )
          : <MainPage
            newRecording={handleNewRecording}
          />
        }
    </div>
  );
}
