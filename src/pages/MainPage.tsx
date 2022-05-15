import React from 'react';
import { MainMenu } from "../components/organisms/MainMenu";
import { Grid } from "@mui/material";
import { Recordings } from "../components/organisms/Recordings";

interface MainPageProps {
  newRecording: () => void;
}

export const MainPage = ({ newRecording }: MainPageProps) => {

  const [content, setContent] = React.useState('recordings');

  const DisplayContent = () => {
    switch (content) {
      case 'recordings':
        return <Recordings handleNewRecording={newRecording}/>;
      case 'tasks':
        return <h1>Tasks</h1>;
      case 'runs':
        return <h1>Runs</h1>;
      default:
        return null;
    }
  }

  return (
    <Grid container direction="row" spacing={0}>
      <Grid item xs={ 2 } style={{ display: "flex", flexDirection: "row" }}>
        <MainMenu handleChangeContent={setContent}/>
      </Grid>
      <Grid item xs>
        { DisplayContent() }
      </Grid>
    </Grid>
  );
};
