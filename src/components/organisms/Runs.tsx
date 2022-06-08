import React from 'react';
import { Grid } from "@mui/material";
import { RunsTable } from "../molecules/RunsTable";

export const Runs = () => {
  return (
    <Grid container direction="column" sx={{ padding: '30px'}}>
      <Grid item xs={ 3 }>
        <hr/>
      </Grid>
      <Grid item xs>
        <RunsTable />
      </Grid>
    </Grid>
  );
}
