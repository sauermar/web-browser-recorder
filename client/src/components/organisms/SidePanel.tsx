import { Button, IconButton, Paper, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import { getActiveWorkflow } from "../../api/workflow";
import { useSocketStore } from '../../context/socket';
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";

export const SidePanel = () => {
  const [workflow, setWorkflow] = useState<WorkflowFile | null>(null);

  const { id, socket } = useSocketStore();

  const fetchWorkflow = () => {
    getActiveWorkflow(id).then(
      (response ) => {
        setWorkflow(response);
      }
    ).catch((error) => {console.log(error)})
  };

  useEffect(() => {
    if (socket) {
      socket.on("workflow", data => {
        setWorkflow(data);
      });
    }

  }, [workflow, socket]);

  return (
    <Paper
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: 'lightgray',
        alignItems: "center",
      }}
    >
      <RecordingIcons/>
      {workflow ?
        workflow.workflow.map((object, i) =>
          <Button variant="outlined" size="medium"   sx={{
            width: 236,
            color: 'darkgray',
            outline: 'darkgrey',
          }} >Rule{i}</Button>
        ) : null}
    </Paper>
  );

};

const RecordingIcons = () => {
  return (
  <Stack direction="row" spacing={1}>
    <IconButton aria-label="pause" size="large">
      <PauseCircle sx={{ fontSize: 40 }}/>
    </IconButton>
    <IconButton aria-label="play" size="large">
      <PlayCircle sx={{ fontSize: 40 }}/>
    </IconButton>
    <IconButton aria-label="stop" size="large">
      <StopCircle sx={{ fontSize: 40 }}/>
    </IconButton>
  </Stack>
  );
};
