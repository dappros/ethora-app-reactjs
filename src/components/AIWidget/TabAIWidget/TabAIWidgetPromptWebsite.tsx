import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, IconButton, Switch } from '@mui/material';
import classNames from 'classnames';
import {
  ChangeEvent,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelAIbot, SiteLinks } from '../../../models';
import { Rag } from '../Rag';
import { LinksTable } from './TabAIWidgetPromptWebsite/LinksTable';

interface TabAIWidgetPromptWebsiteProps {
  ragRef: RefObject<HTMLDivElement>;
  aiBot: ModelAIbot;
  url: string;
  setUrl: (url: string) => void;
  handleSiteCrawl: (url: string, followLink: boolean) => void;
  loadingTextCrawl?: boolean;
  setChoseUrl: (value: SetStateAction<SiteLinks[]>) => void;
  setShowNewDocModal: (value: SetStateAction<boolean>) => void;
  handleCrawlReindex: (id: string) => void;
}

export const TabAIWidgetPromptWebsite = ({
  ragRef,
  aiBot,
  url,
  setUrl,
  handleSiteCrawl,
  setChoseUrl,
  setShowNewDocModal,
  loadingTextCrawl,
  handleCrawlReindex,
}: TabAIWidgetPromptWebsiteProps): ReactElement => {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [followLink, setFollowLink] = useState<boolean>(true);

  const handleShowDeleteModal = (links: SiteLinks[]) => {
    setShowNewDocModal(true);
    setChoseUrl(links);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFollowLink(event.target.checked);
  };

  useEffect(() => {
    return aiBot.siteUrlsV2.some((link) => link.url === url)
      ? setDisabled(true)
      : setDisabled(false);
  }, [aiBot.siteUrlsV2, url]);

  return (
    <div className="py-6 p-0 md:p-6">
      <Box className="font-semibold font-sans text-[16px] my-4">
        <span>{t('aiWidgetWebsite.titlePrefix')}</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>{t('aiWidgetWebsite.ragFeature')}</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
      </Box>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('aiWidgetWebsite.description')}
      </p>
      <Box className="flex lg:flex-row flex-col gap-4 lg:gap-2 lg:items-center justify-start">
        <Box className="flex gap-2 items-center justify-start">
          <input
            type="text"
            className={classNames(
              'w-[300px] py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px]'
            )}
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <IconButton
            disabled={disabled}
            className={classNames(
              disabled && 'opacity-50 cursor-not-allowed bg-gray-200'
            )}
            aria-label="delete"
            onClick={() => handleSiteCrawl(url, followLink)}
          >
            <LanguageIcon />
          </IconButton>
        </Box>
        {loadingTextCrawl && (
          <Box className="text-gray-600 font-medium animate-pulse">
            {t('aiWidgetWebsite.indexingProgress')}
          </Box>
        )}
      </Box>

      <Box className="flex items-center pb-8 pl-1 gap-2">
        <Switch
          checked={followLink}
          onChange={handleChange}
          slotProps={{ input: { 'aria-label': 'controlled' } }}
          size="small"
        />
        <p className="font-sans text-sm">
          {followLink ? (
            <span>
              {t('aiWidgetWebsite.followLinksPrefix')}{' '}
              <span className="font-semibold">{t('aiWidgetWebsite.followLinksBold')}</span>.
            </span>
          ) : (
            <span>
              {t('aiWidgetWebsite.noFollowLinksPrefix')}{' '}
              <span className="font-semibold">{t('aiWidgetWebsite.noFollowLinksBold')}</span> {t('aiWidgetWebsite.noFollowLinksSuffix')}
            </span>
          )}
        </p>
      </Box>

      {aiBot && aiBot.siteLinks && aiBot.siteLinks.length > 0 && (
        <LinksTable
          siteLinks={aiBot.siteUrlsV2}
          handleShowDeleteModal={handleShowDeleteModal}
          handleCrawlReindex={handleCrawlReindex}
        />
      )}

      <Rag ragRef={ragRef} />
    </div>
  );
};
