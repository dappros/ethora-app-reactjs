import { Field, Label, Radio, RadioGroup } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
      <div className="subtitle1 mb-16">Profile Visiblility</div>
      <RadioGroup
        value={isProfileOpen}
        onChange={(value) => {
          setIsProfileOpen(value);
        }}
        aria-label="Server size"
      >
        <Field className="radio-button">
          <Radio value={true} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Open (default)</Label>
        </Field>
        <p className="caption">
          Your profile can be viewed by anyone who follows your profile link or
          QR code
        </p>
        <Field className="radio-button">
          <Radio value={false} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Restricted</Label>
        </Field>
        <p className="caption mb-32">
          Only users with your permission or temporary secure link can see your
          profile
        </p>
      </RadioGroup>
      <div className="subtitle1 mb-16">Documents Visiblility</div>
      <RadioGroup
        value={isAssetsOpen}
        onChange={(value) => {
          setIsAssetsOpen(value);
        }}
        aria-label="Server size"
      >
        <Field className="radio-button">
          <Radio value={true} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Full (default)</Label>
        </Field>
        <p className="caption">
          Show all Documents to those who can see your profile
        </p>
        <Field className="radio-button">
          <Radio value={false} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Individual</Label>
        </Field>
        <p className="caption mb-32">
          You need to share each document individually before others can see
          them
        </p>
      </RadioGroup>
    </>
  );
}
