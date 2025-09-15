import { Dialog, DialogPanel } from '@headlessui/react';
import { IconClose } from '../Icons/IconClose';

import './CreateDocumentModal.scss';

interface Props {
  urls: string[];
  onClose: () => void;
  deleteSiteCrawl: (url: string[]) => void;
}

export function SourcesSiteCrawlModal({
  urls,
  onClose,
  deleteSiteCrawl,
}: Props) {
  return (
    <Dialog
      className="fixed inset-0 flex justify-center items-center bg-black/30"
      open={true}
      onClose={onClose}
    >
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4">
        <div className="ont-varela text-[24px] text-center mb-8">
          Delete Site Crawl
        </div>

        <div className="flex flex-col items-center">
          <div className="max-h-48 overflow-y-auto w-full px-4">
            <span className="block mb-2 font-medium text-center">Delete:</span>
            {urls &&
              urls.map((url) => (
                <p key={url} className="text-sm break-all">
                  {url}
                </p>
              ))}
          </div>
        </div>

        <div className="flex gap-8 mt-8">
          <button
            className="w-full rounded-xl hover:bg-brand-hover border py-[12px] border-brand-500 text-brand-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteSiteCrawl(urls);
              onClose();
            }}
            className="w-full hover:bg-red-700 py-[12px] rounded-xl bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
        <button
          className="absolute top-[36px] right-[36px]"
          onClick={() => onClose()}
        >
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
