import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import React, { useCallback, useEffect, useState } from "react";
import { interpretCurrentRecording, stopCurrentInterpretation } from "../../api/recording";
import { useSocketStore } from "../../context/socket";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { GenericModal } from "../atoms/GenericModal";
import { WhereWhatPair } from "@wbr-project/wbr-interpret";
import HelpIcon from '@mui/icons-material/Help';

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
  const [decisionModal, setDecisionModal] = useState<{
    pair: WhereWhatPair | null,
    actionType: string,
    selector: string,
    action: string,
    open:boolean
  }>({ pair: null, actionType: '', selector: '', action: '', open: false} );

  const { socket } = useSocketStore();
  const { notify } = useGlobalInfoStore();

  const finishedHandler = useCallback(() => {
    setInfo({...info, isPaused: false});
    enableStepping(false);
  }, [info, enableStepping]);

  const breakpointHitHandler = useCallback(() => {
    setInfo({running: false, isPaused: true});
    notify('warning', 'Please restart the interpretation, after updating the recording');
    enableStepping(true);
  }, [info, enableStepping]);

  const decisionHandler = useCallback(
    ({pair, actionType, lastData}
       : {pair: WhereWhatPair | null, actionType: string, lastData: { selector: string, action: string }}) => {
      const {selector, action} = lastData;
    setDecisionModal((prevState) => {
      return {
        pair,
        actionType,
        selector,
        action,
        open: true,
      }
    })
  }, [decisionModal]);

  const handleDecision = (decision: boolean) => {
    const {pair, actionType} = decisionModal;
    socket?.emit('decision', {pair, actionType, decision});
    setDecisionModal({pair: null, actionType: '', selector: '', action: '', open: false});
  }

  const handleDescription = () => {
    switch (decisionModal.actionType){
      case 'customAction':
        return ( <Typography>
          Do you want to use the previously recorded selector
          as a where condition for matching the action?
          <Box style={{marginTop: '4px'}}>
            [previous action: <b>{decisionModal.action}</b>]
            <pre>{decisionModal.selector}</pre>
          </Box>
        </Typography> );
      default: return null;}
  }

  useEffect(() => {
    if (socket) {
      socket.on('finished', finishedHandler);
      socket.on('breakpointHit', breakpointHitHandler);
      socket.on('decision', decisionHandler);
    }
    return () => {
      socket?.off('finished', finishedHandler);
      socket?.off('breakpointHit', breakpointHitHandler);
      socket?.off('decision', decisionHandler);
    }
  }, [socket, finishedHandler, breakpointHitHandler]);

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
      <GenericModal onClose={() => {}} isOpen={decisionModal.open} canBeClosed={false}
      modalStyle={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        background: 'white',
        border: '2px solid #000',
        boxShadow: '24',
        height:'fit-content',
        display:'block',
        overflow:'scroll',
        padding: '5px 25px 10px 25px',
      }}>
        <div style={{padding: '15px'}}>
          <HelpIcon/>
          {
            handleDescription()
          }
          <div style={{float: 'right'}}>
          <Button onClick={() => handleDecision(true)} color='success'>yes</Button>
          <Button onClick={() => handleDecision(false)} color='error'>no</Button>
          </div>
        </div>
      </GenericModal>
    </Stack>
  );
};
