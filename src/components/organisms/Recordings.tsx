import React, { useState } from 'react';
import { RecordingsTable } from "../molecules/RecordingsTable";
import { Grid } from "@mui/material";
import { RunSettings, RunSettingsModal } from "../molecules/RunSettings";

interface RecordingsProps {
  handleEditRecording: (fileName: string) => void;
  handleRunRecording: (settings: RunSettings) => void;
  setFileName: (fileName: string) => void;

}

export const Recordings = ({ handleEditRecording, handleRunRecording, setFileName }: RecordingsProps) => {
  const [runSettingsAreOpen, setRunSettingsAreOpen] = useState(false);

  const handleSettingsAndRun = (fileName: string) => {
    setRunSettingsAreOpen(true);
    setFileName(fileName);
  }

  const handleClose = () => {
    setRunSettingsAreOpen(false);
    setFileName('');
  }

  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RecordingsTable
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleSettingsAndRun}
        />
        <RunSettingsModal isOpen={runSettingsAreOpen}
                          handleClose={handleClose}
                          handleStart={ (settings) => handleRunRecording(settings) }/>
      </Grid>
    </Grid>
  );
}
