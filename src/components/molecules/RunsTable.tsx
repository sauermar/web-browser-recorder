import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useEffect } from "react";
import { IconButton } from "@mui/material";
import {  DeleteForever } from "@mui/icons-material";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { deleteRunFromStorage, getStoredRuns } from "../../api/storage";

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
}

export const RunsTable = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Data[]>([]);

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

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
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
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        // @ts-ignore
                        const value : any = row[column.id];
                        if (value !== undefined) {
                          if(column.id === 'status') {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <button onClick={() => {
                                  const r = rows;
                                  r.splice(row.id + 1, 0, {
                                    id: -1,
                                    status: 'TEST',
                                    name: 'test',
                                    startedAt: '',
                                    finishedAt: '',
                                    duration: '',
                                    task: '',
                                  });
                                  console.log(r)
                                  setRows(r);
                                }}>
                                  {value}
                                </button>
                              </TableCell>
                            );
                          }
                          else {
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {value}
                              </TableCell>
                            );
                          }
                        } else {
                          switch (column.id) {
                            case 'delete':
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  <IconButton aria-label="add" size= "small" onClick={() => {
                                    deleteRunFromStorage(row.name).then((result: boolean) => {
                                      if (result) {
                                        setRows([]);
                                        notify('success', 'Run deleted successfully');
                                        fetchRuns();
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
                  );
                })
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
    </Paper>
  );
}
