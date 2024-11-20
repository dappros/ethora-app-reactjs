import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { IconClose } from '../Icons/IconClose';

import { SubmitHandler, useForm } from 'react-hook-form';
import { Loading } from '../Loading';
import './NewUserModal.scss';

interface Props {
  onClose: () => void;
  onSubmit: SubmitHandler<Inputs>;
  loading: boolean;
}

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
};

export function NewUserModal({ onClose, onSubmit, loading }: Props) {
  const { register, handleSubmit } = useForm<Inputs>();
  return (
    <Dialog className="new-user-modal" open={true} onClose={() => { }}>
      <DialogPanel className="inner">
        <div className="title">Add New User</div>
        <form onSubmit={handleSubmit(onSubmit)} action="">
          <div className="form">
            <input type="text"
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              placeholder="First Name"
              {...register('firstName', { required: true })}
            />
            <input type="text"
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              placeholder="Last Name"
              {...register('lastName', { required: true })}
            />

            <div className="email">
              <input
                type="text"
                className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
                placeholder="Email"
                {...register('email', { required: true })}
              />
            </div>
          </div>
          <div className="buttons">
            <button className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500" onClick={onClose}>
              Cancel
            </button>
            <button onClick={() => { }} className="w-full py-[12px] rounded-xl bg-brand-500 text-white">
              Continue
            </button>
          </div>
        </form>

        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
      {loading && <Loading></Loading>}
    </Dialog>
  );
}
