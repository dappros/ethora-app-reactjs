import { Dialog, DialogPanel } from '@headlessui/react';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  Box,
  Button,
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
import { useTranslation } from '../../../../i18n/useTranslation';
import { SiteLinks } from '../../../../models';
import { MarkDown } from '../../../../utils/MarkDown';
import { IconClose } from '../../../Icons/IconClose';
import './LinksTable.scss';

interface EnhancedTableProps {
  siteLinks: SiteLinks[];
  handleShowDeleteModal: (links: SiteLinks[]) => void;
  handleCrawlReindex: (id: string) => void;
}

export const LinksTable = ({
  siteLinks,
  handleShowDeleteModal,
  handleCrawlReindex,
}: EnhancedTableProps): ReactElement => {
  const { t } = useTranslation();
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openMdModal, setOpenMdModal] = useState(false);
  const [currentMd, setCurrentMd] = useState<string>('');

  const visibleRows = useMemo(
    () =>
      siteLinks &&
      siteLinks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [siteLinks, page, rowsPerPage]
  );

  const selectedLinks = selectedIndexes.map((index) => siteLinks[index]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIndexes = siteLinks.map((_, idx) => idx);
      setSelectedIndexes(allIndexes);
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
          className="mobile-table-container"
          sx={{
            width: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'block',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          }}
        >
          <Table
            className="mobile-table"
            size="medium"
            stickyHeader
            sx={{ 
              minWidth: 800, 
              tableLayout: 'auto', 
              width: '100%'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 56 }}>
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selectedIndexes.length > 0 &&
                      selectedIndexes.length < siteLinks.length
                    }
                    checked={
                      siteLinks &&
                      siteLinks.length > 0 &&
                      selectedIndexes.length === siteLinks.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>

                <TableCell
                  sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  <div>{t('aiWidgetLinksTable.pageUrl')}</div>
                  <div>{t('aiWidgetLinksTable.totalLabel')} {siteLinks.length}</div>
                </TableCell>

                <TableCell
                  align="left"
                  sx={{ width: 120, whiteSpace: 'nowrap' }}
                >
                  <div>
                    <p>{t('aiWidgetLinksTable.sizeHeader')}</p>
                    <p>
                      {t('aiWidgetLinksTable.totalLabel')}{' '}
                      {(
                        siteLinks.reduce((sum, l) => sum + l.mdByteSize, 0) /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      {t('aiWidgetLinksTable.mbUnit')}
                    </p>
                  </div>
                </TableCell>

                <TableCell align="center" sx={{ width: 100 }}>
                  {t('aiWidgetLinksTable.preview')}
                </TableCell>

                <TableCell align="center" sx={{ width: 100 }}>
                  {t('aiWidgetLinksTable.reindex')}
                </TableCell>

                <TableCell align="right" sx={{ width: 72 }}>
                  {selectedIndexes.length > 0 && (
                    <Tooltip title={t('aiWidgetLinksTable.deleteChosenLinks')}>
                      <IconButton onClick={handleDeleteSelected}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows &&
                visibleRows.map((link, idxInPage) => {
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
                        className="url-cell"
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

                      <TableCell align="center" sx={{ width: 100 }}>
                        <IconButton onClick={() => handleCrawlReindex(link.id)}>
                          <RestoreIcon color="primary" />
                        </IconButton>
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

      <Dialog
        className="fixed inset-0 flex justify-center items-center bg-black/30 z-[9999]"
        open={openMdModal}
        onClose={handleCloseMd}
      >
        <DialogPanel className="p-6 bg-white rounded-2xl relative w-full max-w-[640px] m-4 max-h-[80%] flex flex-col">
          <div className="text-xl font-semibold text-center mb-4">
            {t('aiWidgetLinksTable.markdownPreview')}
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <Typography
              id="md-preview-content"
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {MarkDown(currentMd)}
            </Typography>
          </div>

          <button
            className="absolute top-[20px] right-[20px]"
            onClick={handleCloseMd}
          >
            <IconClose />
          </button>
        </DialogPanel>
      </Dialog>
    </Box>
  );
};
