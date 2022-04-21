import React, { useEffect } from 'react';
import { Grid, Paper} from '@mui/material';
import { NavBar } from "../components/molecules/NavBar";
import { BrowserContent } from "../components/organisms/BrowserContent";
import { useSocketStore } from "../context/socket";
import { startRecording, stopRecording, getActiveBrowserId } from "../api/remoteBrowser";
import { SidePanel } from "../components/organisms/SidePanel";

// frontend minimalistic prototype using MUI framework
export const RecordingPage = () => {

  const { setId } = useSocketStore();

  useEffect(() => {
    getActiveBrowserId().then(id => {
      if (id) {
        stopRecording(id);
        console.log('recording was stopped');
        console.log('Recording in progress', id);
        setId(id);
      }
      else {
        startRecording().then((id) => {
          setId(id);
          if (id) {
            // cleanup function when the component dismounts
            return () => {
              console.log('recording was stopped');
              stopRecording(id);
            };
          }
        });
      }
    });
  }, [setId]);

  return (
    <div>
      <NavBar/>
      <Grid container direction="row" spacing={0}>
        <Grid item xs={ 2 } style={{ display: "flex", flexDirection: "row" }}>
            <SidePanel/>
        </Grid>
        <Grid item xs>
            <BrowserContent/>
        </Grid>
        <Grid item xs={ 2 }>
            <Paper
              sx={{
                height: '100%',
                width: '100%',
                backgroundColor: 'lightgray',
                alignItems: "center",
              }}/>
        </Grid>
      </Grid>
    </div>
  );
};
