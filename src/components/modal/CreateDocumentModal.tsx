import { Dialog, DialogPanel } from '@headlessui/react';
import { useRef, useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { toast } from 'react-toastify';

import { postDocument } from '../../http';
import { IconPaperclip } from '../Icons/IconPaperclip';
import { Loading } from '../Loading';
import './CreateDocumentModal.scss';

interface Props {
  onClose: () => void;
  componentGetDocs: () => void;
}

export function CreateDocumentModal({ onClose, componentGetDocs }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [name, setName] = useState('');

  const onCreate = () => {
    if (file && name) {
      setLoading(true);
      postDocument(name, file)
        .then(() => {
          toast.success('Document created successfully');
          componentGetDocs();
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const onFileUpload = () => {
    const fileEl = inputRef.current;

    if (fileEl) {
      fileEl.click();
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let file = e.target.files[0];

      if (file) {
        setFile(file);
      }
    }
  };

  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={() => { }}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4">
        <div className="ont-varela text-[24px] text-center mb-8">New Document</div>
        <input
          type="text"
          value={name}
          placeholder='Document title'
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
        />
        <div className="flex flex-col items-center">
          <button className="hover:bg-gray-200 p-4 rounded-xl" onClick={onFileUpload}>
            <IconPaperclip />
          </button>
          {!file && (
            <div className="">No file chosen</div>
          )}
          {file && <div className="">{file.name}</div>}
          <input
            onChange={onChange}
            type="file"
            ref={inputRef}
            className="hidden"
          ></input>
        </div>

        <div className="flex gap-8 mt-8">
          <button className="w-full rounded-xl hover:bg-brand-hover border py-[12px] border-brand-500 text-brand-500" onClick={onClose}>
            Cancel
          </button>
          <button onClick={onCreate} className="w-full hover:bg-brand-darker py-[12px] rounded-xl bg-brand-500 text-white">
            Create
          </button>
        </div>
        <button className="absolute top-[36px] right-[36px]" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
      {loading && <Loading></Loading>}
    </Dialog>
  );
}
