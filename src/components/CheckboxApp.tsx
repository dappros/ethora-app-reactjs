import { Checkbox, Field } from '@headlessui/react';
import { IconCheckbox } from './Icons/IconCheckbox';

interface Props {
  checked: boolean;
  onChange: (state: boolean) => void;
  disabled?: boolean;
}

export function CheckboxApp({ checked, onChange, disabled = false }: Props) {
  return (
    <Field className="flex items-center cursor-pointer">
      <Checkbox
        className="group data-[checked]:data-[disabled]:bg-gray-300 data-[disabled]:border-gray-300 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      >
        <IconCheckbox className="hidden group-data-[checked]:block" />
      </Checkbox>
    </Field>
  );
}
