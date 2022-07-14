import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from "react";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { getStoredRuns } from "../../api/storage";
import { RunSettings } from "./RunSettings";
import { CollapsibleRow } from "./ColapsibleRow";

interface Column {
  id: 'status' | 'name' | 'startedAt' | 'finishedAt' | 'duration' | 'task' | 'delete';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export const columns: readonly Column[] = [
  { id: 'status', label: 'Status', minWidth: 80 },
  { id: 'name', label: 'Name', minWidth: 80 },
  { id: 'startedAt', label: 'Started at', minWidth: 80 },
  { id: 'finishedAt', label: 'Finished at', minWidth: 80 },
  { id: 'duration', label: 'Duration', minWidth: 80 },
  { id: 'task', label: 'Task', minWidth: 80 },
  { id: 'delete', label: 'Delete', minWidth: 80 },
];

export interface Data {
  id: number;
  status: string;
  name: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  task: string;
  log: string;
  interpreterSettings: RunSettings;
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
    <React.Fragment>
      <TableContainer component={Paper} sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader aria-label="sticky table" >
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
  </React.Fragment>
  );
}
