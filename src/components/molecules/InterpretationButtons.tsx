import { IconButton, Stack } from "@mui/material";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import React, { useEffect } from "react";
import { interpretCurrentRecording, stopCurrentInterpretation } from "../../api/recording";
import { useSocketStore } from "../../context/socket";

interface InterpretationButtonsProps {
  enableStepping: (isPaused: boolean) => void,
}

export const InterpretationButtons = ({ enableStepping }: InterpretationButtonsProps) => {
  const [isPaused, setIsPaused] = React.useState(false);

  const { socket } = useSocketStore();

  useEffect(() => {
    if (socket) {
      socket.on('finished', () => {
        setIsPaused(false);
        enableStepping(false);
      });
      socket.on('breakpointHit', () => {
        setIsPaused(true);
        enableStepping(true);
      });
    }
  }, [socket, setIsPaused, enableStepping]);

  const handlePlay = async () => {
    if (isPaused) {
      socket?.emit("resume");
      setIsPaused(false);
      enableStepping(false);
    } else {
      console.log("handling play");
      await interpretCurrentRecording();
    }
  };

  const handleStop = async () => {
    console.log("handling stop");
    await stopCurrentInterpretation();
  };

  const handlePause = async () => {
    console.log("handling pause");
    if (!isPaused) {
      socket?.emit("pause");
      setIsPaused(true);
      enableStepping(true);
    }
  };

  return (
    <Stack direction="row" spacing={3}
    sx={{ marginTop: '10px', marginBottom: '5px'}} >
      <IconButton disabled={isPaused} sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="pause" size="small" title="Pause" onClick={handlePause}>
        <PauseCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Pause
      </IconButton>
      <IconButton sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="play" size="small" title="Play" onClick={handlePlay}>
        <PlayCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        {isPaused ? 'Resume' : 'Start'}
      </IconButton>
      <IconButton sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
        aria-label="stop" size="small" title="Stop" onClick={handleStop}>
        <StopCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Stop
      </IconButton>
    </Stack>
  );
};
