import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateUser } from '../actions';
import { ProfilePageUserIcon } from '../components/ProfilePageUserIcon';
import { useAppStore } from '../store/useAppStore';
import './ProfilePageEdit.scss';

function base64ToFile(base64String: string, fileName: string) {
  const byteString = atob(base64String.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([uintArray], { type: 'image/jpeg' });
  return new File([blob], fileName, { type: 'image/jpeg' });
}

type Inputs = {
  firstName: string;
  lastName: string;
  description: string;
};

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<Inputs>();
  const profileImage_ = useAppStore((s) => s.currentUser?.profileImage);
  const [profileImage, setProfileImage] = useState(
    profileImage_ ? profileImage_ : ''
  );
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const fName = useAppStore((s) => s.currentUser?.firstName);
  const lName = useAppStore((s) => s.currentUser?.lastName);
  const descr = useAppStore((s) => s.currentUser?.description);

  if (!fName) {
    return null;
  }

  const onSubmit: SubmitHandler<Inputs> = ({
    firstName,
    lastName,
    description,
  }) => {
    let fd = new FormData();
    if (profileImage.startsWith('data:image/')) {
      let file = base64ToFile(profileImage, 'profileImage.jpg');
      fd.append('file', file);
    }

    fd.append('firstName', firstName);
    fd.append('lastName', lastName);
    fd.append('description', description);

    actionUpdateUser(fd)
      .then(({ profileImage }) => {
        setProfileImage(profileImage);
        toast.success('Profile updated successfully');
        navigate('/app/profile');
      })
      .catch((_) => {
        toast.error('Error happens while saving profile');
      });
  };

  const onSave = () => {
    if (submitBtnRef.current) {
      submitBtnRef.current.click();
    }
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Profile
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 h-full grid grid-rows-[72px,_1fr] overflow-hidden">
        <div className="flex justify-between items-center">
          <button
            className="w-full max-w-[128px] py-2 rounded-xl hover:bg-[#F3F6FC] text-brand-500"
            onClick={() => navigate('/app/profile')}
          >
            Cancel
          </button>
          <button className="w-full max-w-[128px] py-2 rounded-xl border text-brand-500 hover:bg-[#F3F6FC] border-brand-500" onClick={onSave}>
            Save
          </button>
        </div>
        <div className="">
          <ProfilePageUserIcon
            firstName={fName}
            lastName={lName as string}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            editMode
          />
          <div className="flex flex-col items-center mt-8">
            <form className="max-w-[768px] w-full" onSubmit={handleSubmit(onSubmit)} action="">
              <div>
                <div className="text-[#8C8C8C] text-[12px] font-sans ml-2">
                  First Name
                </div>
                <input
                  type="text"
                  className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                  placeholder="First Name"
                  {...register('firstName', { required: true, value: fName })}
                />
              </div>
              <div>
                <div className="text-[#8C8C8C] text-[12px] font-sans ml-2">
                  Last Name
                </div>
                <input
                  className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                  placeholder="Last Name"
                  type="text"
                  {...register('lastName', { required: true, value: lName })}
                />
              </div>

              <div>
                <div className="text-[#8C8C8C] text-[12px] font-sans ml-2">
                  About
                </div>
                <input
                  className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                  placeholder="About"
                  type="text"
                  {...register('description', { value: descr })}
                />
              </div>

              <button type="submit" ref={submitBtnRef}></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
