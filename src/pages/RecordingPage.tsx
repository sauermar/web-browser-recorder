import React, { useEffect } from 'react';
import { Grid, Paper} from '@mui/material';
import { NavBar } from "../components/molecules/NavBar";
import { BrowserContent } from "../components/organisms/BrowserContent";
import { useSocketStore } from "../context/socket";
import { startRecording, stopRecording, getActiveBrowserId } from "../api/remoteBrowser";
import { SidePanel } from "../components/organisms/SidePanel";

// frontend minimalistic prototype using MUI framework
export const RecordingPage = () => {

  const [browserId, setBrowserId] = React.useState('');

  const { setId, resetId } = useSocketStore();

  useEffect(() => {
    let isCancelled = false;
    console.log('RecordingPage.useEffect called');
    const handleRecording = async() => {
      const id = await getActiveBrowserId();
      if (!isCancelled) {
        if (id) {
          console.log('Recording in progress', id);
          resetId(id);
          setBrowserId(id);
        } else {
          const newId = await startRecording()
          setId(newId);
          setBrowserId(newId);
        }
      }
    };

    handleRecording();

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
