import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Highlight from 'react-highlight'
import { useCallback, useEffect, useState } from "react";
import { useSocketStore } from "../../context/socket";

export const InterpretationLog = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [log, setLog] = useState<string>('');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const { socket } = useSocketStore();

  const handleLog = useCallback((msg: string) => {
    setLog((prevState) => prevState + '\n' + `[${new Date().toLocaleString()}] ` + msg);
  }, [log])

  useEffect(() => {
    socket?.on('log', handleLog);
    return () => {
      socket?.off('log', handleLog)
    }
  }, [socket, handleLog])

  return (
    <div>
      <Accordion
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
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
        <AccordionDetails sx={{background: '#19171c'}}>
          <Highlight className="javascript">
            {log}
          </Highlight>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
