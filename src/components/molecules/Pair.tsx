import React, { FC, useState } from 'react';
import { Button } from "@mui/material";
import { deletePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { ClearButton } from "../atoms/ClearButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { PairDisplayDiv } from "../atoms/PairDisplayDiv";

type WhereWhatPair = WorkflowFile["workflow"][number];


interface PairProps {
  index: number;
  pair: WhereWhatPair;
  updateWorkflow: (workflow: WorkflowFile) => void;
  numberOfPairs: number;
}

export const Pair: FC<PairProps> = ({ index, pair, updateWorkflow, numberOfPairs }) => {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);

  const enableEdit = () => setEdit(true);
  const disableEdit = () => setEdit(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () =>setOpen(false);

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
      <Button
        variant="outlined"
        color="primary"
        size="medium"
        sx={{
          width: 170,
          color: "black",
        }}
        onClick={handleOpen}
      >
        {pair?.what[0].action}
        <ClearButton
          handleClick={handleDelete}
        />
      </Button>
      <GenericModal isOpen={open} onClose={handleClose}>
        { edit
          ?
            <PairEditForm
              onSubmitOfPair={disableEdit}
              numberOfPairs={numberOfPairs}
            />
          :
          <div>
            <PairDisplayDiv
              title={pair?.what[0].action}
              content={createContent(pair)}
            />
            <Button
              onClick={enableEdit}
            >
              Edit
            </Button>
          </div>
        }
      </GenericModal>
    </div>
    );
};

const createContent = (pair: WhereWhatPair): string => {
  return `where: ${JSON.stringify(pair?.where)},` +
   `what: ${JSON.stringify(pair?.what)}`;
};
