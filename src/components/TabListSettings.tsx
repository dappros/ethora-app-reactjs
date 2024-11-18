import { Tab, TabList } from '@headlessui/react';

interface Props {
  items: Array<string>;
}

export function TablistSettings({ items }: Props) {
  return (
    <TabList className="hide-scroll mb-4 lg:mb-0 flex border-b border-gray-200 lg:border-b-0 overflow-auto lg:flex-col lg:pr-4 lg:border-r lg:border-gray-200 lg:w-[308px]">
      {items.map((key) => {
        return (
          <div key={key} className="lg:border-b lg:mb-2 lg:border-gray-200">
            <Tab
              className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 lg:py-3 whitespace-nowrap lg:min-w-[115px] lg:data-[selected]:border-b-0 lg:rounded-xl lg:mb-2 lg:w-full lg:px-4 lg:text-left lg:text-base lg:hover:bg-gray-100 lg:data-[selected]:bg-brand-100"
              key={key}
            >
              {key}
            </Tab>
          </div>
        );
      })}
    </TabList>
  );
}
