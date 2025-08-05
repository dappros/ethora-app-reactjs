import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import classNames from 'classnames';
import { cloneDeep, isEqual } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../actions';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import { Loading } from '../../components/Loading';
import DeleteAppModal from '../../components/modal/DeleteAppModal';
import { SettingTutorialModal } from '../../components/modal/SettingsTutorialModal/SettingTutorialModal';
import TabApp from '../../components/TabApp';
import {
  deleteApp,
  deleteSourcesSiteCrawl,
  httpUpdateOneUser,
  setSourcesSiteCrawl,
} from '../../http';
import { ModelAIbot, ModelApp, ModelAppDefaulRooom } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { AIbot } from './AIbot';
import { Api } from './Api';
import { Appearance } from './Appearance';
import { Chats } from './Chats';
import { CryptoRewards } from './CryptoRewards';
import { DeleteSetting } from './DeleteSetting';
import { HomeScreen } from './HomeScreen';
import { Menu } from './Menu';
import { MobileApp } from './MobileApp';
import ProgressCreateApp from './ProgressCreateApp';
import { SignonOptions } from './SignonOptions';
import { Visibility } from './Visibility';
import { WebApp } from './WebApp';

const tabs = [
  'AI Widget',
  'Web App',
  'Mobile App',
  'Chat',
  'Appearance',
  'Sign-on options',
  'Home screen',
  'Menu',
  'Rewards',
  'Visibility & Privacy',
  'API',
  'Delete',
];

const tabsNew = {
  Publish: ['AI Widget', 'Web App', 'Mobile App', 'Chat'],
  UI: ['Appearance', 'Sign-on options', 'Home screen', 'Menu'],
  System: ['Rewards', 'Visibility & Privacy', 'API', 'Delete'],
};

export default function AppSettings() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.state?.isNew ?? false;

  const DOMAIN_NAME = import.meta.env.VITE_DOMAIN_NAME;

  const apps = useAppStore((s) => s.apps);
  const currentUser = useAppStore((s) => s.currentUser);
  const [isInfo, setIsInfo] = useState(false);
  const [app, setApp] = useState<ModelApp | undefined>(undefined);

  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab');

  const initialTabIndex = tabs.includes(tabFromUrl ?? '')
    ? tabs.indexOf(tabFromUrl!)
    : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex);

  useEffect(() => {
    if (
      tabs.includes(tabFromUrl ?? '') &&
      tabs.indexOf(tabFromUrl!) !== selectedIndex
    ) {
      setSelectedIndex(tabs.indexOf(tabFromUrl!));
    }
  }, [tabFromUrl]);

  const handleTabChange = (index: number) => {
    if (tabs[index] !== tabFromUrl) {
      setSearchParams({ tab: tabs[index] }, { replace: true });
    }
    setSelectedIndex(index);
  };

  const isOpen = localStorage.getItem('isProgressCreateAppOpen');
  console.log('isOpen', localStorage.getItem('isProgressCreateAppOpen'));
  const [showProgress, setShowProgress] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen === null) {
      setShowProgress(true);
      return;
    }

    setShowProgress(isOpen === 'true');
  }, []);

  const [loading, setLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [initialState, setInitialState] = useState({});

  // appearance tab
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [coinName, setCoinName] = useState('');
  const [color, setColor] = useState('');
  const [logoImage, setLogoImage] = useState('');
  const [sublogoImage, setSublogoImage] = useState('');

  // signon tab
  const [enableEmail, setEnableEmail] = useState(false);
  const [enableGoogle, setEnableGoogle] = useState(false);
  const [enableApple, setEnableApple] = useState(false);
  const [enableFacebook, setEnableFacebook] = useState(false);
  const [enableMetamask, setEnableMetamask] = useState(false);

  // web app
  const [domainName, setDomainName] = useState('');
  const [firebaseWebConfigString, setFirebaseWebConfigString] = useState('');

  // AI bot
  const [aiBot, setAiBot] = useState<ModelAIbot>({} as ModelAIbot);

  // mobile app
  const [bundleId, setBundleId] = useState('');
  const [googleServicesJson, setGoogleServicesJson] = useState('');
  const [googleServiceInfoPlist, setGoogleServiceInfoPlist] = useState('');

  const [availableMenuItems, setAvailableMenuItems] = useState({
    chats: false,
    profile: false,
    settings: false,
  });

  // home
  const [afterLoginPage, setAfterLoginPage] = useState('');

  // visibility
  const [defaultAccessAssetsOpen, setDefaultAccessAssetsOpen] = useState(false);
  const [defaultAccessProfileOpen, setDefaultAccessProfileOpen] =
    useState(false);
  const [usersCanFree, setUsersCanFree] = useState(false);

  // chats
  const [allowUsersToCreateRooms, setAllowUsersToCreateRooms] = useState(false);

  const [defaultChatRooms, setDefaultChatRooms] = useState<
    Array<ModelAppDefaulRooom>
  >([]);

  const checkIfModified = () => {
    const currentState = {
      displayName,
      tagline,
      coinName,
      color,
      logoImage,
      sublogoImage,
      enableEmail,
      enableGoogle,
      enableApple,
      enableFacebook,
      enableMetamask,
      domainName,
      firebaseWebConfigString,
      bundleId,
      googleServicesJson,
      googleServiceInfoPlist,
      availableMenuItems,
      afterLoginPage,
      defaultAccessAssetsOpen,
      defaultAccessProfileOpen,
      usersCanFree,
      allowUsersToCreateRooms,
      aiBot: cloneDeep(aiBot),
    };
    const isModified = !isEqual(initialState, currentState);
    setIsModified(isModified);
  };

  useEffect(() => {
    checkIfModified();
  }, [
    displayName,
    tagline,
    coinName,
    color,
    logoImage,
    sublogoImage,
    enableEmail,
    enableGoogle,
    enableApple,
    enableFacebook,
    enableMetamask,
    domainName,
    firebaseWebConfigString,
    bundleId,
    googleServicesJson,
    googleServiceInfoPlist,
    availableMenuItems,
    afterLoginPage,
    defaultAccessAssetsOpen,
    defaultAccessProfileOpen,
    usersCanFree,
    allowUsersToCreateRooms,
    aiBot,
  ]);

  useEffect(() => {
    if (app) {
      const initialData = {
        displayName: app.displayName || '',
        tagline: app.appTagline || '',
        coinName: app.coinName || '',
        color: app.primaryColor || '',
        logoImage: app.logoImage,
        sublogoImage: app.sublogoImage,
        enableEmail: app.signonOptions.includes('email'),
        enableGoogle: app.signonOptions.includes('google'),
        enableApple: app.signonOptions.includes('apple'),
        enableFacebook: app.signonOptions.includes('facebook'),
        enableMetamask: app.signonOptions.includes('metamask'),
        domainName: app.domainName,
        firebaseWebConfigString: app.firebaseWebConfigString || '',
        bundleId: app.bundleId,
        googleServicesJson: app.googleServicesJson,
        googleServiceInfoPlist: app.googleServiceInfoPlist,
        availableMenuItems: app.availableMenuItems,
        afterLoginPage: app.afterLoginPage,
        defaultAccessAssetsOpen: app.defaultAccessAssetsOpen,
        defaultAccessProfileOpen: app.defaultAccessProfileOpen,
        usersCanFree: app.usersCanFree,
        allowUsersToCreateRooms: app.allowUsersToCreateRooms,
        aiBot: cloneDeep(app.aiBot),
      };

      setInitialState(initialData);
    }
  }, [app]);

  const onSave = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {};

    // appearance
    if (displayName) {
      body.displayName = displayName;
    }

    if (tagline) {
      body.appTagline = tagline;
    }

    if (coinName) {
      body.coinName = coinName;
    }

    if (color) {
      body.primaryColor = color;
    }

    if (logoImage) {
      body.logoImage = logoImage;
    }

    if (sublogoImage) {
      body.sublogoImage = sublogoImage;
    }

    // signon
    const signonOptions = [];

    if (enableEmail) {
      signonOptions.push('email');
    }

    if (enableGoogle) {
      signonOptions.push('google');
    }

    if (enableApple) {
      signonOptions.push('apple');
    }

    if (enableFacebook) {
      signonOptions.push('facebook');
    }

    if (enableMetamask) {
      signonOptions.push('metamask');
    }

    body.signonOptions = signonOptions;

    // web app
    if (domainName) {
      body.domainName = domainName;
    }

    if (firebaseWebConfigString) {
      body.firebaseWebConfigString = firebaseWebConfigString;
    }

    // mobile
    if (bundleId) {
      body.bundleId = bundleId;
    }

    if (googleServicesJson) {
      body.googleServicesJson = googleServicesJson;
    }

    if (googleServiceInfoPlist) {
      body.googleServiceInfoPlist = googleServiceInfoPlist;
    }

    // home
    if (afterLoginPage) {
      body.afterLoginPage = afterLoginPage;
    }

    //AI bot
    if (Object.keys(aiBot).length > 0) {
      body.botPrompt = aiBot.prompt;
      body.botGreetingMessage = aiBot.greetingMessage;
      body.botTrigger = aiBot.trigger;
      body.botChatId = aiBot.chatId;
    }

    if (
      aiBot.userId &&
      app?.aiBot?.user &&
      (aiBot.user.lastName !== app?.aiBot?.user?.lastName ||
        aiBot.user.firstName !== app?.aiBot?.user?.firstName)
    ) {
      if (aiBot.user.lastName.length < 3 || aiBot.user.firstName.length < 3) {
        toast.warning('The AI bot name must be at least 3 characters long');
      }

      if (app?.creatorId === currentUser?._id) {
        await httpUpdateOneUser(appId as string, aiBot.userId, {
          lastName: aiBot.user.lastName,
          firstName: aiBot.user.firstName,
        });
      }
    }

    body.allowUsersToCreateRooms = allowUsersToCreateRooms;

    if (appId) {
      actionUpdateApp(appId, body).then(() => {
        toast('Settings applied successfully!');
        setInitialState({
          displayName,
          tagline,
          coinName,
          color,
          logoImage,
          sublogoImage,
          enableEmail,
          enableGoogle,
          enableApple,
          enableFacebook,
          enableMetamask,
          domainName,
          firebaseWebConfigString,
          bundleId,
          googleServicesJson,
          googleServiceInfoPlist,
          availableMenuItems,
          afterLoginPage,
          defaultAccessAssetsOpen,
          defaultAccessProfileOpen,
          usersCanFree,
          allowUsersToCreateRooms,
          aiBot,
        });
        setIsModified(false);
      });
    }
  };

  const handleSiteCrawl = async (url: string) => {
    if (!appId || !url) return;

    setLoading(true);

    try {
      const response = await setSourcesSiteCrawl(appId, url);
      setAiBot((prev) => {
        const combined = [...prev.siteLinks, ...response.data.result];
        const uniqueLinks = Array.from(new Set(combined));
        return { ...prev, siteLinks: uniqueLinks };
      });
      toast.success('Site crawl set successfully');
    } catch (error) {
      console.error('Error setting site crawl:', error);
      toast.error('Failed to set site crawl');
    } finally {
      setLoading(false);
    }
  };

  const deleteSiteCrawl = async (url: string) => {
    if (!appId || !url) return;

    setLoading(true);

    try {
      const response = await deleteSourcesSiteCrawl(appId, url);
      setAiBot((prev) => {
        const updatedLinks = prev.siteLinks.filter(
          (link) => link !== response.data.result
        );
        return { ...prev, siteLinks: updatedLinks };
      });
      toast.success('Site crawl deleted successfully');
    } catch (error) {
      console.error('Error deleting site crawl:', error);
      toast.error('Failed to delete site crawl');
    } finally {
      setLoading(false);
    }
  };

  const onExternalClick = () => {
    if (app) {
      window.open(
        `https://${app.domainName}.${import.meta.env.VITE_ROOT_DOMAIN}`,
        '_blank'
      );
    }
  };

  const tabsMemo = useMemo(() => {
    return Object.entries(tabsNew).flatMap(([sectionTitle, items]) => {
      const sectionHeader = (
        <div
          key={`section-${sectionTitle}`}
          className="text-md font-bold uppercase text-black py-[10px] md:py-3 md:px-2 border-b-brand-500"
        >
          {sectionTitle}
        </div>
      );

      const tabItems = items.map((tab, index) => {
        if (tab === 'Delete' && domainName === DOMAIN_NAME) {
          return null;
        }

        return (
          <TabApp key={`${tab}_${index}`} text={tab} last={tab === 'Delete'} />
        );
      });

      return [sectionHeader, ...tabItems];
    });
  }, [DOMAIN_NAME, domainName]);

  useEffect(() => {
    if (apps) {
      const result = apps.find((app) => app._id === appId);
      if (result) {
        setApp(result);
      }
    }
  }, [apps, appId]);

  const handleDelete = async () => {
    if (!app) {
      return;
    }

    setLoading(true);

    try {
      await deleteApp(app._id).then(() => {
        toast.success('You have successfully deleted your application');
        setIsDelete(false);
        navigate('/app/admin/apps', { replace: true });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isAppearance = useMemo((): boolean => {
    if (!app) return false;

    return !!app.primaryColor && !!app.appTagline && !!app.displayName;
  }, [app]);

  useEffect(() => {
    if (!app) return;

    if (
      app.aiBot &&
      (!app.aiBot?.user?.lastName || !app.aiBot?.user?.firstName)
    ) {
      setAiBot({
        ...app.aiBot,
        user: {
          ...aiBot?.user,
          firstName: aiBot?.user?.firstName || '',
          lastName: aiBot?.user?.lastName || '',
        },
      });
    } else {
      setAiBot(app.aiBot || {});
    }

    setDisplayName(app.displayName || '');
    setTagline(app.appTagline || '');
    setCoinName(app.coinName || '');
    setColor(app.primaryColor || '');
    setLogoImage(app.logoImage);
    setSublogoImage(app.sublogoImage);
    setEnableEmail(app.signonOptions.includes('email'));
    setEnableGoogle(app.signonOptions.includes('google'));
    setEnableApple(app.signonOptions.includes('apple'));
    setEnableFacebook(app.signonOptions.includes('facebook'));
    setEnableMetamask(app.signonOptions.includes('metamask'));
    setDomainName(app.domainName);
    setFirebaseWebConfigString(
      app.firebaseWebConfigString ? app.firebaseWebConfigString : ''
    );
    setBundleId(app.bundleId);
    setGoogleServicesJson(app.googleServicesJson);
    setGoogleServiceInfoPlist(app.googleServiceInfoPlist);
    setAvailableMenuItems(app.availableMenuItems);
    setAfterLoginPage(app.afterLoginPage);
    setDefaultAccessAssetsOpen(app.defaultAccessAssetsOpen);
    setDefaultAccessProfileOpen(app.defaultAccessProfileOpen);
    setUsersCanFree(app.usersCanFree);
    setAllowUsersToCreateRooms(app.allowUsersToCreateRooms);
    setDefaultChatRooms(app.defaultRooms);
  }, [app]);

  useEffect(() => {
    if (isNew) {
      setIsInfo(true);
      navigate(location.pathname, {
        replace: true,
        state: { from: location.pathname + location.search, isNew: false },
      });
    }
  }, [isNew, location.pathname, location.search, navigate]);

  if (!app) {
    return <div></div>;
  }

  return (
    <div className="h-full grid grid-rows-[1fr,_57px] lg:grid-rows-[57px,_1fr] gap-y-[16px]">
      <div className="px-4 pt-4">
        {showProgress && (
          <ProgressCreateApp
            isAppearanceAdjusted={isAppearance}
            isEndUserCreated={Boolean(
              app?.stats?.totalRegistered && app.stats.totalRegistered > 0
            )}
            onClose={() => setShowProgress(false)}
          />
        )}
      </div>

      <div className="px-4 pb-4 lg:px-0 row-start-2 border-b-0 lg:row-start-1 flex w-full lg:justify-between items-center lg:border-b border-b-gray-200">
        <div className="ml-4 hidden lg:block font-varela text-[24px]">
          <span>Settings</span>
          <IconButton
            size="small"
            sx={{ marginLeft: 1, verticalAlign: 'middle' }}
            aria-label="info"
            onClick={() => setIsInfo(true)}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
        <div className="flex w-full lg:w-auto items-center">
          <button
            onClick={onExternalClick}
            className="mr-4 w-[40px] h-[40px] flex items-center justify-center rounded-xl hover:bg-brand-hover"
          >
            <IconExternalLink />
          </button>
          <button
            onClick={onSave}
            className={classNames(
              'border bg-brand-500 hover:bg-brand-400 w-full lg:w-[184px] p-2 rounded-xl text-white px-4',
              isModified ? '' : 'opacity-50 cursor-not-allowed'
            )}
            disabled={!isModified}
          >
            Save
          </button>
        </div>
      </div>
      <TabGroup
        className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] lg:grid-rows-1 lg:grid-cols-[308px,_1fr] px-4"
        selectedIndex={selectedIndex}
        onChange={handleTabChange}
      >
        <TabList className="flex flex-row lg:flex-col hide-scroll lg:mb-0  border-b border-gray-200 lg:border-b-0 lg:pr-4 overflow-auto  lg:border-r lg:border-gray-200">
          {tabsMemo}
        </TabList>
        <TabPanels className="h-full overflow-hidden">
          <TabPanel key="AI bot" className="grid grid-rows-1 lg:ml-4 h-full ">
            <AIbot
              appId={appId as string}
              aiBot={aiBot}
              setAiBot={setAiBot}
              defaultChatRooms={defaultChatRooms}
              primaryColor={app.primaryColor}
              isDisabled={app?.creatorId !== currentUser?._id}
              handleSiteCrawl={handleSiteCrawl}
              deleteSiteCrawl={deleteSiteCrawl}
            />
          </TabPanel>

          <TabPanel
            key="Web App"
            className="grid grid-rows-1 lg:ml-4 h-full "
            // className="grid grid-rows-[auto,_368px] 2xl:grid-rows-1 2xl:gap-x-[40px] 2xl:grid-cols-[416px,_1fr] lg:ml-4 h-full "
          >
            <WebApp
              domainName={domainName}
              setDomainName={setDomainName}
              firebaseWebConfigString={firebaseWebConfigString}
              setFirebaseWebConfigString={setFirebaseWebConfigString}
              primaryColor={app.primaryColor}
              onExternalClick={onExternalClick}
            />
          </TabPanel>

          <TabPanel
            key="Mobile App"
            className="grid grid-rows-1 lg:ml-4 h-full "
          >
            <MobileApp
              primaryColor={app.primaryColor}
              bundleId={bundleId}
              setBundleId={setBundleId}
              setGoogleServicesJson={setGoogleServicesJson}
              setGoogleServiceInfoPlist={setGoogleServiceInfoPlist}
            />
          </TabPanel>

          <TabPanel
            key="Chats"
            className="grid overflow-hidden grid-rows-1 lg:ml-4 h-full"
          >
            <Chats
              allowUsersToCreateRooms={allowUsersToCreateRooms}
              setAllowUsersToCreateRooms={setAllowUsersToCreateRooms}
              defaultChatRooms={defaultChatRooms}
              setDefaultChatRooms={setDefaultChatRooms}
              appId={appId as string}
            />
          </TabPanel>

          <TabPanel
            key="Appearance"
            // className="grid grid-rows-1 lg:ml-4 h-full "
            className="grid grid-rows-[auto,_368px] 2xl:grid-rows-1 2xl:gap-x-[40px] 2xl:grid-cols-[416px,_1fr] lg:ml-4 h-full "
          >
            <Appearance
              displayName={displayName}
              setDisplayName={setDisplayName}
              tagline={tagline}
              setTagline={setTagline}
              color={color}
              setColor={setColor}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
            />
          </TabPanel>

          <TabPanel
            key="Sign-on options"
            className="grid grid-rows-1 lg:ml-4 h-full "
          >
            <SignonOptions
              enableEmail={enableEmail}
              setEnableEmail={setEnableEmail}
              enableGoogle={enableGoogle}
              setEnableGoogle={setEnableGoogle}
              enableApple={enableApple}
              setEnableApple={setEnableApple}
              enableFacebook={enableFacebook}
              setEnableFacebook={setEnableFacebook}
              enableMetamask={enableMetamask}
              setEnableMetamask={setEnableMetamask}
            />
          </TabPanel>

          <TabPanel
            key="Home Screen"
            className="grid grid-rows-1 lg:ml-4 h-full "
          >
            <HomeScreen
              afterLoginPage={afterLoginPage}
              setAfterLoginPage={setAfterLoginPage}
              primaryColor={app.primaryColor}
            />
          </TabPanel>

          <TabPanel key="Menu" className="grid grid-rows-1 lg:ml-4 h-full ">
            <Menu
              availableMenuItems={availableMenuItems}
              setAvailableMenuItems={setAvailableMenuItems}
            />
          </TabPanel>

          <TabPanel key="Rewards" className="grid grid-rows-1 lg:ml-4 h-full ">
            <CryptoRewards coinName={coinName} setCoinName={setCoinName} />
          </TabPanel>

          <TabPanel
            key="Visibility & Privacy"
            className="grid grid-rows-1 lg:ml-4 h-full"
          >
            <Visibility
              defaultAccessAssetsOpen={defaultAccessAssetsOpen}
              setDefaultAccessAssetsOpen={setDefaultAccessAssetsOpen}
              defaultAccessProfileOpen={defaultAccessProfileOpen}
              setDefaultAccessProfileOpen={setDefaultAccessProfileOpen}
              usersCanFree={usersCanFree}
              setUsersCanFree={setUsersCanFree}
            />
          </TabPanel>

          <TabPanel key="API" className="grid grid-rows-1 lg:ml-4 h-full">
            <Api app={app} />
          </TabPanel>

          {domainName !== DOMAIN_NAME && (
            <TabPanel key="Delete" className="grid grid-rows-1 lg:ml-4 h-full">
              <DeleteSetting
                displayName={displayName}
                onDelete={() => setIsDelete(true)}
              />
            </TabPanel>
          )}
        </TabPanels>
      </TabGroup>
      <div className="border-t border-t-gray-200">
        <p className="text-xs text-gray-500 py-4 text-center">
          Need assistance? Create a topic in our{' '}
          <a
            href="https://forum.ethora.com/"
            target="_blank"
            className="text-brand-500 underline"
          >
            Community Forum.
          </a>
        </p>
      </div>

      {isDelete && (
        <DeleteAppModal
          appName={displayName}
          onClose={() => setIsDelete(false)}
          handleDelete={handleDelete}
          show={isDelete}
        />
      )}

      {/* {isInfo && (
        <InfoAppModal
          appName={displayName}
          domainName={app.domainName}
          onClose={() => setIsInfo(false)}
          show={isInfo}
          primaryColor={app.primaryColor}
          appId={app._id}
          navigate={navigate}
        />
      )} */}
      {isInfo && (
        <SettingTutorialModal show={isInfo} onClose={() => setIsInfo(false)} />
      )}

      {loading && <Loading />}
    </div>
  );
}
