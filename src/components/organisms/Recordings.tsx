import React from 'react';
import { RecordingsTable } from "../molecules/RecordingsTable";
import { Grid } from "@mui/material";

interface RecordingsProps {
  handleEditRecording: (fileName: string) => void;
  handleRunRecording: (fileName: string) => void;
}

export const Recordings = ({ handleEditRecording, handleRunRecording }: RecordingsProps) => {
  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RecordingsTable
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleRunRecording}
        />
      </Grid>
    </Grid>
  );
}
