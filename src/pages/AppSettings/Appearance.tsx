import { useRef } from 'react';

import hexToRgba from 'hex-to-rgba';
import { actionPostFile } from '../../actions';
import BG from '../../assets/_BG.png';
import IPhoneMiniImage from '../../assets/iPhone-13Mini.png';
import SafariImage from '../../assets/safari.png';
import { PopoverColorPicker } from '../../components/PopoverColorPicker';
import AppleIcon from '../AuthPage/Icons/socials/appleIcon';
import FacebookIcon from '../AuthPage/Icons/socials/facebookIcon';
import GoogleIcon from '../AuthPage/Icons/socials/googleIcon';
import MetamaskIcon from '../AuthPage/Icons/socials/metamaskIcon';

interface Props {
  displayName: string;
  setDisplayName: (s: string) => void;
  tagline: string;
  setTagline: (s: string) => void;
  coinName: string;
  setCoinName: (s: string) => void;
  color: string;
  setColor: (c: string) => void;
  logoImage: string;
  setLogoImage: (s: string) => void;
  sublogoImage: string;
  setSublogoImage: (s: string) => void;
}

export function Appearance({
  displayName,
  setDisplayName,
  tagline,
  setTagline,
  coinName,
  setCoinName,
  color,
  setColor,
  setLogoImage,
  setSublogoImage,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const sublogoRef = useRef<HTMLInputElement>(null);

  const onChangeColor = (color: string) => {
    console.log('color ', color);
    document.documentElement.style.setProperty(
      '--bg-brand-preview-auth',
      hexToRgba(color, '0.05')
    );
    setColor(color);
  };

  const postLogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) =>
      setLogoImage(resp.data.results[0].location)
    );
  };

  const postSublogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) =>
      setSublogoImage(resp.data.results[0].location)
    );
  };

  return (
    // settings-appearance
    // grid-rows-2 md:grid-cols-[1fr_minmax(500px,_1fr)] gap-[40px] p-4
    <>
      <div className="appearance-left">
        <div className="font-sans font-semibold text-base mb-4">Display Name</div>
        <input
          placeholder="Enter App's Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
        />
        <div className="font-sans font-semibold text-base mb-4">Tagline</div>
        <input
          placeholder="Enter Tagline of Your App"
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <div className="font-sans font-semibold text-base mb-4">Coin Name</div>
        <input
          placeholder="Enter Coin Name"
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        />
        <div className="font-sans font-semibold text-base mb-4">Color</div>
        <div className="mb-4">
          <PopoverColorPicker color={color} onChange={onChangeColor} />
        </div>
        <div className="font-sans font-semibold text-base mb-4">Logo</div>
        <div className="flex items-center mb-2">
          <span className="font-sans font-semibold text-base">Primary Logo</span>
          <span className="text-xs inline-block ml-auto text-gray-500">
            (Recommended size: 500px x 500px)
          </span>
        </div>
        <input
          type="file"
          onChange={(e) => postLogo(e.target.files && e.target.files[0])}
          ref={logoRef}
          className="hidden"
          id="logo-file"
        />
        <button
          onClick={() => logoRef.current?.click()}
          className="w-full p-2 border border-brand-500 rounded-xl text-brand-500 mb-4 text-[16px] font-varela"
        >
          Add logo
        </button>

        <div className="flex items-center mb-2">
          <p className="mr-2 font-sans font-semibold text-base">Submark logo</p>
          <div className="text-xs inline-block text-gray-500">(optional)</div>
        </div>
        <input
          type="file"
          ref={sublogoRef}
          className="hidden"
          onChange={(e) => postSublogo(e.target.files && e.target.files[0])}
        />
        <button
          onClick={() => sublogoRef.current?.click()}
          className="w-full p-2 border border-brand-500 rounded-xl text-brand-500 mb-4 text-[16px] font-varela"
        >
          Add logo
        </button>
      </div>
      <div className="appearance-right flex justify-center items-center overflow-hidden">
        <div className="relative ">
          <div
            className="w-[469px] h-[285px] bg-center bg-cover relative"
            style={{ backgroundImage: `url(${SafariImage})` }}
          >
            <div className="absolute w-full h-[262px]  bg-white bottom-0">
              <div
                className="w-full grid grid-cols-[2fr,_3fr] place-items-center h-full bg-preview bg-cover px-[48px]"
                style={{ backgroundImage: `url(${BG})` }}
              >
                <div className="">{tagline}</div>
                <div className=" w-[220px] h-[220px] bg-white rounded-xl p-3">
                  <h3 className="text-[10px] text-center mb-2">Sign Up</h3>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div
                      className="border"
                      style={{ borderColor: color }}
                    ></div>
                    <div
                      className="border"
                      style={{ borderColor: color }}
                    ></div>
                    <div
                      className="border"
                      style={{ borderColor: color }}
                    ></div>
                  </div>
                  <div className="flex gap-3 mb-1">
                    <input
                      type="text"
                      value="Gloria"
                      className="w-1/2 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
                    />
                    <input
                      type="text"
                      value="Mayer"
                      className="w-1/2 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
                    />
                  </div>
                  <input
                    type="text"
                    value="GloriaMayer@gmail.com"
                    className="w-full mb-1 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
                  />
                  <button
                    className="w-full text-white text-[8px] py-[3px] rounded-xl mb-2"
                    style={{ backgroundColor: color }}
                  >
                    Sign Up
                  </button>
                  <div className="text-[6px] mb-2">
                    <span>
                      By clicking the "Sign Up" button, you agree to our
                    </span>
                    <span>Terms & Conditions.</span>
                  </div>
                  <button
                    className="border w-full rounded-xl py-[3px] text-[9px] mb-2 flex align-center justify-center"
                    style={{ borderColor: color, color: color }}
                  >
                    <div className="mr-2">
                      <GoogleIcon width={10} height={10} />
                    </div>
                    <span>Continue with Google</span>
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                      style={{ borderColor: color, color: color }}
                    >
                      <FacebookIcon width={12} height={12} />
                    </button>
                    <button
                      className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                      style={{ borderColor: color, color: color }}
                    >
                      <AppleIcon width={12} height={12} />
                    </button>
                    <button
                      className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                      style={{ borderColor: color, color: color }}
                    >
                      <MetamaskIcon width={12} height={12} />
                    </button>
                  </div>
                  <div className="text-[8px] text-center text">
                    <span className="mr-1">Already have an account?</span>
                    <a href="#" style={{ color: color }}>
                      Sign In
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-[191px] h-[368px] absolute top-[-40px] right-[-40px] relavite"
            style={{ backgroundImage: `url(${IPhoneMiniImage})` }}
          >
            <div className="absolute inset-4 top-[26px] px-2 rounded-xl bg-white">
              <div
                className="h-[43px] bg-cover bg-center"
                style={{ backgroundImage: '' }}
              ></div>
              <h3 className="text-[10px] text-center mb-2">Sign Up</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="border" style={{ borderColor: color }}></div>
                <div className="border" style={{ borderColor: color }}></div>
                <div className="border" style={{ borderColor: color }}></div>
              </div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full mb-1 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full mb-1 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
              />
              <input
                type="text"
                placeholder="Email"
                className="w-full mb-1 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
              />
              <button
                className="w-full text-white text-[8px] py-[3px] rounded-xl mb-2"
                style={{ backgroundColor: color }}
              >
                Sign Up
              </button>
              <div className="text-[6px] mb-2">
                <div className="text-center color-gray-500">
                  By clicking the "Sign Up" button, you agree to our
                </div>
                <div className="text-center" style={{ color: color }}>
                  Terms & Conditions.
                </div>
              </div>
              <div className="text-center color text-[6px] mb-2">or</div>
              <button
                className="border w-full rounded-xl py-[3px] text-[9px] mb-2 flex align-center justify-center"
                style={{ borderColor: color, color: color }}
              >
                <div className="mr-2">
                  <GoogleIcon width={10} height={10} />
                </div>
                <span>Continue with Google</span>
              </button>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                  style={{ borderColor: color, color: color }}
                >
                  <FacebookIcon width={12} height={12} />
                </button>
                <button
                  className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                  style={{ borderColor: color, color: color }}
                >
                  <AppleIcon width={12} height={12} />
                </button>
                <button
                  className="border rounded-xl py-[4px] text-[9px] mb-1 flex justify-center"
                  style={{ borderColor: color, color: color }}
                >
                  <MetamaskIcon width={12} height={12} />
                </button>
              </div>
              <div className="text-[8px] text-center text">
                <span className="mr-1">Already have an account?</span>
                <a href="#" style={{ color: color }}>
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
