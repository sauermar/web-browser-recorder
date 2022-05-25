import React, { useEffect, useState } from 'react';
import { NavBar } from "../components/molecules/NavBar";
import { SocketProvider } from "../context/socket";
import { BrowserDimensionsProvider } from "../context/browserDimensions";
import { RecordingPage } from "./RecordingPage";
import { MainPage } from "./MainPage";
import { useGlobalInfoStore } from "../context/globalInfo";
import { getActiveBrowserId } from "../api/recording";
import { AlertSnackbar } from "../components/atoms/AlertSnackbar";


export const PageWrapper = () => {

  const [recordingName, setRecordingName] = useState('');
  const [open, setOpen] = useState(false);

  const { browserId, setBrowserId, notification } =  useGlobalInfoStore();

  const handleNewRecording = () => {
    setBrowserId('new-recording');
    setRecordingName('');
  }

  const handleEditRecording = (fileName: string) => {
    setRecordingName(fileName);
    setBrowserId('new-recording');
  }

  const isNotification = (): boolean=> {
    if (notification.isOpen && !open){
      setOpen(true);
    }
    return notification.isOpen;
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
      { isNotification() ?
        <AlertSnackbar severity={notification.severity}
                       message={notification.message}
                       isOpen={notification.isOpen}/>
        : null
      }
    </div>
  );
}
