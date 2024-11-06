import { useParams } from 'react-router-dom';
import { useAppStore } from '../../../store/useAppStore';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../../actions';
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

  return (
    <div className="app-content-body-page">
      <div className="app-content-body-header">
        <div className="left">Settings</div>
        <div className="right">
          <button onClick={onSave} className="gen-secondary-btn medium">
            Save
          </button>
        </div>
      </div>
      <TabGroup className="admin-app-settings">
        <TabList className="tabs min-w-40 w-full max-w-[276px]">
          <Tab key="Appearance">Appearance</Tab>
          <Tab key="Sign-on options">Sign-on options</Tab>
          <Tab key="Web app">Web app</Tab>
          <Tab key="Mobile app">Mobile app</Tab>
          <Tab key="Home screen">Home screen</Tab>
          <Tab key="Menu">Menu</Tab>
          <Tab key="Chats">Chats</Tab>
          <Tab key="Visibility & Privacy">Visibility & Privacy</Tab>
          <Tab key="API">API</Tab>
        </TabList>
        <TabPanels className="tabs-content">
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
