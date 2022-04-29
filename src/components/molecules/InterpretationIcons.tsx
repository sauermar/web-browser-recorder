import { IconButton, Stack } from "@mui/material";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import React from "react";
import { interpretCurrentRecording } from "../../api/recording";

export const InterpretationIcons = () => {

  const handlePlay = async () => {
    console.log("handling play");
    await interpretCurrentRecording();
  };

  return (
    <Stack direction="row" spacing={1}>
      <IconButton aria-label="pause" size="large" title="Pause">
        <PauseCircle sx={{ fontSize: 40 }}/>
      </IconButton>
      <IconButton aria-label="play" size="large" title="Play" onClick={handlePlay}>
        <PlayCircle sx={{ fontSize: 40 }}/>
      </IconButton>
      <IconButton aria-label="stop" size="large" title="Stop">
        <StopCircle sx={{ fontSize: 40 }}/>
      </IconButton>
    </Stack>
  );
};
