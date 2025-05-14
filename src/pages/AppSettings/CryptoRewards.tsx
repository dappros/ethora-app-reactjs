import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@mui/material';

interface Props {
  coinName: string;
  setCoinName: (s: string) => void;
}

export function CryptoRewards({ coinName, setCoinName }: Props) {
  return (
    <>
      <div className="appearance-left">
        <div className="flex items-center mb-4">
          <div className="font-sans font-semibold text-base">Coin Name</div>
          <Tooltip
            title="The name of the in-app currency or token used for transactions and rewards."
            arrow
            placement="top"
          >
            <HelpOutlineIcon
              sx={{ width: '20px', height: '20px' }}
              className=" ml-2 text-gray-500 cursor-pointer"
            />
          </Tooltip>
        </div>
        <input
          placeholder="Enter Coin Name"
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        />
      </div>
    </>
  );
}
