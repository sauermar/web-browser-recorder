import React, { useEffect, useState } from 'react';
import { NavBar } from "../components/molecules/NavBar";
import { SocketProvider } from "../context/socket";
import { BrowserDimensionsProvider } from "../context/browserDimensions";
import { RecordingPage } from "./RecordingPage";
import { MainPage } from "./MainPage";
import { useGlobalInfoStore } from "../context/globalInfo";
import { getActiveBrowserId } from "../api/recording";


export const PageWrapper = () => {

  const [recordingName, setRecordingName] = useState('');

  const { browserId, setBrowserId } =  useGlobalInfoStore();

  const handleNewRecording = () => {
    setBrowserId('new-recording');
  }

  const handleEditRecording = (fileName: string) => {
    setRecordingName(fileName);
    handleNewRecording();
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
                <RecordingPage recordingName={recordingName}/>
              </BrowserDimensionsProvider>
            </SocketProvider>
          )
          : <MainPage
            newRecording={handleNewRecording}
            handleEditRecording={handleEditRecording}
          />
        }
    </div>
  );
}
