import React, { FC, useState } from 'react';
import { InterpretationButtons } from "./InterpretationButtons";
import { AddButton } from "../atoms/AddButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import { AddPair } from "../../api/workflow";
import { Button, Stack } from "@mui/material";
import { FastForward } from "@mui/icons-material";
import { useSocketStore } from "../../context/socket";

interface SidePanelHeaderProps {
  numberOfPairs: number;
  updateWorkflow: (workflow: WorkflowFile) => void;
}

export const SidePanelHeader: FC<SidePanelHeaderProps> = (
  {
    numberOfPairs,
    updateWorkflow,
  }
) => {

 const [showEditModal, setShowEditModal] = useState(false);
 const [steppingIsDisabled, setSteppingIsDisabled] = useState(true);

 const { socket } = useSocketStore();

 const addPair = (pair: WhereWhatPair, index: number) => {
  AddPair((index - 1), pair).then((updatedWorkflow) => {
   updateWorkflow(updatedWorkflow);
  }).catch((error) => {
   console.error(error);
  });
  setShowEditModal(false);
 };

 const handleAddPair = () => {
  setShowEditModal(true);
 };

 const handleStep = () => {
   socket?.emit('step');
 };

 return (
   <div>
    <InterpretationButtons enableStepping={(isPaused) => setSteppingIsDisabled(!isPaused)}/>
     <Stack direction="row" spacing={3}>
    <AddButton
      handleClick={handleAddPair}
      title="Add rule"
      hoverEffect={false}
    />
     <Button
       variant='outlined'
       disabled={steppingIsDisabled}
       onClick={handleStep}
     >
       step
       <FastForward/>
     </Button>
     </Stack>
    <GenericModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
    >
     <PairEditForm
       onSubmitOfPair={addPair}
       numberOfPairs={numberOfPairs}
     />
    </GenericModal>
    <hr/>
   </div>
 );
};
