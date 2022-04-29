import React, { FC, useState } from 'react';
import { InterpretationIcons } from "./InterpretationIcons";
import { AddButton } from "../atoms/AddButton";
import { GenericModal } from "../atoms/GenericModal";
import { PairEditForm } from "./PairEditForm";
import { WhereWhatPair, WorkflowFile } from "@wbr-project/wbr-interpret";
import { AddPair } from "../../api/workflow";

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

 return (
   <div>
    <InterpretationIcons/>
    <AddButton
      handleClick={handleAddPair}
      title="Add Pair"
    />
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
