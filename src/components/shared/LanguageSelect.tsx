import React from 'react';
import { Iso639_1Codes } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import Select from './Select';

interface LanguageOption {
  name: string;
  id: Iso639_1Codes;
}

interface LanguageSelectProps {
  config?: {
    colors?: {
      primary?: string;
    };
  };
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ config }) => {
  const doSetLangSource = useAppStore((s) => s.doSetLangSource);

  const langSource = 'en';
  const languageOptions: LanguageOption[] = [
    { name: 'English', id: 'en' },
    { name: 'Spanish', id: 'es' },
    { name: 'Portuguese', id: 'pt' },
    { name: 'Haitian Creole', id: 'ht' },
    { name: 'Chinese', id: 'zh' },
  ];

  const handleSelect = (selected: { name: string; id: Iso639_1Codes }) => {
    doSetLangSource(selected.id);
  };

  const findLanguage = (): LanguageOption | undefined => {
    if (langSource)
      return languageOptions.find((lang) => lang.id === langSource);
    else return undefined;
  };

  return (
    <Select
      options={languageOptions}
      placeholder={'Select your language'}
      onSelect={handleSelect}
      accentColor={config?.colors?.primary}
      selectedValue={findLanguage()}
    />
  );
};

export default LanguageSelect;
