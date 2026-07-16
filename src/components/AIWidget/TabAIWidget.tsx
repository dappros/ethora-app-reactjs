import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import {
  ReactElement,
  RefObject,
  SetStateAction,
  SyntheticEvent,
  useState,
} from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAIbot, ModelApp, SiteLinks } from '../../models';
import { TabAIWidgetCode } from './TabAIWidget/TabAIWidgetCode';
import { TabAIWidgetDocument } from './TabAIWidget/TabAIWidgetDocument';
import { TabAIWidgetPrompt } from './TabAIWidget/TabAIWidgetPrompt';
import { TabAIWidgetPromptWebsite } from './TabAIWidget/TabAIWidgetPromptWebsite';

interface TabAIWidgetProps {
  aiBot: ModelAIbot;
  value: string;
  appId?: string;
  app?: ModelApp;
  userId?: string;
  url: string;
  ragRef: RefObject<HTMLDivElement>;
  loadingTextCrawl?: boolean;
  setAiBot: (aiBot: ModelAIbot) => void;
  handleChange: (_: React.SyntheticEvent, newValue: string) => void;
  setUrl: (url: string) => void;
  handleSiteCrawl: (url: string, followLink: boolean) => void;
  setChoseUrl: (value: SetStateAction<SiteLinks[]>) => void;
  setShowNewDocModal: (value: SetStateAction<boolean>) => void;
  handleCrawlReindex: (id: string) => void;
}

export const TabAIWidget = ({
  value,
  appId,
  app,
  userId,
  aiBot,
  url,
  ragRef,
  setUrl,
  setAiBot,
  handleChange,
  handleSiteCrawl,
  setChoseUrl,
  setShowNewDocModal,
  loadingTextCrawl,
  handleCrawlReindex,
}: TabAIWidgetProps): ReactElement => {
  const { t } = useTranslation();
  const [valueTabs, setValueTabs] = useState('1');

  const handleChangeTabs = (_: SyntheticEvent, newValue: string) => {
    setValueTabs(newValue);
  };

  return (
    <TabContext value={valueTabs}>
      <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
        <TabList
          onChange={handleChangeTabs}
          aria-label="lab API tabs example"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minWidth: 'fit-content',
            '& .MuiTab-root': {
              minWidth: 'auto',
              padding: '12px 16px',
            }
          }}
        >
          <Tab label={t('aiWidgetTabs.code')} value="1" />
          <Tab label={t('aiWidgetTabs.prompt')} value="2" />
          <Tab label={t('aiWidgetTabs.addWebsites')} value="3" />
          <Tab label={t('aiWidgetTabs.addDocuments')} value="4" />
        </TabList>
      </Box>
      <TabPanel value="1" sx={{ p: 0 }}>
        <TabAIWidgetCode
          value={value}
          appId={appId}
          app={app}
          userId={userId}
          handleChange={handleChange}
        />
      </TabPanel>
      <TabPanel value="2" sx={{ p: 0 }}>
        <TabAIWidgetPrompt aiBot={aiBot} setAiBot={setAiBot} />
      </TabPanel>
      <TabPanel value="3" sx={{ p: 0 }}>
        <TabAIWidgetPromptWebsite
          ragRef={ragRef}
          aiBot={aiBot}
          url={url}
          setUrl={setUrl}
          handleSiteCrawl={handleSiteCrawl}
          setChoseUrl={setChoseUrl}
          setShowNewDocModal={setShowNewDocModal}
          loadingTextCrawl={loadingTextCrawl}
          handleCrawlReindex={handleCrawlReindex}
        />
      </TabPanel>
      <TabPanel value="4" sx={{ p: 0 }}>
        <TabAIWidgetDocument ragRef={ragRef} arrayFiles={aiBot.files} />
      </TabPanel>
      </div>
    </TabContext>
  );
};
