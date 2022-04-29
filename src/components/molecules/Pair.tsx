import React, { FC, useState } from 'react';
import { BasicModal } from "./Modal";
import { Button } from "@mui/material";
import { deletePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { ClearButton } from "../atoms/ClearButton";

type WhereWhatPair = WorkflowFile["workflow"][number];


interface PairProps {
  index: number;
  pair: WhereWhatPair;
  updateWorkflow: (workflow: WorkflowFile | null) => void;
}

export const Pair: FC<PairProps> = ({index, pair, updateWorkflow}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    deletePair(index - 1).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <div>
      <span>{index}</span>
    <Button variant="outlined" color="primary" size="medium"   sx={{
      width: 170,
      color: "black",
    }} onClick={handleOpen}>
       {pair?.what[0].action}
      <ClearButton handleClick={handleDelete}/>
    </Button>
      <BasicModal open={open} onClose={handleClose} title={pair?.what[0].action } content={createContent(pair)}/>
    </div>
    );
};

const createContent = (pair: WhereWhatPair): string => {
  return `where: ${JSON.stringify(pair?.where)},` +
   `what: ${JSON.stringify(pair?.what)}`;
};
