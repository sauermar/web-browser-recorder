import React, { useState } from 'react';
import { Grid, Switch, Slide, Paper } from '@mui/material';
import styled from "styled-components";

export const RecordingPage = () => {
  const [panelsState, setPanelsState] = useState({
    left: true,
    right: true,
  });

  return (
    <div>
      <NavBar/>
      <Grid container direction="row" spacing={0} alignItems="stretch" justifyContent="center">
        <Grid item xs={ panelsState["left"] ? 3 : 0} style={{ display: "flex", flexDirection: "row" }}>
            <Slide direction="right" in={panelsState["left"]} mountOnEnter unmountOnExit>
              <Paper
                sx={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'lightgray',
                }}
              />
            </Slide>
        </Grid>
        <Grid item xs>
            <StyledDiv2>
              <p>Hello</p>
            </StyledDiv2>
          <Switch defaultChecked onClick={() => {
            setPanelsState({...panelsState, ["left"]: !panelsState["left"]});
          }} />
          <RightSwitch defaultChecked onClick={() => {
            setPanelsState({...panelsState, ["right"]: !panelsState["right"]});
          }} />
        </Grid>
        <Grid item xs={panelsState["right"] ? 2 : 0}>
          {(panelsState["right"]) && (
            <Slide direction="left" in={panelsState["right"]} mountOnEnter unmountOnExit>
              <StyledDiv>
                <p>Hello</p>
              </StyledDiv>
            </Slide>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

const NavBar = styled.div`
  padding: 20px;
`;

const StyledDiv = styled.div`
  display: flex;
  background-color: lightgray;
`;

const StyledDiv2 = styled.div`
  display: flex;
  background-color: darkgreen;
`;

const RightSwitch = styled(Switch)`
  float: right;
`;
