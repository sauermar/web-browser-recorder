import React, { useEffect } from 'react';
import { Grid } from '@mui/material';
import { NavBar } from "../components/molecules/NavBar";
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

  const browserContentRef = React.useRef<HTMLDivElement>(null);

  const { setId } = useSocketStore();
  const  { setWidth, width } = useBrowserDimensionsStore();


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
      if (window.innerHeight <= (currentWidth / 1.6)) {
       setWidth(currentWidth - 10);
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
    <div>
      <NavBar/>
      <Grid container direction="row" spacing={0}>
        <Grid item xs={ 2 } style={{ display: "flex", flexDirection: "row" }}>
            <LeftSidePanel/>
        </Grid>
        <Grid id="browser-content" ref={browserContentRef} item xs>
          { isLoaded ? <BrowserContent/> : <Loader/> }
        </Grid>
        <Grid item xs={ 2 }>
            <RightSidePanel/>
        </Grid>
      </Grid>
    </div>
  );
};
