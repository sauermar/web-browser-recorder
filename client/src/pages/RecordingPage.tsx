import React, { useEffect, useState } from 'react';
import { Grid, Switch, Slide, Paper, Button, IconButton, Stack } from '@mui/material';
import styled from "styled-components";
import { NavBar } from "../components/molecules/NavBar";
import { BrowserContent } from "../components/organisms/BrowserContent";
import { useSocketStore } from "../context/socket";
import { startRecording, stopRecording } from "../api/RemoteBrowserAPI";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";

// very frontend minimalistic prototype using MUI framework
export const RecordingPage = () => {
  const [panelsState, setPanelsState] = useState({
    left: true,
    right: true,
  });

  const { setId } = useSocketStore();
  useEffect(() => {
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
  }, [setId]);

  return (
    <div>
      <NavBar/>
      <Grid container direction="row" spacing={0}>
        <Grid item xs={ panelsState["left"] ? 2 : 0} style={{ display: "flex", flexDirection: "row" }}>
            <Slide direction="right" in={panelsState["left"]} mountOnEnter unmountOnExit>
              <Paper
                sx={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'lightgray',
                  alignItems: "center",
                }}
              >
                <RecordingIcons/>
                <Button variant="outlined" size="medium"   sx={{
                  width: 236,
                  color: 'darkgray',
                  outline: 'darkgrey',
                }}>Rule 1</Button>

              </Paper>
            </Slide>
        </Grid>
        <Grid item xs>
            <BrowserContent/>
          <Switch defaultChecked={panelsState["left"]} onClick={() => {
            setPanelsState({...panelsState, ["left"]: !panelsState["left"]});
          }} />
          <RightSwitch defaultChecked={panelsState["right"]} onClick={() => {
            setPanelsState({...panelsState, ["right"]: !panelsState["right"]});
          }} />
        </Grid>
        <Grid item xs={panelsState["right"] ? 2 : 0}>
          {(panelsState["right"]) && (
            <Slide direction="left" in={panelsState["right"]} mountOnEnter unmountOnExit>
              <Paper
                sx={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'lightgray',
                  alignItems: "center",
                }}/>
            </Slide>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

const RightSwitch = styled(Switch)`
  float: right;
`;

const RecordingIcons = () => {
  return (
    <Stack direction="row" spacing={1}>
      <IconButton aria-label="pause" size="large">
        <PauseCircle sx={{ fontSize: 40 }}/>
      </IconButton>
      <IconButton aria-label="play" size="large">
        <PlayCircle sx={{ fontSize: 40 }}/>
      </IconButton>
      <IconButton aria-label="stop" size="large">
        <StopCircle sx={{ fontSize: 40 }}/>
      </IconButton>
    </Stack>
  );
};
