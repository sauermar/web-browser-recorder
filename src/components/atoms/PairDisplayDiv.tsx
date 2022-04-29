import React, { FC } from 'react';
import Typography from '@mui/material/Typography';

interface PairDisplayDivProps {
  title: string;
  content: string;
}

export const PairDisplayDiv: FC<PairDisplayDivProps> = ({title, content}) => {

  return (
    <div>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        {title}
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        {content}
      </Typography>
    </div>
  );
}
