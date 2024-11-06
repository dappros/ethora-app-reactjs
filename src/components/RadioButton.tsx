import { Field, Label, Radio } from '@headlessui/react';

interface Props {
  label?: string;
  value: string | boolean;
  className?: string;
}

export function RadioButton({ value, label, className = '' }: Props) {
  return (
    <Field className={`inline-flex items-center cursor-pointer ${className}`}>
      <Radio
        value={value}
        className="group flex items-center justify-center bg-white rounded-full w-4 h-4 border border-brand-500"
      >
        <span className="invisible size-2 group-data-[checked]:visible bg-brand-500 rounded-full"></span>
      </Radio>
      {label && <Label className="cursor-pointer text-sm ml-2">{label}</Label>}
    </Field>
  );
}
