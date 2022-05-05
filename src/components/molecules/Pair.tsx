import React, { FC, useState } from 'react';
import { Button, Stack } from "@mui/material";
import { deletePair } from "../../api/workflow";
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { ClearButton } from "../atoms/ClearButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { PairDisplayDiv } from "../atoms/PairDisplayDiv";
import TreeItem from "@mui/lab/TreeItem";
import { EditButton } from "../atoms/EditButton";

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
  const handleClose = () => {
    setOpen(false);
    disableEdit();
  }

  const handleDelete = () => {
    deletePair(index - 1).then((updatedWorkflow) => {
      updateWorkflow(updatedWorkflow);
    }).catch((error) => {
      console.error(error);
    });
  };

  return (
    <div>
      <Stack direction="row">
        <TreeItem sx={{padding: '4px'}} nodeId={index.toString()} key={index.toString()} label={index}>
          {
            pair.what.map((what, i) => {
              if (what) {
                const id = `${index.toString()}.${i.toString()}`;
                return <TreeItem nodeId={id} key={id} label={what.action}/>
              }
            })
          }
        </TreeItem>
        <Stack direction="row" spacing={0} sx={{position: 'fixed', left:'150px'}}>
          <EditButton
            handleClick={handleOpen}
          />
          <ClearButton
            handleClick={handleDelete}
          />
        </Stack>
      </Stack>
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
              title={pair?.what[0]?.action}
              pair={pair}
            />
            <Button
              onClick={enableEdit}
              variant="contained"
            >
              Edit
            </Button>
          </div>
        }
      </GenericModal>
    </div>
    );
};
