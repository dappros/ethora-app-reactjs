import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../actions';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import TabApp from '../../components/TabApp';
import { ModelApp, ModelAppDefaulRooom } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { Api } from './Api';
import { Appearance } from './Appearance';
import { Chats } from './Chats';
import { HomeScreen } from './HomeScreen';
import { Menu } from './Menu';
import { MobileApp } from './MobileApp';
import { SignonOptions } from './SignonOptions';
import { Visibility } from './Visibility';
import { WebApp } from './WebApp';

export default function AppSettings() {
  let { appId } = useParams();
  const apps = useAppStore((s) => s.apps);
  const [app, setApp] = useState<ModelApp | undefined>(undefined);

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

  const onSave = () => {
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
      });
    }
  };

  const onExternalClick = () => {
    window.open(
      `https://${app.domainName}.${import.meta.env.VITE_ROOT_DOMAIN}`,
      '_blank'
    );
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

  if (!app) {
    return <div></div>;
  }

  return (
    <div className="h-full grid grid-rows-[1fr,_57px] md:grid-rows-[57px,_1fr] gap-y-[16px]">
      <div className="row-start-2 border-b-0 md:row-start-1 flex w-full md:justify-between items-center md:border-b border-b-gray-200">
        <div className="ml-4 hidden md:block font-varela text-[24px]">
          Settings
        </div>
        <div className="flex w-full md:w-auto items-center">
          <button
            onClick={onExternalClick}
            className="mr-4 w-[40px] h-[40px] flex items-center justify-center rounded-xl hover:bg-brand-hover"
          >
            <IconExternalLink />
          </button>
          <button
            onClick={onSave}
            className="border border-brand-500 hover:bg-brand-hover w-full md:w-[184px] p-2 rounded-xl text-brand-500"
          >
            Save
          </button>
        </div>
      </div>
      <TabGroup className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] md:grid-rows-1 md:grid-cols-[308px,_1fr] px-4">
        <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0  border-b border-gray-200 md:border-b-0 md:pr-4 overflow-auto  md:border-r md:border-gray-200">
          <TabApp text="Appearance" />
          <TabApp text="Sign-on options" />
          <TabApp text="Web app" />
          <TabApp text="Mobile app" />
          <TabApp text="Home screen" />
          <TabApp text="Menu" />
          <TabApp text="Chats" />
          <TabApp text="Visibility & Privacy" />
          <TabApp text="API" last />
        </TabList>
        <TabPanels className="h-full overflow-hidden">
          <TabPanel
            key="Appearance"
            className="grid grid-rows-[auto,_368px] xl:grid-rows-1 xl:gap-x-[40px] xl:grid-cols-[416px,_1fr] md:ml-4 h-full "
          >
            <Appearance
              displayName={displayName}
              setDisplayName={setDisplayName}
              tagline={tagline}
              setTagline={setTagline}
              coinName={coinName}
              setCoinName={setCoinName}
              color={color}
              setColor={setColor}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              sublogoImage={sublogoImage}
              setSublogoImage={setSublogoImage}
            />
          </TabPanel>
          <TabPanel
            key="Sign-on options"
            className="grid grid-rows-1 md:ml-4 h-full "
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
          <TabPanel key="Web app" className="grid grid-rows-1 md:ml-4 h-full ">
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
            className="grid grid-rows-1 md:ml-4 h-full "
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
            key="Home screen"
            className="grid grid-rows-1 md:ml-4 h-full "
          >
            <HomeScreen
              afterLoginPage={afterLoginPage}
              setAfterLoginPage={setAfterLoginPage}
              primaryColor={app.primaryColor}
            />
          </TabPanel>
          <TabPanel key="Menu" className="grid grid-rows-1 md:ml-4 h-full ">
            <Menu
              availableMenuItems={availableMenuItems}
              setAvailableMenuItems={setAvailableMenuItems}
            />
          </TabPanel>

          <TabPanel
            key="Chats"
            className="grid overflow-hidden grid-rows-1 md:ml-4 h-full"
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
            key="Visibility & Privacy"
            className="grid grid-rows-1 md:ml-4 h-full"
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

          <TabPanel key="API" className="grid grid-rows-1 md:ml-4 h-full">
            <Api app={app} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
