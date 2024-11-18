import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUpdateApp } from '../../actions';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import { ModelApp } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { Appearance } from './Appearance';
import { SignonOptions } from './SignonOptions';
import { WebApp } from './WebApp';

export function AppSettings() {
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
    <div className="h-full grid grid-rows-[1fr,_57px] md:grid-rows-[57px,_1fr] gap-y-[16px]">
      <div className="row-start-2 border-b-0 md:row-start-1 flex w-full md:justify-between items-center md:border-b border-b-gray-200">
        <div className="ml-4 hidden md:block font-varela text-[24px]">
          Settings
        </div>
        <div className="flex w-full md:w-auto items-center">
          <button onClick={onExternalClick} className="mr-4">
            <IconExternalLink color={app.primaryColor} />
          </button>
          <button
            onClick={onSave}
            className="border border-brand-500 w-full md:w-[184px] p-2 rounded-xl text-brand-500"
          >
            Save
          </button>
        </div>
      </div>
      <TabGroup className="grid here h-full overflow-hidden grid-rows-[46px,_1fr] gap-y-[16px] md:grid-rows-1 md:grid-cols-[308px,_1fr]">
        <TabList className="flex flex-row md:flex-col hide-scroll md:mb-0  border-b border-gray-200 md:px-4 md:border-b-0 overflow-auto  md:border-r md:border-gray-200">
          <div className="md:border-b md:mb-2 md:border-gray-200">
            <Tab
              className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 md:py-3 whitespace-nowrap md:min-w-[115px] md:data-[selected]:border-b-0 md:rounded-xl md:mb-2 md:w-full md:px-4 md:text-left md:text-base md:hover:bg-gray-100 md:data-[selected]:bg-brand-100"
              key="Appearance"
            >
              Appearance
            </Tab>
          </div>
          <div className="lg:border-b md:mb-2 lg:border-gray-200">
            <Tab
              className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 md:py-3 whitespace-nowrap md:min-w-[115px] md:data-[selected]:border-b-0 lg:rounded-xl md:mb-2 md:w-full md:px-4 md:text-left md:text-base md:hover:bg-gray-100 md:data-[selected]:bg-brand-100"
              key="Sign-on options"
            >
              Sign-on options
            </Tab>
          </div>
          <div className="lg:border-b md:mb-2 lg:border-gray-200">
            <Tab
              className="py-[10px] border-b-brand-500 px-[8px] data-[selected]:border-b data-[selected]:text-brand-500 md:py-3 whitespace-nowrap md:min-w-[115px] md:data-[selected]:border-b-0 lg:rounded-xl md:mb-2 md:w-full md:px-4 md:text-left md:text-base md:hover:bg-gray-100 md:data-[selected]:bg-brand-100"
              key="Web app"
            >
              Web app
            </Tab>
          </div>
        </TabList>
        <TabPanels className="h-full">
          <TabPanel
            key="Appearance"
            className="grid grid-rows-[auto,_368px] lg:grid-rows-1 lg:gap-x-[40px] lg:grid-cols-[416px,_1fr] md:ml-4 h-full "
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
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
