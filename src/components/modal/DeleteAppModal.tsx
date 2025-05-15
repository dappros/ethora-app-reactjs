import { Dialog, DialogPanel } from '@headlessui/react';
import { FC } from 'react';
import { IconClose } from '../Icons/IconClose';

interface DeleteAppModalProps {
  appName: string;
  show: boolean;
  onClose: () => void;
  handleDelete: () => void;
}

const DeleteAppModal: FC<DeleteAppModalProps> = ({
  onClose,
  show,
  handleDelete,
  appName,
}) => {
  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={() => onClose()}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-[20px] bg-white rounded-3xl w-full max-w-[690px] m-8 relative">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={() => onClose()}
        >
          <IconClose />
        </button>

        <div className="font-varela text-[18px] md:text-[20px] text-center mt-4 my-10">
          {`Are you sure? This irreversibly deletes ${appName} and all of its contents`}
        </div>

        <div className="flex gap-4">
          <button
            className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="w-full py-3 hover:bg-red-300 p-2 border bg-red-400 border-red-800 rounded-xl text-white"
            type="submit"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeleteAppModal;
