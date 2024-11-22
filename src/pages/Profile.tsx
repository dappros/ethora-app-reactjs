import { useEffect, useState } from "react";
import { IconEdit } from "../components/Icons/IconEdit";
import { IconQr } from "../components/Icons/IconQr";
import { useAppStore } from "../store/useAppStore";
import { ModelCurrentUser } from "../models";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../http";
import { actionLogout } from "../actions";
import { ProfilePageUserIcon } from "../components/ProfilePageUserIcon";
import { IconLogout } from "../components/Icons/IconLogout";

export default function Profile() {
  const [showQr, setShowQr] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const {
    firstName,
    lastName,
    profileImage,
    description,
    defaultWallet: { walletAddress },
  } = useAppStore((s) => s.currentUser as ModelCurrentUser);

  const navigate = useNavigate();

  const componentGetDocs = async () => {
    let { data } = await getDocuments(walletAddress);
    // @ts-ignore
    let items = data.results.filter((el) => el.locations[0]);
    setDocuments(items);
  };

  useEffect(() => {
    componentGetDocs();
  }, []);

  const onLogout = () => {
    actionLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 flex flex-col justify-between items-stretch md:items-center md:flex-row">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Profile
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 h-full grid grid-rows-[72px,_1fr] overflow-hidden">
        <div className="flex justify-end">
          <button className="mr-4" onClick={() => setShowQr(true)}>
            <IconQr />
          </button>
          <button onClick={() => navigate('/app/profile/edit')}>
            <IconEdit />
          </button>
        </div>
        <div className="flex justify-center">
          <div className="max-w-[800px] w-full flex px-[16px] flex-col gap-8">
            <div className="">
              <ProfilePageUserIcon
                firstName={firstName}
                lastName={lastName}
                profileImage={profileImage}
              />
            </div>
            <div>
              <p className="text-center font-varela text-[24px]">{`${firstName} ${lastName}`}</p>
              <p className="text-center font-sans text-[16px] text-[#8C8C8C]">Online / Offline</p>
            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4">
              <p className="text-[#8C8C8C] font-sans text-[14px] mb-2">About</p>
              <p className="text-black text-regular">Voluptatem aut 🚀</p>
            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4">

            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4 text-center">
              <button
                className="text-[#F44336] font-varela text-regular inline-flex items-center"
                onClick={() => onLogout()}
              >
                <IconLogout />
                <span className="ml-2">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
