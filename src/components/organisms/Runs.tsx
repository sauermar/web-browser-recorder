import React, { useEffect } from 'react';
import { Grid } from "@mui/material";
import { RunsTable } from "../molecules/RunsTable";
import { Socket } from "socket.io-client";

interface RunsProps {
  runningRecordingName: string;
  currentInterpretationLog: string;
}

export const Runs = ({ runningRecordingName, currentInterpretationLog }: RunsProps) => {

  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RunsTable runningRecordingName={runningRecordingName} currentInterpretationLog={currentInterpretationLog}/>
      </Grid>
    </Grid>
  );
}
