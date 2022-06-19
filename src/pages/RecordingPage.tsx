import React, { useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import { BrowserContent } from "../components/organisms/BrowserContent";
import { startRecording, getActiveBrowserId } from "../api/recording";
import { LeftSidePanel } from "../components/organisms/LeftSidePanel";
import { RightSidePanel } from "../components/organisms/RightSidePanel";
import { Loader } from "../components/atoms/Loader";
import { useSocketStore } from "../context/socket";
import { useBrowserDimensionsStore } from "../context/browserDimensions";
import { useGlobalInfoStore } from "../context/globalInfo";
import { editRecordingFromStorage } from "../api/storage";

interface RecordingPageProps {
  recordingName?: string;
}

export const RecordingPage = ({ recordingName }: RecordingPageProps) => {

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasScrollbar, setHasScrollbar] = React.useState(false);

  const browserContentRef = React.useRef<HTMLDivElement>(null);
  const workflowListRef = React.useRef<HTMLDivElement>(null);

  const { setId, socket } = useSocketStore();
  const { setWidth } = useBrowserDimensionsStore();
  const { browserId, setBrowserId } = useGlobalInfoStore();


  useEffect(() => {
    let isCancelled = false;
    console.log('RecordingPage.useEffect called');
    const handleRecording = async () => {
      const id = await getActiveBrowserId();
      if (!isCancelled) {
        if (id) {
          console.log('Recording in progress', id);
          setId(id);
          setBrowserId(id);
          setIsLoaded(true);
        } else {
          const newId = await startRecording()
          setId(newId);
          setBrowserId(newId);
        }
      }
    };

    if (browserContentRef.current) {
      const currentWidth = Math.floor(browserContentRef.current.getBoundingClientRect().width);
      const innerHeightWithoutNavBar = window.innerHeight - 54.5;
      if (innerHeightWithoutNavBar <= (currentWidth / 1.6)) {
        setWidth(currentWidth - 10);
        setHasScrollbar(true);
      } else {
        setWidth(currentWidth);
        console.log(currentWidth, 'browser width set');
      }
    }

    handleRecording();

    return () => {
      isCancelled = true;
      console.log('RecordingPage unmounting');
    }
  }, [setId]);

  const handleLoaded = useCallback(() => {
    console.log(recordingName);
    console.log(browserId);
    if (recordingName && browserId) {
      editRecordingFromStorage(browserId, recordingName).then(() => setIsLoaded(true));
    } else {
      if (browserId === 'new-recording') {
        socket?.emit('new-recording');
      }
      setIsLoaded(true);
    }
  }, [socket, browserId, recordingName, isLoaded])

  useEffect(() => {
    socket?.on('loaded', handleLoaded);
    return () => {
      socket?.off('loaded', handleLoaded)
    }
  }, [socket, handleLoaded]);

  return (
    <div>
      {isLoaded ?
        <Grid container direction="row" spacing={0}>
          <Grid item xs={2} ref={workflowListRef} style={{ display: "flex", flexDirection: "row" }}>
            <LeftSidePanel
              sidePanelRef={workflowListRef.current}
              alreadyHasScrollbar={hasScrollbar}
              recordingName={recordingName ? recordingName : ''}
            />
          </Grid>
          <Grid id="browser-content" ref={browserContentRef} item xs>
            <BrowserContent/>
          </Grid>
          <Grid item xs={2}>
            <RightSidePanel/>
          </Grid>
        </Grid>
        : <Loader/>}
    </div>
  );
};
