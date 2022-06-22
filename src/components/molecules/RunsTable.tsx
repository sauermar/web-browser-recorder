import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Collapse, IconButton, Typography } from "@mui/material";
import {  DeleteForever, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { deleteRunFromStorage, getStoredRuns } from "../../api/storage";
import Highlight from "react-highlight";
import Button from "@mui/material/Button";
import { stopRecording } from "../../api/recording";
import { stopRunningInterpretation } from "../../../server/src/browser-management/controller";

interface Column {
  id: 'status' | 'name' | 'startedAt' | 'finishedAt' | 'duration' | 'task' | 'delete';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

const columns: readonly Column[] = [
  { id: 'status', label: 'Status', minWidth: 80 },
  { id: 'name', label: 'Name', minWidth: 80 },
  { id: 'startedAt', label: 'Started at', minWidth: 80 },
  { id: 'finishedAt', label: 'Finished at', minWidth: 80 },
  { id: 'duration', label: 'Duration', minWidth: 80 },
  { id: 'task', label: 'Task', minWidth: 80 },
  { id: 'delete', label: 'Delete', minWidth: 80 },
];

interface Data {
  id: number;
  status: string;
  name: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  task: string;
  log: string;
}

interface RunsTableProps {
  runningRecordingName: string;
  currentInterpretationLog: string;
  abortRunHandler: () => void;
}

export const RunsTable = (
  { runningRecordingName, currentInterpretationLog, abortRunHandler }: RunsTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Data[]>([]);

  const { notify, rerenderRuns, setRerenderRuns } = useGlobalInfoStore();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchRuns = async () => {
    const runs = await getStoredRuns();
    if (runs) {
      const parsedRows: Data[] = [];
      runs.map((run, index) => {
        const parsedRun = JSON.parse(run);
          parsedRows.push({
              id: index,
              ...parsedRun,
            });
      });
      setRows(parsedRows);
    } else {
      console.log('No runs found.');
    }
  }

  useEffect( () => {
    if (rows.length === 0 || rerenderRuns) {
      fetchRuns();
      setRerenderRuns(false);
    }

  }, [rerenderRuns]);


  const handleDelete = () => {
    setRows([]);
    notify('success', 'Run deleted successfully');
    fetchRuns();
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440, width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length !== 0 ? rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) =>
                  <CollapsibleRow
                    row={row}
                    handleDelete={handleDelete}
                    key={`row-${row.id}`}
                    isOpen={runningRecordingName === row.name}
                    currentLog={currentInterpretationLog}
                    abortRunHandler={abortRunHandler}
                  />
                )
              : null }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={rows ? rows.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
  </>
  );
}

interface CollapsibleRowProps {
  row: Data;
  handleDelete: () => void;
  isOpen: boolean;
  currentLog: string;
  abortRunHandler: () => void;
}
const CollapsibleRow = ({ row, handleDelete, isOpen, currentLog, abortRunHandler }: CollapsibleRowProps) => {
  const [open, setOpen] = useState(isOpen);
  const [rowData, setRowData] = useState<Data>(row);

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
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover role="checkbox" tabIndex={-1} key={rowData.id}>
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
          const value : any = rowData[column.id];
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
                      deleteRunFromStorage(rowData.name).then((result: boolean) => {
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
            <Box sx={{ margin: 1,
              background: '#19171c',
              overflowY: 'scroll',
              width: '800px',
              aspectRatio: '4/1',
              boxSizing: 'border-box',
            }}>
              <div>
                <Highlight className="javascript">
                  {isOpen ? currentLog : rowData.log}
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
