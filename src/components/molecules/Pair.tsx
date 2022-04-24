import React, { FC, useState } from 'react';
import { BasicModal } from "./Modal";
import { Button, IconButton } from "@mui/material";
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";
import { Add, Clear } from "@mui/icons-material";
import { AddEmptyPair, deletePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";

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
    deletePair(index).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  };
  const handleAdd = () => {
    AddEmptyPair(index).then((updatedWorkflow) => {
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
    </Button>
      <IconButton aria-label="add" size="small" onClick={handleAdd}>
        <Add sx={{ fontSize: 20 }}/>
      </IconButton>
      <IconButton aria-label="clear" size="small" onClick={handleDelete}>
        <Clear sx={{ fontSize: 20 }}/>
      </IconButton>
      <BasicModal open={open} onClose={handleClose} title={pair?.what[0].action } content={createContent(pair)}/>
    </div>
    );
};

const createContent = (pair: WhereWhatPair): string => {
  return `where: ${JSON.stringify(pair?.where)},` +
   `what: ${JSON.stringify(pair?.what)}`;
};
