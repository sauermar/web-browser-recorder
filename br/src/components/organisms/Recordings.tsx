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
  const [params, setParams] = useState<string[]>([]);

  const handleSettingsAndRun = (fileName: string, params: string[]) => {
    if (params.length === 0) {
      setRunSettingsAreOpen(true);
      setFileName(fileName);
    } else {
      setParams(params);
      setRunSettingsAreOpen(true);
      setFileName(fileName);
    }
  }

  const handleClose = () => {
    setParams([]);
    setRunSettingsAreOpen(false);
    setFileName('');
  }

  return (
    <React.Fragment>
    <RunSettingsModal isOpen={runSettingsAreOpen}
                      handleClose={handleClose}
                      handleStart={ (settings) => handleRunRecording(settings) }
                      isTask={params.length !== 0}
                      params={params}
    />
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs>
        <RecordingsTable
          handleEditRecording={handleEditRecording}
          handleRunRecording={handleSettingsAndRun}
        />
      </Grid>
    </Grid>
    </React.Fragment>
  );
}
