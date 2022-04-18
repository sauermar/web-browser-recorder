import { Button, IconButton, Paper, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PauseCircle, PlayCircle, StopCircle } from "@mui/icons-material";
import { getActiveWorkflow } from "../../api/workflow";
import { useSocketStore } from '../../context/socket';
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { Pair } from "../molecules/Pair";

const fetchWorkflow = (id: string, callback: (response: WorkflowFile) => void) => {
  getActiveWorkflow(id).then(
    (response ) => {
      if (response){
        callback(response);
      } else {
        throw new Error("No workflow found");
      }
    }
  ).catch((error) => {console.log(error)})
};

export const SidePanel = () => {
  const [workflow, setWorkflow] = useState<WorkflowFile | null>(null);

  const { id, socket } = useSocketStore();

  useEffect(() => {
    let interval = setInterval(() =>{
    if (id) {
      fetchWorkflow(id, setWorkflow);
      console.log("Fetching workflow successful!!!!!!");
    }}, (1000 * 60 * 15));
    return () => clearInterval(interval)
  }, [id]);

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
        workflow.workflow.map((pair, i) =>
          <Pair key={i} index={i} pair={pair}/>
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
