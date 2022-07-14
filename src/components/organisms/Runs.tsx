import React, { useEffect } from 'react';
import { Grid } from "@mui/material";
import { RunsTable } from "../molecules/RunsTable";

interface RunsProps {
  currentInterpretationLog: string;
  abortRunHandler: () => void;
  runId: string;
}

export const Runs = (
  { currentInterpretationLog, abortRunHandler, runId }: RunsProps) => {

  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RunsTable
          currentInterpretationLog={currentInterpretationLog}
          abortRunHandler={abortRunHandler}
          runId={runId}
        />
      </Grid>
    </Grid>
  );
}
