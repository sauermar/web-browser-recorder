import React, { FC, useState } from 'react';
import { BasicModal } from "./Modal";
import { Button } from "@mui/material";
import { WhereWhatPair } from "@wbr-project/wbr-interpret/build/workflow";

interface PairProps {
  index: number;
  pair: WhereWhatPair;
}

export const Pair: FC<PairProps> = ({index, pair}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
    <Button variant="outlined" size="medium"   sx={{
      width: 236,
      color: 'darkgray',
      outline: 'darkgrey',
    }} onClick={handleOpen}>{index} {pair.what[0].action}</Button>
      <BasicModal open={open} onClose={handleClose} title={pair.what[0].action} content={createContent(pair)}/>
    </div>
    );
};

const createContent = (pair: WhereWhatPair): string => {
  return `where: ${JSON.stringify(pair.where)},` +
   `what: ${JSON.stringify(pair.what)}`;
};
