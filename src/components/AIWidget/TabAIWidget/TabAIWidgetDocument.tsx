import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { IconButton } from '@mui/material';
import { ReactElement, RefObject, useState, useRef, useMemo, useEffect } from 'react';
import { Rag } from '../Rag';
import { setSourcesSiteFiles, setSourcesSiteFilesDelete } from '../../../http';
import { useParams } from 'react-router-dom';
import { Files } from '../../../models';

interface TabAIWidgetDocumentProps {
  arrayFiles: Files[];
  ragRef: RefObject<HTMLDivElement>;
}

export const TabAIWidgetDocument = ({
  ragRef,
  arrayFiles,
}: TabAIWidgetDocumentProps): ReactElement => {
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
    try {
      await setSourcesSiteFilesDelete(appId as string, fileId);
      
      setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));
      
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      
      setInitialFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Error removing file', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="py-6 p-0 md:p-6">
      <div className="font-semibold font-sans text-[16px] pb-4 pt-10">
        <span> Upload documents (</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>RAG feature</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
        <span className="text-xs text-gray-600 ml-2 p-2 border rounded-sm">
          Available in paid plans
        </span>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        Drag & Drop your documents here for the system to ingest data from
        there. Supported formats: TXT, CSV, JSON, DOC, PDF.
      </p>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <IconButton onClick={handleIconButtonClick}>
            <FileUploadOutlinedIcon className="h-8 w-8 text-gray-400" />
          </IconButton>
          <p className="pt-2 text-sm text-gray-500">Drag & Drop or click to select files</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.csv,.json,.doc,.docx,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {allFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm mb-3">Files:</h3>
          <div className="space-y-2">
            {allFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.file 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <InsertDriveFileIcon className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.mdByteSize)}
                      {file.createdAt && !file.file && ` • ${new Date(file.createdAt).toLocaleDateString()}`}
                      {file.file && ' • Waiting for upload'}
                    </p>
                  </div>
                </div>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(file.id)}
                  className="flex-shrink-0"
                >
                  <DeleteOutlineIcon fontSize="small" className="text-red-500" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      )}

      {localFiles.length > 0 && (
        <button 
          onClick={handleSetFiles}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Upload files
        </button>
      )}

      <Rag ragRef={ragRef} />
    </div>
  );
};
