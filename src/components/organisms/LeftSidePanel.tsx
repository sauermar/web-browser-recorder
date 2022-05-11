import { Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getActiveWorkflow } from "../../api/workflow";
import { useSocketStore } from '../../context/socket';
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { SidePanelHeader } from "../molecules/SidePanelHeader";
import { emptyWorkflow } from "../../shared/constants";
import { LeftSidePanelContent } from "../molecules/LeftSidePanelContent";

const fetchWorkflow = (id: string, callback: (response: WorkflowFile) => void) => {
  getActiveWorkflow(id).then(
    (response ) => {
      if (response){
        callback(response);
      } else {
        throw new Error("No workflow found");
      }
    }
  ).catch((error) => {console.log(error.message)})
};

export const LeftSidePanel = () => {
  const { id, socket } = useSocketStore();

  const [workflow, setWorkflow] = useState<WorkflowFile>(emptyWorkflow);

  useEffect(() => {
    // fetch the workflow every time the id changes
    if (id) {
      fetchWorkflow(id, setWorkflow);
      console.log("Fetching workflow successful");
    }
    // fetch workflow in 15min intervals
    let interval = setInterval(() =>{
    if (id) {
      fetchWorkflow(id, setWorkflow);
      console.log("Fetching workflow successful");
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
      <SidePanelHeader
        updateWorkflow={setWorkflow}
        numberOfPairs={workflow.workflow.length}
      />
      <LeftSidePanelContent
        workflow={workflow}
        updateWorkflow={setWorkflow}
      />
    </Paper>
  );

};