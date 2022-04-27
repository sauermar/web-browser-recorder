import { Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getActiveWorkflow } from "../../api/workflow";
import { useSocketStore } from '../../context/socket';
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { Pair } from "../molecules/Pair";
import { InterpretationIcons } from "../molecules/InterpretationIcons";
import { GenericModal } from "../atoms/GenericModal";

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

export const SidePanel = () => {
  const [workflow, setWorkflow] = useState<WorkflowFile | null>(null);

  const { id, socket } = useSocketStore();

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
      <InterpretationIcons/>
      {workflow ?
        workflow.workflow.map((pair, i, workflow) =>
          <Pair key={workflow.length - i} index={workflow.length - i} pair={pair} updateWorkflow={setWorkflow}/>
        ) : null}

    </Paper>
  );

};
