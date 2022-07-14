import { useEffect, useRef, useState } from "react";
import * as React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import { DeleteForever, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { deleteRunFromStorage } from "../../api/storage";
import Highlight from "react-highlight";
import Button from "@mui/material/Button";
import { columns, Data } from "./RunsTable";

interface CollapsibleRowProps {
  row: Data;
  handleDelete: () => void;
  isOpen: boolean;
  currentLog: string;
  abortRunHandler: () => void;
}
export const CollapsibleRow = ({ row, handleDelete, isOpen, currentLog, abortRunHandler }: CollapsibleRowProps) => {
  const [open, setOpen] = useState(isOpen);

  const logEndRef = useRef<HTMLDivElement|null>(null);

  const scrollToLogBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  const handleAbort = () => {
    abortRunHandler();
  }

  useEffect(() => {
    console.log('scrolling to the bottom of the log')
    scrollToLogBottom();
  }, [currentLog])

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover role="checkbox" tabIndex={-1} key={row.id}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              setOpen(!open);
              scrollToLogBottom();
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {columns.map((column) => {
          // @ts-ignore
          const value : any = row[column.id];
          if (value !== undefined) {
            return (
              <TableCell key={column.id} align={column.align}>
                {value}
              </TableCell>
            );
          } else {
            switch (column.id) {
              case 'delete':
                return (
                  <TableCell key={column.id} align={column.align}>
                    <IconButton aria-label="add" size= "small" onClick={() => {
                      deleteRunFromStorage(row.name).then((result: boolean) => {
                        if (result) {
                          handleDelete();
                        }
                      })
                    }} sx={{'&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}>
                      <DeleteForever/>
                    </IconButton>
                  </TableCell>
                );
              default:
                return null;
            }
          }
        })}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography>Interpreter settings:</Typography>
            <Typography>{JSON.stringify(row.interpreterSettings, null, 2)}</Typography>
            <Box sx={{ margin: 1,
              background: '#19171c',
              overflowY: 'scroll',
              width: '800px',
              aspectRatio: '4/1',
              boxSizing: 'border-box',
            }}>
              <div>
                <Highlight className="javascript">
                  {isOpen ? currentLog : row.log}
                </Highlight>
                <div style={{ float:"left", clear: "both" }}
                     ref={logEndRef}/>
              </div>
            </Box>
            {isOpen ? <Button
              color="error"
              onClick={handleAbort}
            >
              Abort
            </Button> : null}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
