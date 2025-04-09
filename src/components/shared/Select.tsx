import React, { useEffect, useRef, useState } from 'react';

interface Option {
  name: string;
  id: string;
}

interface SelectProps {
  options: Option[];
  placeholder: string;
  onSelect: (selected: { name: string; id: any }) => void;
  accentColor?: string;
  selectedValue?: Option;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  onSelect,
  accentColor = '#3b82f6',
  selectedValue,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<Option | null>(
    selectedValue || null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (): void => setIsOpen((prev) => !prev);

  const handleSelect = (option: Option): void => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOutsideClick = (event: MouseEvent): void => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const borderStyle = {
    borderColor: accentColor,
  };

  const iconStyle = {
    color: accentColor,
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`border rounded-md p-2.5 flex justify-between items-center cursor-pointer bg-white ${
          isOpen ? 'shadow-md' : ''
        } transition-shadow duration-300`}
        style={borderStyle}
        onClick={toggleDropdown}
      >
        {selected ? (
          <span>{selected.name}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span
          className={`ml-2.5 inline-block transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          style={iconStyle}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 border border-gray-300 bg-white max-h-48 overflow-y-auto mt-1 rounded-md shadow-md z-10">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full p-2.5 border-0 border-b border-gray-300 outline-none box-border"
          />

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className="p-2.5 cursor-pointer hover:bg-gray-100"
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="p-2.5">No options found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
