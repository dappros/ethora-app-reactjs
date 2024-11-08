import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateUser } from '../actions';
import { ProfilePageUserIcon } from '../components/ProfilePageUserIcon';
import { TextInput } from '../components/ui/TextInput';
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

export function ProfilePageEdit() {
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
    <>
      <div className="app-content-header">
        <div className="app-content-header-title">Profile</div>
      </div>
      {/* .app-content-body */}
      <div className="bg-white rounded-2xl md:ml-[96px] p-4 w-full md:w-[calc(100vw-166px)]">
        <div className="profile-page-edit">
          <div className="profile-top">
            <button
              className="gen-tertiary-btn"
              onClick={() => navigate('/app/profile')}
            >
              Cancel
            </button>
            <div>
              <button className="gen-secondary-btn medium" onClick={onSave}>
                Save
              </button>
            </div>
          </div>
          <ProfilePageUserIcon
            firstName={fName}
            lastName={lName as string}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            editMode
          />
          <div className="form">
            <form onSubmit={handleSubmit(onSubmit)} action="">
              <TextInput
                className="gen-input gen-input-large mb-8"
                placeholder="First Name"
                type="text"
                {...register('firstName', { required: true, value: fName })}
              />
              <TextInput
                className="gen-input gen-input-large mb-8"
                placeholder="Last Name"
                type="text"
                {...register('lastName', { required: true, value: lName })}
              />
              <TextInput
                className="gen-input gen-input-large mb-8"
                placeholder="About"
                type="text"
                {...register('description', { value: descr })}
              />
              <button type="submit" ref={submitBtnRef}></button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
