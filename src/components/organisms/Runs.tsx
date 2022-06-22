import React, { useEffect } from 'react';
import { Grid } from "@mui/material";
import { RunsTable } from "../molecules/RunsTable";

interface RunsProps {
  runningRecordingName: string;
  currentInterpretationLog: string;
  abortRunHandler: () => void;
}

export const Runs = (
  { runningRecordingName, currentInterpretationLog, abortRunHandler }: RunsProps) => {

  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RunsTable
          runningRecordingName={runningRecordingName}
          currentInterpretationLog={currentInterpretationLog}
          abortRunHandler={abortRunHandler}
        />
      </Grid>
    </Grid>
  );
}
