import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Highlight from 'react-highlight'
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketStore } from "../../context/socket";

export const InterpretationLog = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [log, setLog] = useState<string>('');

  const logEndRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (isExpanded: boolean) => (event: React.SyntheticEvent) => {
    setExpanded(isExpanded);
  };

  const { socket } = useSocketStore();

  const scrollLogToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleLog = useCallback((msg: string, date: boolean = true) => {
    if (!date){
      setLog((prevState) => prevState + '\n' + msg);
    } else {
      setLog((prevState) => prevState + '\n' + `[${new Date().toLocaleString()}] ` + msg);
    }
    scrollLogToBottom();
  }, [log, scrollLogToBottom])

  const handleSerializableCallback = useCallback((data: string) => {
    setLog((prevState) =>
      prevState + '\n' + '---------- Serializable output data received ----------' + '\n'
      + JSON.stringify(data, null, 2) + '\n' + '--------------------------------------------------');
    scrollLogToBottom();
  }, [log, scrollLogToBottom])

  const handleBinaryCallback = useCallback(({data, mimetype}: any) => {
    console.log('mimetype', mimetype);
    console.log('data', data);
    setLog((prevState) =>
    prevState + '\n' + '---------- Binary output data received ----------' + '\n'
      + `mimetype: ${mimetype}` + '\n' + `data: ${JSON.stringify(data)}` + '\n'
      + '------------------------------------------------');
    scrollLogToBottom();
  }, [log, scrollLogToBottom])

  useEffect(() => {
    socket?.on('log', handleLog);
    socket?.on('serializableCallback', handleSerializableCallback);
    socket?.on('binaryCallback', handleBinaryCallback);
    return () => {
      socket?.off('log', handleLog);
      socket?.off('serializableCallback', handleSerializableCallback);
      socket?.off('binaryCallback', handleBinaryCallback);
    }
  }, [socket, handleLog])

  return (
    <div>
      <Accordion
        expanded={expanded}
        onChange={handleChange(!expanded)}
        style={{background: '#3f4853', color: 'white', borderRadius: '0px'}}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{color: 'white'}}/>}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>
            Interpretation Log
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{
          background: '#19171c',
          overflowY: 'scroll',
          width: '100%',
          aspectRatio: '4/1',
          boxSizing: 'border-box',
        }}>
          <div>
            <Highlight className="javascript">
              {log}
            </Highlight>
            <div style={{ float:"left", clear: "both" }}
                 ref={logEndRef}/>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
