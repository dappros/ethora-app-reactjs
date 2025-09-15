import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, IconButton } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, RefObject, SetStateAction } from 'react';
import { ModelAIbot } from '../../../models';
import { LinksTable } from './TabAIWidgetPromptWebsite/LinksTable';

interface TabAIWidgetPromptWebsiteProps {
  ragRef: RefObject<HTMLDivElement>;
  aiBot: ModelAIbot;
  url: string;
  setUrl: (url: string) => void;
  handleSiteCrawl: (url: string) => void;
  setChoseUrl: (value: SetStateAction<string[]>) => void;
  setShowNewDocModal: (value: SetStateAction<boolean>) => void;
}

export const TabAIWidgetPromptWebsite = ({
  ragRef,
  aiBot,
  url,
  setUrl,
  handleSiteCrawl,
  setChoseUrl,
  setShowNewDocModal,
}: TabAIWidgetPromptWebsiteProps): ReactElement => {
  const handleShowDeleteModal = (links: string[]) => {
    setShowNewDocModal(true);
    setChoseUrl(links);
  };

  return (
    <>
      <Box className="font-semibold font-sans text-[16px] mb-4">
        <span>Add Website (</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>RAG feature</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
      </Box>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Provide your website URL(s) in order for the system to ingest data from
        there.
      </p>
      <Box className="flex gap-2 items-center justify-start mb-4">
        <input
          disabled={aiBot.siteLinks && !!aiBot.siteLinks.length}
          type="text"
          className={classNames(
            'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px]',
            aiBot.siteLinks &&
              !!aiBot.siteLinks.length &&
              'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <IconButton
          disabled={aiBot.siteLinks && !!aiBot.siteLinks.length}
          className={classNames(
            aiBot.siteLinks &&
              !!aiBot.siteLinks.length &&
              'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          aria-label="delete"
          onClick={() => handleSiteCrawl(url)}
        >
          <LanguageIcon />
        </IconButton>
      </Box>

      {/* <Box className="flex items-center gap-2 pb-6">
        <Checkbox defaultChecked />
        <p className="font-sans text-sm">Follow link</p>
      </Box> */}

      {aiBot && aiBot.siteLinks && aiBot.siteLinks.length > 0 && (
        <LinksTable
          siteLinks={aiBot.siteLinks}
          handleShowDeleteModal={handleShowDeleteModal}
        />
      )}
    </>
  );
};
