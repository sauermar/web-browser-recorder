import { IconButton, Stack } from "@mui/material";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import React, { useEffect } from "react";
import { interpretCurrentRecording, stopCurrentInterpretation } from "../../api/recording";
import { useSocketStore } from "../../context/socket";
import { useGlobalInfoStore } from "../../context/globalInfo";

interface InterpretationButtonsProps {
  enableStepping: (isPaused: boolean) => void;
}

interface InterpretationInfo {
  running: boolean;
  isPaused: boolean;
}

const interpretationInfo: InterpretationInfo = {
  running: false,
  isPaused: false,
}

export const InterpretationButtons = ({ enableStepping }: InterpretationButtonsProps) => {
  const [info, setInfo] = React.useState<InterpretationInfo>(interpretationInfo);

  const { socket } = useSocketStore();
  const { notify } = useGlobalInfoStore();

  useEffect(() => {
    if (socket) {
      socket.on('finished', () => {
        setInfo({...info, isPaused: false});
        enableStepping(false);
      });
      socket.on('breakpointHit', () => {
        setInfo({running: false, isPaused: true});
        notify('warning', 'Please restart the interpretation, after updating the recording');
        enableStepping(true);
      });
    }
  }, [socket, setInfo, enableStepping]);

  const handlePlay = async () => {
    if (info.isPaused) {
      socket?.emit("resume");
      setInfo({running: true, isPaused: false});
      enableStepping(false);
    } else {
      console.log("handling play");
      setInfo({...info, running: true});
      const finished = await interpretCurrentRecording();
      setInfo({...info, running: false});
      if (finished) {
        notify('info', 'Interpretation finished');
      } else {
        notify('error', 'Interpretation failed to start');
      }
    }
  };

  const handleStop = async () => {
    console.log("handling stop");
    setInfo({ running: false, isPaused: false });
    enableStepping(false);
    await stopCurrentInterpretation();
  };

  const handlePause = async () => {
    console.log("handling pause");
    if (info.running) {
      socket?.emit("pause");
      setInfo({ running: false, isPaused: true });
      notify('warning', 'Please restart the interpretation, after updating the recording');
      enableStepping(true);
    }
  };

  return (
    <Stack direction="row" spacing={3}
    sx={{ marginTop: '10px', marginBottom: '5px'}} >
      <IconButton disabled={!info.running} sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="pause" size="small" title="Pause" onClick={handlePause}>
        <PauseCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Pause
      </IconButton>
      <IconButton disabled={info.running} sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
                  aria-label="play" size="small" title="Play" onClick={handlePlay}>
        <PlayCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        {info.isPaused ? 'Resume' : 'Start'}
      </IconButton>
      <IconButton disabled={!info.running && !info.isPaused} sx={{display:'grid', '&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}
        aria-label="stop" size="small" title="Stop" onClick={handleStop}>
        <StopCircle sx={{ fontSize: 30, justifySelf:'center' }}/>
        Stop
      </IconButton>
    </Stack>
  );
};
