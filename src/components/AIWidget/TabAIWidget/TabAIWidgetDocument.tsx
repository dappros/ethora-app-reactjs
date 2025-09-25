import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import { ReactElement, RefObject } from 'react';
import { Rag } from '../Rag';

interface TabAIWidgetDocumentProps {
  ragRef: RefObject<HTMLDivElement>;
}

export const TabAIWidgetDocument = ({
  ragRef,
}: TabAIWidgetDocumentProps): ReactElement => {
  return (
    <>
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <IconButton disabled>
            <FileUploadOutlinedIcon className="h-8 w-8 text-gray-400 mb-2" />
          </IconButton>
          {/* <Upload className="h-8 w-8 text-gray-400 mb-2" /> */}
          <p className="text-sm text-gray-500">Drag & Drop</p>
        </div>
      </div>

      <Rag ragRef={ragRef} />
    </>
  );
};
