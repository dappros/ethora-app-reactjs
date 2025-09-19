import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Modal,
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
import { SiteLinks } from '../../../../models';

interface EnhancedTableProps {
  siteLinks: SiteLinks[];
  handleShowDeleteModal: (links: SiteLinks[]) => void;
}

export const LinksTable = ({
  siteLinks,
  handleShowDeleteModal,
}: EnhancedTableProps): ReactElement => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openMdModal, setOpenMdModal] = useState(false);
  const [currentMd, setCurrentMd] = useState<string>('');

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

  const handleOpenMd = (md: string) => {
    setCurrentMd(md);
    setOpenMdModal(true);
  };

  const handleCloseMd = () => {
    setOpenMdModal(false);
    setCurrentMd('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: 1,
        }}
      >
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
            display: 'block',
          }}
        >
          <Table
            size="medium"
            stickyHeader
            sx={{ minWidth: 650, tableLayout: 'fixed', width: '100%' }}
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 56 }}>
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

                <TableCell
                  sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  <div>Page Url</div>
                  <div>total: {siteLinks.length}</div>
                </TableCell>

                <TableCell
                  align="left"
                  sx={{ width: 120, whiteSpace: 'nowrap' }}
                >
                  <div>
                    <p>Size (Mb)</p>
                    <p>
                      total:{' '}
                      {(
                        siteLinks.reduce((sum, l) => sum + l.mdByteSize, 0) /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      Mb
                    </p>
                  </div>
                </TableCell>

                <TableCell align="center" sx={{ width: 100 }}>
                  Preview
                </TableCell>

                <TableCell align="right" sx={{ width: 72 }}>
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
                    <TableCell padding="checkbox" sx={{ width: 56 }}>
                      <Checkbox
                        checked={isItemSelected}
                        onClick={() => handleClick(globalIndex)}
                      />
                    </TableCell>

                    <TableCell
                      sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      <Typography variant="body2">
                        <a
                          className="text-blue-500"
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.url}
                        </a>
                      </Typography>
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{ width: 120, whiteSpace: 'nowrap' }}
                    >
                      {(link.mdByteSize / (1024 * 1024)).toFixed(2)}
                    </TableCell>

                    <TableCell align="center" sx={{ width: 100 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenMd(link.md)}
                      >
                        md
                      </Button>
                    </TableCell>

                    <TableCell sx={{ padding: '0 4px' }} />
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

      <Modal
        open={openMdModal}
        onClose={handleCloseMd}
        aria-labelledby="md-preview-title"
        aria-describedby="md-preview-content"
      >
        <Box
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #5f5f5f',
            boxShadow: 24,
            p: 4,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography id="md-preview-title" variant="h6" component="h2">
            Markdown Preview
          </Typography>
          <Typography
            id="md-preview-content"
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', mt: 2 }}
          >
            {currentMd}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};
