import { Field, Label, Radio } from '@headlessui/react';

interface Props {
  label?: string;
  value: string | boolean;
  className?: string;
}

export function RadioButton({ value, label, className = '' }: Props) {
  return (
    <Field
      className={`grid grid-cols-[16px,_1fr] items-center cursor-pointer ${className}`}
    >
      <Radio
        value={value}
        className="group inline-flex items-center justify-center bg-white rounded-full basis-[16px] !w-[16px] !h-[16px] border border-brand-500"
      >
        <span className="invisible size-2 group-data-[checked]:visible bg-brand-500 rounded-full"></span>
      </Radio>
      {label && (
        <Label className="cursor-pointer inline-block text-sm ml-2">
          {label}
        </Label>
      )}
    </Field>
  );
}
