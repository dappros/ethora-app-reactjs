import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { IconButton, Box, Typography } from '@mui/material';
import { ReactElement, RefObject, useState, useRef, useMemo, useEffect } from 'react';
import { Rag } from '../Rag';
import { setSourcesSiteFiles, setSourcesSiteFilesDelete } from '../../../http';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../../i18n/useTranslation';
import { Files } from '../../../models';

interface TabAIWidgetDocumentProps {
  arrayFiles: Files[];
  ragRef: RefObject<HTMLDivElement>;
}

export const TabAIWidgetDocument = ({
  ragRef,
  arrayFiles,
}: TabAIWidgetDocumentProps): ReactElement => {
  const { t } = useTranslation();
  const { appId } = useParams();
  const [localFiles, setLocalFiles] = useState<Files[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Files[]>([]);
  const [initialFiles, setInitialFiles] = useState<Files[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isInitializedRef.current && arrayFiles) {
      setInitialFiles(arrayFiles || []);
      isInitializedRef.current = true;
    }
  }, [arrayFiles]);

  const allFiles: Files[] = useMemo(() => {
    return [...initialFiles, ...uploadedFiles, ...localFiles];
  }, [initialFiles, uploadedFiles, localFiles]);

  const handleSetFiles = async () => {
    const filesToUpload = localFiles.filter((f) => f.file);
    
    if (filesToUpload.length === 0) {
      console.warn('No files to upload');
      return;
    }
    
    try {
      const fileObjects = filesToUpload.map((f) => f.file!);
      const { data } = await setSourcesSiteFiles(appId as string, fileObjects);
      
      const uploadedIds = filesToUpload.map(f => f.id);
      setLocalFiles((prev) => prev.filter((f) => !uploadedIds.includes(f.id)));
      
      setUploadedFiles((prev) => [...prev, ...data.result]);
    } catch (error) {
      console.error('Error setting files', error);
    }
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: Files[] = Array.from(selectedFiles).map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      md: '',
      mdByteSize: file.size,
      url: file.name,
      file: file,
    }));

    setLocalFiles((prev) => [...prev, ...newFiles]);
  };

  const handleIconButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleRemoveFile = async (fileId: string) => {
    const isLocalFile = localFiles.some((f) => f.id === fileId && f.file);
    
    if (isLocalFile) {
      setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));
      return;
    }
    
    try {
      await setSourcesSiteFilesDelete(appId as string, fileId);
      
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      setInitialFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Error removing file', error);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <PictureAsPdfIcon sx={{ fontSize: 48, color: '#ef4444' }} />;
    }
    return <DescriptionIcon sx={{ fontSize: 48, color: '#6b7280' }} />;
  };

  const getFileName = (url: string): string => {
    return url.split('/').pop() || url;
  };

  return (
    <div className="py-6 p-0 md:p-6">
      <div className="font-semibold font-sans text-[16px] pb-4 pt-10">
        <span>{t('aiWidgetDocuments.title')}</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>{t('aiWidgetDocuments.ragFeature')}</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
        <span className="text-xs text-gray-600 ml-2 p-2 border rounded-sm">
          {t('aiWidgetDocuments.paidPlansOnly')}
        </span>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        {t('aiWidgetDocuments.description')}
      </p>

      <div className="flex flex-wrap gap-4">
        {allFiles.map((file) => (
          <Box
            key={file.id}
            sx={{
              position: 'relative',
              width: 130,
              height: 130,
              border: '2px dashed',
              borderColor: file.file ? '#fbbf24' : '#d1d5db',
              borderRadius: 2,
              backgroundColor: file.file ? '#fef3c7' : '#f9fafb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 1,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#eff6ff',
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(file.id);
              }}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 24,
                height: 24,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {getFileIcon(getFileName(file.url))}
            </Box>

            <Typography
              variant="caption"
              sx={{
                width: '100%',
                textAlign: 'center',
                paddingX: 1,
                paddingBottom: 1,
                fontSize: '0.7rem',
                fontWeight: 500,
                color: '#374151',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={getFileName(file.url)}
            >
              {getFileName(file.url)}
            </Typography>
          </Box>
        ))}

        <Box
          onClick={handleIconButtonClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            width: allFiles.length === 0 ? '100%' : 130,
            height: allFiles.length === 0 ? 160 : 130,
            border: '2px dashed',
            borderColor: isDragging ? '#3b82f6' : '#d1d5db',
            borderRadius: 2,
            backgroundColor: isDragging ? '#eff6ff' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#3b82f6',
              backgroundColor: '#eff6ff',
            },
          }}
        >
          <FileUploadOutlinedIcon
            sx={{
              fontSize: 48,
              color: isDragging ? '#3b82f6' : '#9ca3af',
              marginBottom: 1,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              color: '#6b7280',
              textAlign: 'center',
              paddingX: 1,
            }}
          >
            {t('aiWidgetDocuments.dropzoneHint')}
          </Typography>
        </Box>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.csv,.json,.doc,.docx,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {localFiles.length > 0 && (
        <button 
          onClick={handleSetFiles}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('aiWidgetDocuments.uploadButton')}
        </button>
      )}

      <Rag ragRef={ragRef} />
    </div>
  );
};
