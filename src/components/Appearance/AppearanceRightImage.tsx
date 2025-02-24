import classNames from 'classnames';
import BG from '../../assets/_BG.png';
import SafariImage from '../../assets/safari.png';
import AppleIcon from '../../pages/AuthPage/Icons/socials/appleIcon';
import FacebookIcon from '../../pages/AuthPage/Icons/socials/facebookIcon';
import GoogleIcon from '../../pages/AuthPage/Icons/socials/googleIcon';
import MetamaskIcon from '../../pages/AuthPage/Icons/socials/metamaskIcon';
import { AppearanceIphone } from './AppearanceIphone';

interface AppearanceRightImageProps {
  color: string;
  tagline: string;
  logoImage: string;
}
export const AppearanceRightImage = ({
  color,
  tagline,
  logoImage,
}: AppearanceRightImageProps) => {
  return (
    <div className="w-full appearance-right flex justify-center items-center overflow-hidden relative">
      <div className="relative">
        <div
          className={classNames(
            'bg-center bg-cover relative',
            'w-[469px] h-[285px]'
          )}
          style={{ backgroundImage: `url(${SafariImage})` }}
        >
          <div className="absolute w-full h-[262px]  bg-white bottom-0">
            <div
              className="w-full grid grid-cols-[2fr,_3fr] place-items-center h-full bg-preview bg-cover px-[20px]"
              style={{ backgroundImage: `url(${BG})` }}
            >
              <div className="max-w-[170px]">
                {logoImage && (
                  <img
                    src={logoImage}
                    alt="Primary Logo"
                    className="max-w-[80px] max-h-[63px] min-h-[40px] object-contain"
                  />
                )}
                <p className="break-words">{tagline}</p>
              </div>
              <div
                className={classNames(
                  'bg-white rounded-xl p-3',
                  '2xl:w-[220px] 2xl:h-[220px], xl:w-[180px] xl:h-[180px]'
                )}
              >
                <h3 className="text-[10px] text-center mb-2">Sign Up</h3>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="border" style={{ borderColor: color }}></div>
                  <div className="border" style={{ borderColor: color }}></div>
                  <div className="border" style={{ borderColor: color }}></div>
                </div>
                <div className="flex gap-3 mb-1">
                  <input
                    readOnly
                    type="text"
                    value="Gloria"
                    className="w-1/2 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
                  />
                  <input
                    readOnly
                    type="text"
                    value="Mayer"
                    className="w-1/2 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
                  />
                </div>
                <input
                  readOnly
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
        <AppearanceIphone color={color} logoImage={logoImage} />
      </div>
    </div>
  );
};
