import { Field, Label, Radio, RadioGroup } from '@headlessui/react';

export function Visibility() {
  return (
    <>
      <div className="subtitle1 mb-16">Profile Visiblility</div>
      <RadioGroup value={''} onChange={() => {}} aria-label="Server size">
        <Field className="radio-button">
          <Radio value={'profile'} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Open (default)</Label>
        </Field>
        <p className="caption">
          Your profile can be viewed by anyone who follows your profile link or
          QR code
        </p>
        <Field className="radio-button">
          <Radio value={'chats'} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Restricted</Label>
        </Field>
        <p className="caption mb-32">
          Only users with your permission or temporary secure link can see your
          profile
        </p>
      </RadioGroup>
      <div className="subtitle1 mb-16">Documents Visiblility</div>
      <RadioGroup value={''} onChange={() => {}} aria-label="Server size">
        <Field className="radio-button">
          <Radio value={'profile'} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Full (default)</Label>
        </Field>
        <p className="caption">
          Show all Documents to those who can see your profile
        </p>
        <Field className="radio-button">
          <Radio value={'chats'} className="radio-button-input"></Radio>
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
