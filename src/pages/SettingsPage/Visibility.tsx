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
    <>
      <div className="subtitle1 mbc-16">Profile Visiblility</div>
      <RadioGroup
        value={isProfileOpen}
        onChange={(value) => {
          setIsProfileOpen(value);
        }}
        aria-label="Server size"
      >
        <RadioButton value={true} label="Open (default)" />
        <p className="caption">
          Your profile can be viewed by anyone who follows your profile link or
          QR code
        </p>
        <RadioButton value={false} label="Restricted" />
        {/* <Field className="radio-button">
          <Radio value={false} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Restricted</Label>
        </Field> */}
        <p className="caption mbc-32">
          Only users with your permission or temporary secure link can see your
          profile
        </p>
      </RadioGroup>
      <div className="subtitle1 mbc-16">Documents Visiblility</div>
      <RadioGroup
        value={isAssetsOpen}
        onChange={(value) => {
          setIsAssetsOpen(value);
        }}
        aria-label="Server size"
      >
        <RadioButton value={true} label="Full (default)" />
        <p className="caption">
          Show all Documents to those who can see your profile
        </p>
        <RadioButton value={false} label="Individual" />
        <p className="caption mbc-32">
          You need to share each document individually before others can see
          them
        </p>
      </RadioGroup>
    </>
  );
}
