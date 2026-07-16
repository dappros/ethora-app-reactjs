import { Textarea } from '@headlessui/react';
import type { ChangeEvent } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelAIbot } from '../../../models';

interface TabAIWidgetPromptProps {
  aiBot: ModelAIbot;
  setAiBot: (aiBot: ModelAIbot) => void;
}

export const TabAIWidgetPrompt = ({
  aiBot,
  setAiBot,
}: TabAIWidgetPromptProps) => {
  const { t } = useTranslation();
  return (
    <div className="py-6 p-0 md:p-6">
      <div className="font-semibold font-sans text-[16px] py-4 pb-4">
        {t('aiWidgetPrompt.title')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('aiWidgetPrompt.description')}
      </p>
      <Textarea
        className="rounded-xl border outline-none w-full p-2 h-[196px] text-gray-500 border-gray-500 mb-8"
        placeholder={t('aiWidgetPrompt.placeholder')}
        value={aiBot.prompt}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setAiBot({ ...aiBot, prompt: e.target.value })
        }
      />
    </div>
  );
};
