import { Tab, TabList } from '@headlessui/react';

interface Props {
  items: Array<string>;
}

export function TablistSettings({ items }: Props) {
  return (
    <TabList className="hide-scroll mb-4 md:mb-0 flex border-b border-gray-200 overflow-auto md:flex-col md:px-4 md:border-r md:border-gray-200 min-w-40 w-full md:max-w-[276px]">
      {items.map((key) => {
        return (
          <div key={key} className="md:border-b md:mb-2 md:border-gray-200">
            <Tab
              className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 md:py-3 whitespace-nowrap md:min-w-[115px] md:data-[selected]:border-b-0 md:rounded-xl md:mb-2 md:w-full md:px-4 md:text-left md:text-base md:hover:bg-gray-100 md:data-[selected]:bg-brand-100 "
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
