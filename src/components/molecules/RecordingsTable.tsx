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
import { WorkflowFile } from "@wbr-project/wbr-interpret";
import { IconButton } from "@mui/material";
import { Assignment, DeleteForever, Edit, PlayCircle } from "@mui/icons-material";
import { useGlobalInfoStore } from "../../context/globalInfo";
import { deleteRecordingFromStorage, getStoredRecordings } from "../../api/storage";

interface Column {
  id: 'interpret' | 'name' | 'create_date' | 'edit' | 'task' | 'pairs' | 'update_date'| 'delete';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

const columns: readonly Column[] = [
  { id: 'interpret', label: 'Run', minWidth: 80 },
  { id: 'name', label: 'Name', minWidth: 80 },
  {
    id: 'create_date',
    label: 'Created at',
    minWidth: 80,
    //format: (value: string) => value.toLocaleString('en-US'),
  },
  {
    id: 'edit',
    label: 'Edit',
    minWidth: 80,
  },
  {
    id: 'task',
    label: 'Run task',
    minWidth: 80,
  },
  {
    id: 'pairs',
    label: 'Pairs',
    minWidth: 80,
  },
  {
    id: 'update_date',
    label: 'Updated at',
    minWidth: 80,
    //format: (value: string) => value.toLocaleString('en-US'),
  },
  {
    id: 'delete',
    label: 'Delete',
    minWidth: 80,
  },
];

interface Data {
  id: number;
  name: string;
  create_date: string;
  pairs: number;
  update_date: string;
  content: WorkflowFile;
  params: string[];
}

interface RecordingsTableProps {
  handleEditRecording: (fileName:string) => void;
  handleRunRecording: (fileName:string, params: string[]) => void;
}

export const RecordingsTable = ({ handleEditRecording, handleRunRecording }: RecordingsTableProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Data[]>([]);

  const { notify, setRecordings } = useGlobalInfoStore();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchRecordings = async () => {
    const recordings = await getStoredRecordings();
    if (recordings) {
      const parsedRows: Data[] = [];
      recordings.map((recording, index) => {
        const parsedRecording = JSON.parse(recording);
        if (parsedRecording.recording_meta) {
          parsedRows.push({
            id: index,
            ...parsedRecording.recording_meta,
            content: parsedRecording.recording
          });
        }
      });
      setRecordings(parsedRows.map((recording) => recording.name));
      setRows(parsedRows);
    } else {
      console.log('No recordings found.');
    }
  }

  useEffect( () => {
    if (rows.length === 0) {
      fetchRecordings();
    }

  }, []);

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
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {value}
                          </TableCell>
                        );
                      } else {
                        switch (column.id) {
                          case 'interpret':
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <InterpretButton handleInterpret={() => handleRunRecording(row.name, row.params || [])}/>
                              </TableCell>
                            );
                          case 'edit':
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <IconButton aria-label="add" size= "small" onClick={() => {
                                  handleEditRecording(row.name);
                                }} sx={{'&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}>
                                  <Edit/>
                                </IconButton>
                              </TableCell>
                            );
                          case 'task':
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <CreateTaskButton disabled={row.params?.length === 0 || true}/>
                              </TableCell>
                            );
                          case 'delete':
                            return (
                              <TableCell key={column.id} align={column.align}>
                                <IconButton aria-label="add" size= "small" onClick={() => {
                                  deleteRecordingFromStorage(row.name).then((result: boolean) => {
                                    if (result) {
                                      setRows([]);
                                      notify('success', 'Recording deleted successfully');
                                      fetchRecordings();
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

interface InterpretButtonProps {
  handleInterpret: () => void;
}

const InterpretButton = ( {handleInterpret}:InterpretButtonProps) => {
  return (
    <IconButton aria-label="add" size= "small" onClick={() => {
      handleInterpret();
    }}
                sx={{'&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}>
      <PlayCircle/>
    </IconButton>
  )
}

interface CreateTaskButtonProps {
  disabled?: boolean
}

const CreateTaskButton = ({ disabled }: CreateTaskButtonProps) => {
  return (
    <IconButton aria-label="add" disabled={disabled} size= "small" onClick={() => console.log('button clicked')}
                sx={{'&:hover': { color: '#1976d2', backgroundColor: 'transparent' }}}>
      <Assignment/>
    </IconButton>
  )
}
