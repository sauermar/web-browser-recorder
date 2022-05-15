import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { BrowserContent } from "../components/organisms/BrowserContent";
import { startRecording, stopRecording, getActiveBrowserId } from "../api/recording";
import { LeftSidePanel } from "../components/organisms/LeftSidePanel";
import { RightSidePanel } from "../components/organisms/RightSidePanel";
import { Loader } from "../components/atoms/Loader";
import { useSocketStore } from "../context/socket";
import { useBrowserDimensionsStore } from "../context/browserDimensions";

export const RecordingPage = () => {

  const [browserId, setBrowserId] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasScrollbar, setHasScrollbar] = React.useState(false);

  const browserContentRef = React.useRef<HTMLDivElement>(null);
  const workflowListRef = React.useRef<HTMLDivElement>(null);

  const { setId } = useSocketStore();
  const  { setWidth } = useBrowserDimensionsStore();


  useEffect(() => {
    let isCancelled = false;
    console.log('RecordingPage.useEffect called');
    const handleRecording = async() => {
      const id = await getActiveBrowserId();
      if (!isCancelled) {
        if (id) {
          console.log('Recording in progress', id);
          setId(id);
          setBrowserId(id);
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
      if ( innerHeightWithoutNavBar <= (currentWidth / 1.6)) {
       setWidth(currentWidth - 10);
       setHasScrollbar(true);
      } else {
        setWidth(currentWidth);
        console.log(currentWidth, 'browser width set');
      }
    }

    handleRecording().then(() => {
      setIsLoaded(true);
    });

    return () => {
      isCancelled = true;
      console.log('RecordingPage unmounting');
      if (browserId) {
        stopRecording(browserId);
      }
    }
  }, [setId]);

  return (
    <Grid container direction="row" spacing={0}>
      <Grid item xs={ 2 } ref={workflowListRef} style={{ display: "flex", flexDirection: "row" }}>
          <LeftSidePanel
            sidePanelRef={workflowListRef.current}
            alreadyHasScrollbar={hasScrollbar}
          />
      </Grid>
      <Grid id="browser-content" ref={browserContentRef} item xs>
        { isLoaded ? <BrowserContent/> : <Loader/> }
      </Grid>
      <Grid item xs={ 2 }>
          <RightSidePanel/>
      </Grid>
    </Grid>
  );
};
