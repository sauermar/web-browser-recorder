import { IconButton, Stack } from "@mui/material";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import React from "react";
import { interpretCurrentRecording, stopCurrentRecording } from "../../api/recording";

export const InterpretationButtons = () => {

  const handlePlay = async () => {
    console.log("handling play");
    await interpretCurrentRecording();
  };

  const handleStop = async () => {
    console.log("handling stop");
    await stopCurrentRecording();
  };

  return (
    <Stack direction="row" spacing={3}
    sx={{ marginTop: '10px', marginBottom: '5px'}} >
      <IconButton sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="pause" size="small" title="Pause">
        <PauseCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Pause
      </IconButton>
      <IconButton sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="play" size="small" title="Play" onClick={handlePlay}>
        <PlayCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Play
      </IconButton>
      <IconButton sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
        aria-label="stop" size="small" title="Stop" onClick={handleStop}>
        <StopCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Stop
      </IconButton>
    </Stack>
  );
};
