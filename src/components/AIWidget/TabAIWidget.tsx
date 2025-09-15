import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import {
  ReactElement,
  RefObject,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';
import { ModelAIbot } from '../../models';
import { TabAIWidgetCode } from './TabAIWidget/TabAIWidgetCode';
import { TabAIWidgetDocument } from './TabAIWidget/TabAIWidgetDocument';
import { TabAIWidgetPrompt } from './TabAIWidget/TabAIWidgetPrompt';
import { TabAIWidgetPromptWebsite } from './TabAIWidget/TabAIWidgetPromptWebsite';

interface TabAIWidgetProps {
  aiBot: ModelAIbot;
  value: string;
  copied?: boolean;
  scriptCode: string;
  appId?: string;
  userId?: string;
  url: string;
  ragRef: RefObject<HTMLDivElement>;
  setAiBot: (aiBot: ModelAIbot) => void;
  handleChange: (_: React.SyntheticEvent, newValue: string) => void;
  handleCopy: (text: string) => void;
  setUrl: (url: string) => void;
  handleSiteCrawl: (url: string) => void;
  setChoseUrl: (value: SetStateAction<string[]>) => void;
  setShowNewDocModal: (value: SetStateAction<boolean>) => void;
}

export const TabAIWidget = ({
  value,
  copied,
  scriptCode,
  appId,
  userId,
  aiBot,
  url,
  ragRef,
  setUrl,
  setAiBot,
  handleChange,
  handleCopy,
  handleSiteCrawl,
  setChoseUrl,
  setShowNewDocModal,
}: TabAIWidgetProps): ReactElement => {
  const [valueTabs, setValueTabs] = useState('1');

  const handleChangeTabs = (_: SyntheticEvent, newValue: string) => {
    setValueTabs(newValue);
  };

  return (
    <TabContext value={valueTabs}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={handleChangeTabs} aria-label="lab API tabs example">
          <Tab label="Code" value="1" />
          <Tab label="Prompt" value="2" />
          <Tab label="Add websites" value="3" />
          <Tab label="Add documents" value="4" />
        </TabList>
      </Box>
      <TabPanel value="1">
        <TabAIWidgetCode
          value={value}
          copied={copied}
          scriptCode={scriptCode}
          appId={appId}
          userId={userId}
          handleChange={handleChange}
          handleCopy={handleCopy}
        />
      </TabPanel>
      <TabPanel value="2">
        <TabAIWidgetPrompt aiBot={aiBot} setAiBot={setAiBot} />
      </TabPanel>
      <TabPanel value="3">
        <TabAIWidgetPromptWebsite
          ragRef={ragRef}
          aiBot={aiBot}
          url={url}
          setUrl={setUrl}
          handleSiteCrawl={handleSiteCrawl}
          setChoseUrl={setChoseUrl}
          setShowNewDocModal={setShowNewDocModal}
        />
      </TabPanel>
      <TabPanel value="4">
        <TabAIWidgetDocument ragRef={ragRef} />
      </TabPanel>
    </TabContext>
  );
};
