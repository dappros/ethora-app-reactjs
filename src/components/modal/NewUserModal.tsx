import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { IconClose } from '../Icons/IconClose';

import { SubmitHandler, useForm } from 'react-hook-form';
import { Loading } from '../Loading';
import { TextInput } from '../ui/TextInput';
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
    <Dialog className="new-user-modal" open={true} onClose={() => {}}>
      <DialogPanel className="inner">
        <div className="title">Add New User</div>
        <form onSubmit={handleSubmit(onSubmit)} action="">
          <div className="form">
            <TextInput
              className="gen-input gen-input-large mb-24 fname"
              placeholder="First Name"
              {...register('firstName', { required: true })}
            />
            <TextInput
              className="gen-input gen-input-large mb-24 lname"
              placeholder="Last Name"
              {...register('lastName', { required: true })}
            />
            <div className="email">
              <TextInput
                className="gen-input gen-input-large mb-24"
                placeholder="Email"
                type="email"
                {...register('email', { required: true })}
              />
            </div>
          </div>
          <div className="buttons">
            <button className="gen-secondary-btn mb-16" onClick={onClose}>
              Cancel
            </button>
            <button onClick={() => {}} className={cn('gen-primary-btn mb-16')}>
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
