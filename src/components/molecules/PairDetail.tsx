import React, { useLayoutEffect, useState } from 'react';
import { WhereWhatPair } from "@wbr-project/wbr-interpret";
import { IconButton, Stack, TextField, Typography } from "@mui/material";
import { Close, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { AddButton } from "../atoms/buttons/AddButton";
import { WarningText } from "../atoms/texts";
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';

interface PairDetailProps {
  pair: WhereWhatPair | null;
  index: number;
}

export const PairDetail = ({ pair, index }: PairDetailProps) => {
  const [pairIsSelected, setPairIsSelected] = useState(false);
  const [collapseWhere, setCollapseWhere] = useState(true);
  const [collapseWhat, setCollapseWhat] = useState(true);
  const [rerender, setRerender] = useState(false);
  const [expanded, setExpanded] = React.useState<string[]>(
    pair ? Object.keys(pair.where).map((key, index) => `${key}-${index}`) : []
  );

  const handleCollapseWhere = () => {
      setCollapseWhere(!collapseWhere);
  }

  const handleCollapseWhat = () => {
    setCollapseWhat(!collapseWhat);
  }

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  useLayoutEffect(() => {
    if (pair) {
      setPairIsSelected(true);
    }
  }, [pair])

  const handleChangeValue = (e: React.SyntheticEvent, where: boolean, key: string, additional?: string|number) => {
    if (where) {
      if (additional){
        // @ts-ignore
        pair.where[key][additional] = e.target.value;
      } else {
        // @ts-ignore
        pair.where[key] = e.target.value;
      }
    } else {
      if (additional){
        // @ts-ignore
        pair.what[key][additional] = e.target.value;
      } else {
        // @ts-ignore
        pair.what[key] = e.target.value;
      }
    }
    setRerender(!rerender);
  }


    const DisplayValueContent = (value: any, key: string, where: boolean = true) => {
    switch (typeof(value)) {
      case 'string':
        return <TextField
          size='small'
          type="string"
          onChange={(e) => handleChangeValue(e, where, key)}
          defaultValue={value}
        />
      case 'number':
        return <TextField
          size='small'
          type="number"
          onChange={(e) => handleChangeValue(e, where, key)}
          defaultValue={value}
        />
      // @ts-ignore
      case 'object':
        if (value) {
          if (Array.isArray(value)) {
            return (
              <React.Fragment>
                {value.map((element, index) => {
                  return <TextField
                    size='small'
                    type="string"
                    onChange={(e) => handleChangeValue(e, where, key, index)}
                    defaultValue={element}
                  />
                })}
                <AddButton handleClick={()=> {
                  //@ts-ignore
                  pair.where[key].push('');
                  setRerender(!rerender);
                }}/>
              </React.Fragment>
            )
          } else {
            return (
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ flexGrow: 1, overflowY: 'auto' }}
              >
                {
                  Object.keys(value).map((key2, index) => {
                    if (typeof value[key2] === 'string') {
                      return (
                        <TreeItem nodeId={`settings-object-${index}`} label={key2}>
                          <TextField
                            size='small'
                            type="string"
                            onChange={(e) => handleChangeValue(e, where, key, key2)}
                            defaultValue={value[key2]}
                          />
                        </TreeItem>
                      )
                    } else if (Array.isArray(value[key2])) {
                      return (
                        <TreeItem nodeId={`settings-object-${index}`} label={key2}>
                          {// @ts-ignore
                            value[key2].map((element, index2) => {
                            return <TextField
                              size='small'
                              type="string"
                              onChange={(e) => {
                                if (where) {
                                  // @ts-ignore
                                  pair.where[key][key2][index2] = e.target.value;
                                } else {
                                  // @ts-ignore
                                  pair.what[key][key2][index2] = e.target.value;
                                }
                              }}
                              defaultValue={element}
                            />
                          })}
                          <AddButton handleClick={()=> {
                            //@ts-ignore
                            pair.what[key][key2].push('');
                            setRerender(!rerender);
                          }}/>
                        </TreeItem>
                      )
                    }
                  })
                }
              </TreeView>
            )
          }
        }
        break;
      default:
        return null;
    }
  }

  return (
    <React.Fragment>
    {
      pairIsSelected
        ? (
          <div style={{padding: '10px', overflow: 'hidden'}}>
            <Stack spacing={0} direction='row' sx={{
              display: 'flex',
              alignItems: 'center',
              background: 'lightGray',
            }}>
              <CollapseButton
                handleClick={handleCollapseWhere}
                isCollapsed={collapseWhere}
              />
              <Typography>Where</Typography>
            </Stack>
              {(collapseWhere && pair && pair.where)
                ? Object.keys(pair.where).map((key, index) => {
                  return (
                    <TreeView
                      expanded={expanded}
                      defaultCollapseIcon={<ExpandMoreIcon />}
                      defaultExpandIcon={<ChevronRightIcon />}
                      sx={{ flexGrow: 1, overflowY: 'auto' }}
                      onNodeToggle={handleToggle}
                    >
                      <TreeItem nodeId={`${key}-${index}`} label={`${key}:`} key={`${key}-${index}`}>
                        {
                          // @ts-ignore
                          DisplayValueContent(pair.where[key], key)
                        }
                      </TreeItem>
                    </TreeView>
                    );
                })
                : null
              }

            <Stack spacing={0} direction='row' sx={{
              display: 'flex',
              alignItems: 'center',
              background: 'lightGray',
            }}>
              <CollapseButton
                handleClick={handleCollapseWhat}
                isCollapsed={collapseWhat}
              />
              <Typography>What</Typography>
            </Stack>
            {(collapseWhat && pair && pair.what)
              ?(
              <React.Fragment>
              { Object.keys(pair.what).map((key, index) => {
                return (
                  <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{ flexGrow: 1, overflowY: 'auto' }}
                  >
                    <TreeItem nodeId={`${key}-${index}`} label={`${pair.what[index].action}`}>
                      {
                        // @ts-ignore
                        DisplayValueContent(pair.what[key], key, false)
                      }
                      <ColoseButton handleClick={() => {
                        //@ts-ignore
                        pair.what.splice(key, 1);
                        setRerender(!rerender);
                      }}/>
                    </TreeItem>
                  </TreeView>
                );
              })}
                <AddButton handleClick={()=> {
                  //@ts-ignore
                  pair.what.push({action:'', args: ['']});
                  setRerender(!rerender);
                }}/>
              </React.Fragment>
              )
              : null
            }
          </div>
        )
        : <WarningText>
          <NotificationImportantIcon color="warning"/>
          No pair from the left side panel was selected.
          </WarningText>
    }
    </React.Fragment>
  );
}

interface CollapseButtonProps {
  handleClick: () => void;
  isCollapsed?: boolean;
}

const CollapseButton = ({handleClick, isCollapsed } : CollapseButtonProps) => {
  return (
    <IconButton aria-label="add" size={"small"} onClick={handleClick}>
      { isCollapsed ?  <KeyboardArrowDown/> : <KeyboardArrowUp/>}
    </IconButton>
  );
}

const ColoseButton = ({handleClick } : CollapseButtonProps) => {
  return (
    <IconButton aria-label="add" size={"small"} onClick={handleClick}>
      <Close/>
    </IconButton>
  );
}