import React from 'react';
import { RecordingsTable } from "../molecules/RecordingsTable";
import { Grid } from "@mui/material";
import { AddButton } from "../atoms/AddButton";
import styled from "styled-components";

interface RecordingsProps {
  handleNewRecording: () => void;
  handleEditRecording: (fileName: string) => void;
}

export const Recordings = ({ handleNewRecording, handleEditRecording }: RecordingsProps) => {
  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <RecordingsHeader>
          <AddButton
            handleClick={handleNewRecording}
            title="New Recording"
            style={{
              borderRadius: '0%',
              padding: '12px',
              background: 'rgba(25, 118, 210, 0.8)',
              color: '#fff',
            }}
          />
        </RecordingsHeader>
        <hr/>
      </Grid>
      <Grid item xs>
        <RecordingsTable handleEditRecording={handleEditRecording}/>
      </Grid>
    </Grid>
  );
}

const RecordingsHeader = styled.div`
  padding: 10px 10px 25px 10px;
`;
