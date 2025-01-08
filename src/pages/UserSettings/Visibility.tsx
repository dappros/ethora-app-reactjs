import { RadioGroup } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RadioButton } from '../../components/RadioButton';
import { updateMe } from '../../http';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';

export function Visibility() {
  const currentUser = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const doUpdateUser = useAppStore((s) => s.doUpdateUser);
  const [isProfileOpen, setIsProfileOpen] = useState(currentUser.isProfileOpen);
  const [isAssetsOpen, setIsAssetsOpen] = useState(currentUser.isAssetsOpen);

  useEffect(() => {
    if (isProfileOpen !== currentUser.isProfileOpen) {
      updateMe({ isProfileOpen })
        .then(({ data }) => {
          doUpdateUser(data.user);
          toast.success('Saved');
        })
        .catch(() => {
          toast.error('Error');
        });
    }
  }, [isProfileOpen]);

  useEffect(() => {
    if (isAssetsOpen !== currentUser.isAssetsOpen) {
      updateMe({ isAssetsOpen })
        .then(({ data }) => {
          doUpdateUser(data.user);
          toast.success('Saved');
        })
        .catch(() => toast.error('Error'));
    }
  }, [isAssetsOpen]);

  return (
    <div className="md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-4">Profile Visiblility</div>
      <RadioGroup
        value={isProfileOpen}
        onChange={(value) => {
          setIsProfileOpen(value);
        }}
        aria-label="Server size"
        className="mb-8"
      >
        <RadioButton value={true} label="Open (default)" className="mb-2" />
        <p className="font-sans text-[12px] text-[#8C8C8C] mb-4">
          Your profile can be viewed by anyone who follows your profile link or
          QR code
        </p>
        <RadioButton value={false} label="Restricted" className="mb-2" />
        <p className="font-sans text-[12px] text-[#8C8C8C]">
          Only users with your permission or temporary secure link can see your
          profile
        </p>
      </RadioGroup>
      <div className="font-sans font-semibold text-[16px] mb-4">Documents Visiblility</div>
      <RadioGroup
        value={isAssetsOpen}
        onChange={(value) => {
          setIsAssetsOpen(value);
        }}
        aria-label="Server size"
      >
        <RadioButton value={true} label="Full (default)" className="mb-2" />
        <p className="font-sans text-[12px] text-[#8C8C8C] mb-4">
          Show all Documents to those who can see your profile
        </p>
        <RadioButton value={false} label="Individual" className="mb-2" />
        <p className="font-sans text-[12px] text-[#8C8C8C]">
          You need to share each document individually before others can see
          them
        </p>
      </RadioGroup>
    </div>
  );
}
