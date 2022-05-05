import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { WhereWhatPair } from "@wbr-project/wbr-interpret";

interface PairDisplayDivProps {
  title: string;
  pair: WhereWhatPair;
}

export const PairDisplayDiv: FC<PairDisplayDivProps> = ({title, pair}) => {

  return (
    <div>
      <Typography sx={{ marginBottom: '10px', marginTop: '25px'}} id="pair-title" variant="h5" component="h2">
        {`Title: ${title}`}
      </Typography>
      <Typography id="where-title" variant="h6" component="h2">
        {"Where:"}
      </Typography>
      <Typography id="where-description">
        <pre>{JSON.stringify(pair?.where, undefined, 2)}</pre>
      </Typography>
      <Typography id="what-title" variant="h6" component="h2">
        {"What:"}
      </Typography>
      <Typography id="what-description">
        <pre>{JSON.stringify(pair?.what,undefined, 2)}</pre>
      </Typography>
    </div>
  );
}
