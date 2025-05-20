import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../actions';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import { Loading } from '../../components/Loading';
import DeleteAppModal from '../../components/modal/DeleteAppModal';
import InfoAppModal from '../../components/modal/InfoAppModal';
import TabApp from '../../components/TabApp';
import { deleteApp } from '../../http';
import { ModelApp, ModelAppDefaulRooom } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { Api } from './Api';
import { Appearance } from './Appearance';
import { Chats } from './Chats';
import { CryptoRewards } from './CryptoRewards';
import { HomeScreen } from './HomeScreen';
import { Menu } from './Menu';
import { MobileApp } from './MobileApp';
import { SignonOptions } from './SignonOptions';
import { Visibility } from './Visibility';
import { WebApp } from './WebApp';

const tabs = [
  'Appearance',
  'Chats',
  'Web app',
  'Mobile app',
  'Sign-on options',
  'Home screen',
  'Menu',
  'Crypto & Rewards',
  'Visibility & Privacy',
  'API',
];

interface CustomStep extends Step {
  goToTabIndex?: number;
}

export default function AppSettings() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const apps = useAppStore((s) => s.apps);
  const [isInfo, setIsInfo] = useState(false);
  const [app, setApp] = useState<ModelApp | undefined>(undefined);

  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab');

  const initialTabIndex = tabs.includes(tabFromUrl ?? '')
    ? tabs.indexOf(tabFromUrl!)
    : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex);

  // Joyride state
  const [runTour, setRunTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<Step[]>([]);

  useEffect(() => {
    if (
      tabs.includes(tabFromUrl ?? '') &&
      tabs.indexOf(tabFromUrl!) !== selectedIndex
    ) {
      setSelectedIndex(tabs.indexOf(tabFromUrl!));
    }
  }, [tabFromUrl]);

  useEffect(() => {
    const linearSteps: CustomStep[] = [
      // Appearance tab preview
      {
        target: '[data-testid="tab-Appearance"]',
        content: "Manage your app's visual style.",
        placement: 'right',
        disableBeacon: true,
        goToTabIndex: 0,
      },
      {
        target: '[data-testid="appearance-display-name"]',
        content: 'Set the name for your app.',
        placement: 'bottom',
        goToTabIndex: 0,
      },
      {
        target: '[data-testid="appearance-tagline"]',
        content: 'Enter a tagline.',
        placement: 'bottom',
        goToTabIndex: 0,
      },
      {
        target: '[data-testid="appearance-color-picker"]',
        content: 'Pick your brand color.',
        placement: 'bottom',
        goToTabIndex: 0,
      },
      {
        target: '[data-testid="appearance-add-logo"]',
        content: 'Upload the main logo.',
        placement: 'bottom',
        goToTabIndex: 0,
      },
      {
        target: '[data-testid="appearance-delete-button"]',
        content: 'Danger zone: delete the app.',
        placement: 'top',
        goToTabIndex: 0,
      },

      // Chats tab
      {
        target: '[data-testid="tab-Chats"]',
        content: 'Configure chat options.',
        placement: 'right',
        goToTabIndex: 1,
      },

      // Web App tab
      {
        target: '[data-testid="tab-Web app"]',
        content: 'Set up your web application.',
        placement: 'right',
        goToTabIndex: 2,
      },

      // Mobile App tab
      {
        target: '[data-testid="tab-Mobile app"]',
        content: 'Mobile app configuration.',
        placement: 'right',
        goToTabIndex: 3,
      },

      // Signon Options tab
      {
        target: '[data-testid="tab-Sign-on options"]',
        content: 'Manage login methods.',
        placement: 'right',
        goToTabIndex: 4,
      },

      // Home Screen
      {
        target: '[data-testid="tab-Home screen"]',
        content: 'Set the home screen.',
        placement: 'right',
        goToTabIndex: 5,
      },

      // Menu
      {
        target: '[data-testid="tab-Menu"]',
        content: 'Customize app menu.',
        placement: 'right',
        goToTabIndex: 6,
      },

      // Crypto & Rewards
      {
        target: '[data-testid="tab-Crypto & Rewards"]',
        content: 'Crypto and rewards settings.',
        placement: 'bottom',
        goToTabIndex: 7,
      },

      // Visibility & Privacy
      {
        target: '[data-testid="tab-Visibility & Privacy"]',
        content: 'Privacy settings.',
        placement: 'bottom',
        goToTabIndex: 8,
      },

      // API
      {
        target: '[data-testid="tab-API"]',
        content: 'Your API keys and secrets.',
        placement: 'bottom',
        goToTabIndex: 9,
      },
    ];

    setTourSteps(linearSteps);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, step } = data;
    const customStep = step as CustomStep;

    if (
      (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) &&
      customStep?.goToTabIndex !== undefined
    ) {
      setSelectedIndex(customStep.goToTabIndex);
      setSearchParams(
        { tab: tabs[customStep.goToTabIndex] },
        { replace: true }
      );
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  const handleTabChange = (index: number) => {
    if (tabs[index] !== tabFromUrl) {
      setSearchParams({ tab: tabs[index] }, { replace: true });
    }
    setSelectedIndex(index);
  };

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
    };
    const isModified =
      JSON.stringify(initialState) !== JSON.stringify(currentState);
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
      };

      setInitialState(initialData);
    }
  }, [app]);

  const onSave = () => {
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

    body.allowUsersToCreateRooms = allowUsersToCreateRooms;

    console.log('on save body ', body);

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
        });
        setIsModified(false);
      });
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

  useEffect(() => {
    if (apps) {
      const result = apps.find((app) => app._id === appId);
      if (result) {
        setApp(result);
      }
    }
  }, [apps, appId]);

  useEffect(() => {
    if (!app) return;

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
    if (!app) return;

    const createdAt = new Date(app.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();

    if (diffMs <= 3 * 60 * 1000) {
      setIsInfo(true);
    }
  }, [app]);

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

  if (!app) {
    return <div></div>;
  }

  return (
    <div className="h-full grid grid-rows-[1fr,_57px] lg:grid-rows-[57px,_1fr] gap-y-[16px]">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000, // Ensure Joyride is above other elements
            arrowColor: '#fff',
            backgroundColor: '#fff',
            primaryColor: '#007aff', // A pleasant blue, adjust as needed
            textColor: '#333',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#007aff',
          },
          buttonBack: {
            marginRight: 10,
          },
        }}
      />
      <div className="px-4 lg:px-0 row-start-2 border-b-0 lg:row-start-1 flex w-full lg:justify-between items-center lg:border-b border-b-gray-200">
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
            onClick={() => {
              if (selectedIndex !== 0) {
                setSelectedIndex(0);
                setSearchParams({ tab: tabs[0] }, { replace: true });

                setRunTour(true);
              } else {
                setRunTour(true);
              }
            }}
            className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl"
          >
            Start Tour
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
          {tabs.map((tab, index) => (
            <TabApp
              key={index}
              text={tab}
              last={index === tabs.length - 1}
              dataTestId={`tab-${tab.replace(/\\s|&/g, '-')}`}
            />
          ))}
        </TabList>
        <TabPanels className="h-full overflow-hidden">
          <TabPanel
            key="Appearance"
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
              onDelete={() => setIsDelete(true)}
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

          <TabPanel key="Web app" className="grid grid-rows-1 lg:ml-4 h-full ">
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
            key="Mobile app"
            className="grid grid-rows-1 lg:ml-4 h-full "
          >
            <MobileApp
              bundleId={bundleId}
              setBundleId={setBundleId}
              setGoogleServicesJson={setGoogleServicesJson}
              setGoogleServiceInfoPlist={setGoogleServiceInfoPlist}
              primaryColor={app.primaryColor}
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
            key="Home screen"
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

          <TabPanel
            key="Crypto & Rewards"
            className="grid grid-rows-1 lg:ml-4 h-full "
          >
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
        </TabPanels>
      </TabGroup>

      {isDelete && (
        <DeleteAppModal
          appName={displayName}
          onClose={() => setIsDelete(false)}
          handleDelete={handleDelete}
          show={isDelete}
        />
      )}

      {isInfo && (
        <InfoAppModal
          appName={displayName}
          domainName={app.domainName}
          onClose={() => setIsInfo(false)}
          show={isInfo}
          primaryColor={app.primaryColor}
        />
      )}

      {loading && <Loading />}
    </div>
  );
}
