import IPhoneMiniImage from '../../assets/iPhone-13Mini.png';
import AppleIcon from '../../pages/AuthPage/Icons/socials/appleIcon';
import FacebookIcon from '../../pages/AuthPage/Icons/socials/facebookIcon';
import GoogleIcon from '../../pages/AuthPage/Icons/socials/googleIcon';
import MetamaskIcon from '../../pages/AuthPage/Icons/socials/metamaskIcon';

const inputPlaceholder = ['First Name', 'Last Name', 'Email'];

interface AppearanceIphoneProps {
  color: string;
  logoImage: string;
}

export const AppearanceIphone = ({
  logoImage,
  color,
}: AppearanceIphoneProps) => {
  return (
    <div
      className=" max-w-full h-[368px] absolute top-[-40px] right-[-40px] relavite"
      // style={{ backgroundImage: `url(${IPhoneMiniImage})` }}
    >
      <img
        src={IPhoneMiniImage}
        alt="iPhone Preview"
        className="w-full h-auto object-contain"
      />
      <div className="absolute inset-4 top-[26px] px-2 rounded-xl bg-white">
        <div
          className="h-[45px] bg-cover bg-center flex justify-center items-center p-2"
          style={{ backgroundImage: '' }}
        >
          {logoImage && (
            <img
              src={logoImage}
              alt="Primary Logo"
              className="max-w-[60px] max-h-[43px] min-h-[40px] object-contain"
            />
          )}
        </div>
        <h3 className="text-[10px] text-center mb-2">Sign Up</h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border"
              style={{ borderColor: color }}
            ></div>
          ))}
        </div>
        {inputPlaceholder.map((placeholder) => (
          <input
            key={placeholder}
            type="text"
            placeholder={placeholder}
            className="w-full mb-1 text-[8px] rounded-xl bg-gray-100 py-[2px] px-1"
          />
        ))}
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
  );
};
