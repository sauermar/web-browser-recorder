import { Box, Tabs, Typography, Tab } from "@mui/material";
import Highlight from "react-highlight";
import Button from "@mui/material/Button";
import * as React from "react";
import { Data } from "./RunsTable";
import { TabPanel, TabContext } from "@mui/lab";
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import {Buffer} from 'buffer';
import { useEffect } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';

interface RunContentProps {
  row: Data,
  currentLog: string,
  interpretationInProgress: boolean,
  logEndRef: React.RefObject<HTMLDivElement>,
  abortRunHandler: () => void,
}

export const RunContent = ({row, currentLog, interpretationInProgress, logEndRef, abortRunHandler}: RunContentProps) => {
  const [tab, setTab] = React.useState<string>('log');

  useEffect(() => {
    setTab(tab);
  }, [interpretationInProgress])

  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} aria-label="run-content-tabs">
          <Tab label="Log" value='log' />
          <Tab label="Input" value='input' />
          <Tab label="Output" value='output' />
        </Tabs>
      </Box>
      <TabPanel value='log'>
        <Box sx={{ margin: 1,
          background: '#19171c',
          overflowY: 'scroll',
          overflowX: 'scroll',
          width: '700px',
          height: 'fit-content',
          maxHeight: '450px',
        }}>
          <div>
            <Highlight className="javascript">
              {interpretationInProgress ? currentLog : row.log}
            </Highlight>
            <div style={{ float:"left", clear: "both" }}
                 ref={logEndRef}/>
          </div>
        </Box>
        {interpretationInProgress ? <Button
          color="error"
          onClick={abortRunHandler}
        >
          Stop
        </Button> : null}
      </TabPanel>
      <TabPanel value='input' sx={{width: '700px'}}>
        <Typography variant='h6' sx={{display:'flex', alignItems:'center'}}>
          <SettingsIcon sx={{marginRight: '15px'}}/>
          Interpreter settings
        </Typography>
        {
          Object.keys(row.interpreterSettings).map((setting, index) => {
            if (setting === 'params') {
              return (
                <div key={`settings-${setting}-${index}`}>
                <Typography variant='h6' sx={{display:'flex', alignItems:'center'}} key={`setting-${index}`}>
                  <AssignmentIcon sx={{marginRight: '15px'}}/>
                  Recording parameters
                </Typography>
                  {
                    Object.keys(row.interpreterSettings.params).map((param, index) => {
                      return (
                        <Typography key={`recording-params-item-${index}`} sx={{margin: '10px'}}>
                          {/*@ts-ignore*/}
                          {param}: {row.interpreterSettings.params[param].toString()}
                        </Typography>
                      )
                    })
                  }
                </div>
              )
            }
            return (
              <Typography key={`interpreter-settings-item-${index}`} sx={{margin: '10px'}}>
                {/*@ts-ignore*/}
                {setting}: {row.interpreterSettings[setting].toString()}
              </Typography>
            )
          })
        }
      </TabPanel>
      <TabPanel value='output' sx={{width: '700px'}}>
        { !row || !row.serializableOutput || !row.binaryOutput
          || (Object.keys(row.serializableOutput).length === 0 && Object.keys(row.binaryOutput).length === 0)
          ? <Typography>The output is empty.</Typography> : null }

        {row.serializableOutput &&
          Object.keys(row.serializableOutput).length !== 0 &&
          <div>
              <Typography variant='h6' sx={{display:'flex', alignItems:'center'}}>
                  <ArticleIcon sx={{marginRight: '15px'}}/>
                  Serializable output</Typography>
            { Object.keys(row.serializableOutput).map((key) => {
              return (
                <div key={`number-of-serializable-output-${key}`}>
                  <Typography>
                    {key}:
                    <a href={`data:application/json;utf8,${JSON.stringify(row.serializableOutput[key], null, 2)}`}
                       download={key} style={{margin:'10px'}}>Download</a>
                  </Typography>
                <Box sx={{
                  width: 'fit-content',
                  background: 'rgba(0,0,0,0.06)',
                  maxHeight: '300px',
                  overflow: 'scroll',
                }}>
                  <pre key={`serializable-output-${key}`}>
                    {row.serializableOutput[key] ? JSON.stringify(row.serializableOutput[key], null, 2)
                    : 'The output is empty.'}
                  </pre>
                </Box>
                </div>
              )
            })}
          </div>
        }
        {row.binaryOutput
          && Object.keys(row.binaryOutput).length !== 0 &&
          <div>
            <Typography variant='h6' sx={{display:'flex', alignItems:'center'}}>
                <ImageIcon sx={{marginRight:'15px'}}/>
                Binary output</Typography>
            { Object.keys(row.binaryOutput).map((key) => {
              try {
                const binaryBuffer = JSON.parse(row.binaryOutput[key].data);
                const b64 = Buffer.from(binaryBuffer.data).toString('base64');
                return (
                  <Box key={`number-of-binary-output-${key}`} sx={{
                    width: 'max-content',
                  }}>
                    <Typography key={`binary-output-key-${key}`}>
                      {key}:
                      <a href={`data:${row.binaryOutput[key].mimetype};base64,${b64}`}
                         download={key} style={{margin:'10px'}}>Download</a>
                    </Typography>
                    <img key={`image-${key}`} src={`data:${row.binaryOutput[key].mimetype};base64,${b64}`}
                         alt={key} height='auto' width='700px'/>
                  </Box>
                )
              } catch (e) {
                console.log(e)
                return <Typography key={`number-of-binary-output-${key}`}>
                  {key}: The image failed to render
                </Typography>
              }
              })}
          </div>
        }
      </TabPanel>
      </TabContext>
    </Box>
  );
}
