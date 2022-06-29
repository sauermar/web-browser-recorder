import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { KeyValueForm } from "../../atoms/KeyValueForm";
import { AddButton } from "../../atoms/buttons/AddButton";
import { RemoveButton } from "../../atoms/buttons/RemoveButton";
import { WarningText } from "../../atoms/texts";
import InfoIcon from "@mui/icons-material/Info";

export const ScrapeSchemaSettings = forwardRef((props, ref) => {
  const [numberOfPairs, setNumberOfPairs] = React.useState<number>(1);
  const keyValuePairRefs = new Array(numberOfPairs).fill(useRef<{getKeyValuePair: () => { key: string, value: string }}>(null));

  useImperativeHandle(ref, () => ({
    getSettings() {
      const settings = keyValuePairRefs.reduce((reducedObject : any, ref) => {
        const keyValuePair = ref.current?.getKeyValuePair();
        if (keyValuePair) {
          return {
            ...reducedObject,
            [keyValuePair.key]: keyValuePair.value
          }
        } else {
          return reducedObject;
        }
      }, {})
      return settings;
    }
  }));

  return (
    <div>
      <WarningText>
        <InfoIcon color='warning'/>
        The interpreter scrapes the data from a webpage into a "curated" table.
      </WarningText>
      {
        keyValuePairRefs.map((ref, index) => {
          return <KeyValueForm keyLabel={'property'} valueLabel={'selector'} ref={ref} key={index}/>
        })
      }
      <AddButton handleClick={() => setNumberOfPairs(numberOfPairs + 1)} hoverEffect={false}/>
      <RemoveButton handleClick={() => setNumberOfPairs(numberOfPairs - 1)}/>
    </div>
);
});
