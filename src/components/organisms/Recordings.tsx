import React from 'react';
import { RecordingsTable } from "../molecules/RecordingsTable";
import { Grid } from "@mui/material";
import { AddButton } from "../atoms/AddButton";
import styled from "styled-components";

interface RecordingsProps {
  handleEditRecording: (fileName: string) => void;
}

export const Recordings = ({ handleEditRecording }: RecordingsProps) => {
  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RecordingsTable handleEditRecording={handleEditRecording}/>
      </Grid>
    </Grid>
  );
}
