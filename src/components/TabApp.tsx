import { Tab } from "@headlessui/react";
import cn from "classnames";

interface Props {
  text: string
  last?: boolean
}

export default function TabApp({ text, last = false }: Props) {
  return (
    <div className={cn("md:mb-2", { "md:border-b  md:border-gray-200": !last })}>
      <Tab
        className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 md:py-3 whitespace-nowrap md:min-w-[115px] md:data-[selected]:border-b-0 md:rounded-xl md:mb-2 md:w-full md:px-4 md:text-left md:text-base md:hover:bg-gray-100 md:data-[selected]:bg-brand-100"
        key={text}
      >
        {text}
      </Tab>
    </div>
  )
}
