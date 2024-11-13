import { Checkbox, Field, Label } from '@headlessui/react';

export function CheckboxCustom() {
  return (
    <Field className="checkbox  mb-6">
      <Checkbox
        className="checkbox-input"
        checked={availableMenuItems.profile}
        onChange={(isOn) => onChange(isOn, 'profile')}
      ></Checkbox>
      <Label className="label">Profile / Wallet</Label>
    </Field>
  );
}
