import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { ReactElement, useMemo, useState } from 'react';

interface EnhancedTableProps {
  siteLinks: string[];
  handleShowDeleteModal: (links: string[]) => void;
}

export const LinksTable = ({
  siteLinks,
  handleShowDeleteModal,
}: EnhancedTableProps): ReactElement => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const visibleRows = useMemo(
    () => siteLinks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [siteLinks, page, rowsPerPage]
  );

  const selectedLinks = selectedIndexes.map((index) => siteLinks[index]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allVisible = visibleRows.map((_, idx) => idx + page * rowsPerPage);
      setSelectedIndexes(allVisible);
    } else {
      setSelectedIndexes([]);
    }
  };

  const handleClick = (idx: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleDeleteSelected = () => {
    console.log('Delete links:', selectedLinks);
    handleShowDeleteModal(selectedLinks);
    setSelectedIndexes([]);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedIndexes.length > 0 &&
                      selectedIndexes.length < visibleRows.length
                    }
                    checked={
                      visibleRows.length > 0 &&
                      selectedIndexes.length === visibleRows.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="right">
                  {selectedIndexes.length > 0 && (
                    <Tooltip title="Delete chosen links">
                      <IconButton onClick={handleDeleteSelected}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((link, idxInPage) => {
                const globalIndex = page * rowsPerPage + idxInPage;
                const isItemSelected = selectedIndexes.includes(globalIndex);

                return (
                  <TableRow
                    hover
                    key={globalIndex}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={() => handleClick(globalIndex)}
                      />
                    </TableCell>
                    <TableCell colSpan={2}>
                      <Typography variant="body2">
                        <a
                          className="text-blue-500"
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link}
                        </a>
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={siteLinks.length}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};
