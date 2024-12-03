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
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { IconDoc } from "../components/Icons/IconDoc";
import { DateTime } from "luxon";
import { QrModal } from "../components/modal/QrModal";
import { CreateDocumentModal } from "../components/modal/CreateDocumentModal";

export default function Profile() {
  // @ts-ignore
  const [showQr, setShowQr] = useState(false);
  // @ts-ignore
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  // @ts-ignore
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
      <div className="rounded-2xl bg-white px-4 h-full grid grid-rows-[72px,_1fr]">
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
              <p className="text-black text-regular">{description}</p>
            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4">
                <TabGroup className="px-2">
                  <TabList className="h-[44px] flex mb-4">
                    <Tab key="documents" className="border-b border-b-[#F0F0F0] w-1/2 data-[selected]:text-brand-500 data-[selected]:border-b-brand-500">
                      Documents
                    </Tab>
                    <Tab key="collections" className="border-b border-b-[#F0F0F0] w-1/2 data-[selected]:text-brand-500 data-[selected]:border-b-brand-500 pointer-events-none text-gray-300">
                      Collections
                    </Tab>
                  </TabList>
                  <TabPanels className="">
                    <TabPanel key="">
                      <button
                        onClick={() => setShowNewDocModal(true)}
                        className="w-full bg-brand-500 text-white py-4 font-varela text-[16px] rounded-xl mb-4"
                      >
                        Add Document
                      </button>
                      {documents.map((el) => (
                        <div className="bg-[#F3F6FC] rounded-lg p-2 mb-4 flex" key={el._id}>
                          <div className="w-[40px] h-[40px] bg-white rounded-lg flex items-center justify-center">
                            <IconDoc />
                          </div>
                          <div className="ml-2">
                            <div className="text-[14px]">{el.documentName}</div>
                            <div className="text-[#8C8C8C] text-[12px]">
                              {DateTime.fromISO(el.createdAt).toFormat(
                                'dd LLL yyyy t'
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabPanel>
                    <TabPanel key="collections">collections</TabPanel>
                  </TabPanels>
                </TabGroup>

            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4 text-center mb-8">
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
      {showQr && (
        <QrModal
          path={`${window.location.origin}/public/${walletAddress}`}
          onClose={() => setShowQr(false)}
        />
      )}
      {showNewDocModal && (
        <CreateDocumentModal
          componentGetDocs={componentGetDocs}
          onClose={() => setShowNewDocModal(false)}
        />
      )}
    </div>
  )
}
