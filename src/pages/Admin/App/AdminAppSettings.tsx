import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';

import { TabGroup, TabPanel, TabPanels } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../../actions';
import { IconExternalLink } from '../../../components/Icons/IconExternalLink';
import { TablistSettings } from '../../../components/TabListSettings';
import { ModelApp } from '../../../models';
import './AdminAppSettings.scss';
import { Api } from './SettingsTab/Api';
import { Appearance } from './SettingsTab/Appearance';
import { Chats } from './SettingsTab/Chats';
import { HomeScreen } from './SettingsTab/HomeScreen';
import { Menu } from './SettingsTab/Menu';
import { MobileApp } from './SettingsTab/MobileApp';
import { SignonOptions } from './SettingsTab/SignonOptions';
import { Visibility } from './SettingsTab/Visibility';
import { WebApp } from './SettingsTab/WebApp';

export function AdminAppSettings() {
  let { appId } = useParams();
  const apps = useAppStore((s) => s.apps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);
  const app = apps.find((app) => app._id === appId);

  if (!app) {
    return null;
  }

  // appearance tab
  const [displayName, setDisplayName] = useState(app.displayName);
  const [tagline, setTagline] = useState(app.appTagline);
  const [coinName, setCoinName] = useState(app.coinName);
  const [color, setColor] = useState(app.primaryColor);
  const [logoImage, setLogoImage] = useState(app.logoImage);
  const [sublogoImage, setSublogoImage] = useState(app.sublogoImage);

  // signon tab
  const [enableEmail, setEnableEmail] = useState(
    app.signonOptions.includes('email')
  );
  const [enableGoogle, setEnableGoogle] = useState(
    app.signonOptions.includes('google')
  );
  const [enableApple, setEnableApple] = useState(
    app.signonOptions.includes('apple')
  );
  const [enableFacebook, setEnableFacebook] = useState(
    app.signonOptions.includes('facebook')
  );
  const [enableMetamask, setEnableMetamask] = useState(
    app.signonOptions.includes('metamask')
  );

  // web app
  const [domainName, setDomainName] = useState(app.domainName);
  const [firebaseWebConfigString, setFirebaseWebConfigString] = useState(
    app.firebaseWebConfigString ? app.firebaseWebConfigString : ''
  );

  // mobile app
  const [bundleId, setBundleId] = useState(app.bundleId);
  const [googleServicesJson, setGoogleServicesJson] = useState(
    app.googleServicesJson
  );
  const [googleServiceInfoPlist, setGoogleServiceInfoPlist] = useState(
    app.googleServiceInfoPlist
  );

  const [availableMenuItems, setAvailableMenuItems] = useState(
    app.availableMenuItems
  );

  // home
  const [afterLoginPage, setAfterLoginPage] = useState(app.afterLoginPage);

  // visibility
  const [defaultAccessAssetsOpen, setDefaultAccessAssetsOpen] = useState(
    app.defaultAccessAssetsOpen
  );
  const [defaultAccessProfileOpen, setDefaultAccessProfileOpen] = useState(
    app.defaultAccessProfileOpen
  );
  const [usersCanFree, setUsersCanFree] = useState(app.usersCanFree);

  const onSave = () => {
    let body: any = {};

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
    let signonOptions = [];

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

  return (
    // app-content-body-page
    <div className="flex flex-col-reverse md:flex-col">
      {/* app-content-body-header */}
      <div className="flex md:justify-between md:pb-4 md:border-b border-b-gray-200 mb-4">
        <div className="font-varela hidden md:block text-[24px] ml-4 ">
          Settings
        </div>
        <div className="md:max-w-[240px] w-full flex">
          <button onClick={onExternalClick} className="mr-[24px]">
            <IconExternalLink color={currentApp.primaryColor} />
          </button>
          <button
            onClick={onSave}
            className="border w-full inline-block border-brand-500 rounded-xl px-4 py-2 font-varela text-brand-500 md:max-w-[184px]"
          >
            Save
          </button>
        </div>
      </div>
      {/* admin-app-settings */}
      {/* grid-cols-[1fr_minmax(500px,_1fr)] */}
      <TabGroup className="grid overflow-hidden grid-rows-1  lg:grid-cols-[minmax(200px,308px),_1fr]">
        <TablistSettings
          items={[
            'Appearance',
            'Sign-on options',
            'Web app',
            'Mobile app',
            'Home screen',
            'Menu',
            'Chats',
            'Visibility & Privacy',
            'API',
          ]}
        />
        {/* tabs-content */}
        <TabPanels>
          <TabPanel key="Appearance">
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
          <TabPanel key="Sign-on options">
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
          <TabPanel key="Web app">
            <WebApp
              domainName={domainName}
              setDomainName={setDomainName}
              firebaseWebConfigString={firebaseWebConfigString}
              setFirebaseWebConfigString={setFirebaseWebConfigString}
            />
          </TabPanel>
          <TabPanel key="Mobile app">
            <MobileApp
              bundleId={bundleId}
              setBundleId={setBundleId}
              setGoogleServicesJson={setGoogleServicesJson}
              setGoogleServiceInfoPlist={setGoogleServiceInfoPlist}
            />
          </TabPanel>
          <TabPanel key="Home screen">
            <HomeScreen
              afterLoginPage={afterLoginPage}
              setAfterLoginPage={setAfterLoginPage}
            />
          </TabPanel>
          <TabPanel key="Menu">
            <Menu
              availableMenuItems={availableMenuItems}
              setAvailableMenuItems={setAvailableMenuItems}
            />
          </TabPanel>
          <TabPanel key="Chats">
            <Chats />
          </TabPanel>
          <TabPanel key="Visibility & Privacy">
            <Visibility
              defaultAccessAssetsOpen={defaultAccessAssetsOpen}
              setDefaultAccessAssetsOpen={setDefaultAccessAssetsOpen}
              defaultAccessProfileOpen={defaultAccessProfileOpen}
              setDefaultAccessProfileOpen={setDefaultAccessProfileOpen}
              usersCanFree={usersCanFree}
              setUsersCanFree={setUsersCanFree}
            />
          </TabPanel>
          <TabPanel key="API">
            <Api app={app} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
