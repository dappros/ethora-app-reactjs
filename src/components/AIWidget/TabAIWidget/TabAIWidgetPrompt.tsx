import { Textarea } from '@headlessui/react';
import { ModelAIbot } from '../../../models';

interface TabAIWidgetPromptProps {
  aiBot: ModelAIbot;
  setAiBot: (aiBot: ModelAIbot) => void;
}

export const TabAIWidgetPrompt = ({
  aiBot,
  setAiBot,
}: TabAIWidgetPromptProps) => {
  return (
    <>
      <div className="font-semibold font-sans text-[16px] pt-8 pb-4">
        Prompt
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use to provide instructions on how the bot should behave. You may also
        copy&paste limited data on your specific business context the bot should
        be aware of.
      </p>
      <Textarea
        className="rounded-xl border outline-none w-full p-2 h-[196px] text-gray-500 border-gray-500 mb-8"
        placeholder="Enter prompt instructions here..."
        value={aiBot.prompt}
        onChange={(e) => setAiBot({ ...aiBot, prompt: e.target.value })}
      />
    </>
  );
};
