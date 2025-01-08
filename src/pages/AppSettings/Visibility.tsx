import { RadioGroup } from '@headlessui/react';
import { RadioButton } from '../../components/RadioButton';

interface Props {
  defaultAccessAssetsOpen: boolean;
  setDefaultAccessAssetsOpen: (on: boolean) => void;
  defaultAccessProfileOpen: boolean;
  setDefaultAccessProfileOpen: (on: boolean) => void;
  usersCanFree: boolean;
  setUsersCanFree: (on: boolean) => void;
}

export function Visibility({
  defaultAccessAssetsOpen,
  setDefaultAccessAssetsOpen,
  defaultAccessProfileOpen,
  setDefaultAccessProfileOpen,
  usersCanFree,
  setUsersCanFree,
}: Props) {
  return (
    <div className="">
      <div className="font-sans text-sm">
        These are the default permissions to be applied to all Users created in
        your App. 
      </div>
      <div className="font-sans text-sm mb-8">
        Keep the recommended settings if you are not sure and you can come back
        to this later.
      </div>
      <div className="text-base font-semibold font-sans mb-2">
        Profiles Visibility
      </div>
      <p className="text-gray-500 text-sm font-sans">
        By default, User profiles can be viewed by any other Users and bots
        after they follow a correct link, a QR code or tap on it in the Chat. 
      </p>
      <p className="text-gray-500 text-sm font-sans mb-4">
        For tighter security and business logic driven sharing, you can disable
        this. Your Users will still be able to share their profiles with others,
        but they will have to do it explicitly via a special sharing link. 
      </p>

      <RadioGroup
        value={defaultAccessProfileOpen}
        onChange={setDefaultAccessProfileOpen}
        className="flex flex-col mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label="User Profiles can be viewed by others"
        />
        <RadioButton
          className="mb-2"
          value={false}
          label="User Profiles need to be explicitly shared by the User for others to see"
        />
      </RadioGroup>

      <div className="text-base font-semibold font-sans mb-2">
        Assets Visibility
      </div>
      <div className="text-gray-500 text-sm font-sans">
        Assets are Documents, Files, Media, Tokens (depending on what your App
        supports), stored within Users wallets.
      </div>
      <div className="text-gray-500 text-sm font-sans">
        Depending on your App settings, Users either upload/create Assets
        themselves or these are managed by your own business logic via API.
      </div>
      <div className="text-gray-500 text-sm font-sans">
        By default, other Users can see one’s Assets in one’s Profile. 
      </div>
      <div className="text-gray-500 text-sm font-sans mb-4">
        Alternative, more restricted setting, is where Assets are hidden.
        Profile will only display items such as name, photo, description, but no
        Assets. Users will still be able to share their Assets with others, but
        they will have to do it explicitly via a special sharing link,
        individually for each Asset.
      </div>
      <RadioGroup
        value={defaultAccessAssetsOpen}
        onChange={setDefaultAccessAssetsOpen}
        className="flex flex-col mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label="All User’s Assets can be viewed by all who can view User’s Profile"
        />
        <RadioButton
          className="mb-2"
          value={false}
          label="User’s Assets are hidden. User has to explicitly share each Asset
            individually via a sharing link for others to see."
        />
      </RadioGroup>

      <div className="text-base font-semibold font-sans mb-2">
        App-locked accounts
      </div>
      <div className="text-gray-500 text-sm font-sans">
        By default, your User accounts are App locked. This means that your
        Users can NOT sign on into other Apps within your Organization or any
        other Apps within the Server.
      </div>
      <div className="text-gray-500 text-sm font-sans mb-4">
        You may switch this setting to Unlocked if you want your Users to have
        self-sovereign accounts which makes them free to login into other Apps
        in the Server, discover their content and fully control their own
        account.
      </div>
      <RadioGroup
        value={usersCanFree}
        onChange={setUsersCanFree}
        className="mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label="All User accounts are tied to your App"
        />
        <RadioButton
          className="mb-2"
          value={false}
          label="User accounts are unlocked (self-sovereign)"
        />
      </RadioGroup>
    </div>
  );
}
