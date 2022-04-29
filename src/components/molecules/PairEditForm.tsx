import { Button, TextField } from "@mui/material";
import React, { FC } from "react";
import { Preprocessor, WhereWhatPair } from "@wbr-project/wbr-interpret";

interface PairProps {
  index: string;
  title?: string;
  where: string | null;
  what: string | null;
}

interface PairEditFormProps {
  onSubmitOfPair: (value: WhereWhatPair, index: number) => void;
  numberOfPairs: number;
}

export const PairEditForm: FC<PairEditFormProps> = ({ onSubmitOfPair, numberOfPairs }) => {
  const [pairProps, setPairProps] = React.useState<PairProps>({
    where: null,
    what: null,
    index: "1",
  });
  const [errors, setErrors] = React.useState<PairProps>({
    where: null,
    what: null,
    index: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (id === 'index') {
      if (parseInt(value, 10) < 1) {
        setErrors({ ...errors, index: 'Index must be greater than 0' });
        return;
      } else {
        setErrors({ ...errors, index: '' });
      }
    }
    setPairProps({ ...pairProps, [id]: value });
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    let whereFromPair, whatFromPair;
    // validate where
    try {
      whereFromPair = {
        where: pairProps.where && pairProps.where !== '{"url":"","selectors":[""] }'
          ? JSON.parse(pairProps.where)
          : {},
        what: [],
      };
      Preprocessor.validateWorkflow({workflow: [whereFromPair]});
      setErrors({ ...errors, where: null });
    } catch (e) {
      const { message } = e as Error;
      setErrors({ ...errors, where: message });
    }
    // validate what
    try {
      whatFromPair = {
        where: {},
        what: pairProps.what && pairProps.what !== '[{"action":"","args":[""] }]'
          ? JSON.parse(pairProps.what): [],
      };
      const result = Preprocessor.validateWorkflow({workflow: [whatFromPair]});
      console.log(result);
      setErrors({ ...errors, "what": null });
    } catch (e) {
      const { message } = e as Error;
      setErrors({ ...errors, "what": message });
      return;
    }
    //validate index
    const index = parseInt(pairProps?.index, 10);
    if (index > (numberOfPairs + 1)) {
      if (numberOfPairs === 0) {
        setErrors({ ...errors, index: 'Index of the first pair must be 1' });
      } else {
        setErrors({ ...errors, index: `Index must be in the range 1-${numberOfPairs + 1}` });
      }
    } else {
      setErrors({ ...errors, index: '' });
    }

    if (!errors.where || !errors.what || !errors.index) {
      // submit the pair
      onSubmitOfPair({
        where: whereFromPair?.where || {},
        what: whatFromPair?.what || [],
      }, index);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{display: "grid"}}>
      <TextField sx={{
        display:"block",
        marginTop: "40px",
        marginBottom: "20px"
      }} id="index" label="Index" type="number"
       InputProps={{ inputProps: { min: 1 } }}
        InputLabelProps={{
          shrink: true,
        }} defaultValue={pairProps.index}
        onChange={handleInputChange}
        error={errors.index ? true : false} helperText={errors.index}
      />
      <TextField required sx={{marginBottom: "20px"}}
        onChange={handleInputChange} id="title" label="Title" variant="filled"/>
      <TextField multiline sx={{marginBottom: "20px"}}
        id="where" label="Where" variant="outlined" onChange={handleInputChange}
                 defaultValue='{
                         "url":"",
                         "selectors":[""]
                         }'
                 error={errors.where ? true : false} helperText={errors.where}/>
      <TextField multiline sx={{marginBottom: "20px"}}
        id="what" label="What" variant="outlined" onChange={handleInputChange}
                 defaultValue='[{
                         "action":"",
                         "args":[""]
                         }]'
                 error={errors.what ? true : false} helperText={errors.what}/>
      <Button type="submit" >Submit</Button>
    </form>
  );
};