import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from '@headlessui/react';
import { useRef, useState } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { IconCamera } from './Icons/IconCamera';
import { IconDelete } from './Icons/IconDelete';
import { IconEdit } from './Icons/IconEdit';
import { IconMedia } from './Icons/IconMedia';
import { AvatarModalCropper } from './modal/AvatarModalCropper';
import './ProfilePageUserIcon.scss';
import cn from "classnames"
import { sha256 } from 'js-sha256'


function getColorFromString(str: string) {
  const colors = "#ec1254, #f27c14, #f5e31d, #1ee8b6, #26a1d5, #f7093b, #f5cf1d, #2cd27e, #3ae5e7, #9c1ae7, #570bb7, #d042f8, #2edbef, #3aefb6, #f10983, #0acb10, #b8f331, #fae534, #fb9605, #fc3d11, #ab20d9, #2cc2d8, #34e5b5, #faf218, #f534b3, #d61173, #fb5cab, #52c1fa, #178bd5, #f5ed16, #fb8318, #fca53e, #fe0557, #2bcaf8, #095fee, #fc123e, #fddc23, #21f0a9, #1bd1f8, #750ed5, #fc0c8e, #fd8a1a, #fde334, #acfb13, #21d1fd, #ee0f58, #fb7a08, #fdf12f, #36e8f3, #8b1df2".split(", ")
  return colors[(parseInt(sha256(str).slice(0, 2), 16) % colors.length)]
}

interface Props {
  editMode?: boolean;
  profileImage: string;
  firstName: string;
  lastName: string;
  setProfileImage?: (image: string) => void;
  width?: string;
  height?: string;
  className?: string;
  small?: boolean
}

export function ProfilePageUserIcon({
  editMode = false,
  profileImage,
  setProfileImage = () => {},
  width = '120px',
  height = '120px',
  className = '',
  firstName,
  lastName,
  small
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const onMenuPhotoClick = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files) {
      const file = files[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      setFileInputKey((key) => key + 1);
    }
  };

  let innerStyle: any = {};

  if (profileImage) {
    innerStyle.backgroundImage = `url('${profileImage}')`;
  } else {
    innerStyle.backgroundColor = 'white';
  }

  innerStyle.width = width;
  innerStyle.height = height;

  if (!profileImage) {
    const color = getColorFromString(`${firstName} ${lastName}`)
    innerStyle.backgroundColor = color
    return (
      <div className='flex justify-center items-center' >
        <div className="border border-brand-500 rounded-full flex items-center justify-center" style={innerStyle}>
          <span className={cn("font-varela font-semibold", {"text-[18px]": small, "text-[50px]": !small})}>{firstName.toUpperCase()[0]}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("profile-user-icon", className)}>
      <input
        key={fileInputKey}
        ref={fileRef}
        onChange={onFileInputChange}
        accept="image/*"
        className="hidden"
        type="file"
      />
      <div className="inner" style={innerStyle}>
        {editMode && (
          <div className="dimmed">
            <Menu>
              <MenuButton>
                <IconEdit stroke="white" pathClassName="none" />
              </MenuButton>
              <MenuItems
                anchor="bottom start"
                className="profile-icon-menu-items"
              >
                <MenuItem>
                  <button className="pointer-events-none text-gray-300" onClick={() => {}}>
                    <span>Make photo</span>
                    <IconCamera />
                  </button>
                </MenuItem>
                <MenuSeparator className="separator" />
                <MenuItem>
                  <button onClick={onMenuPhotoClick}>
                    <span>Choose photo</span>
                    <IconMedia />
                  </button>
                </MenuItem>
                <MenuSeparator className="separator" />
                <MenuItem>
                  <button onClick={() => setProfileImage('')}>
                    <span>Delete</span>
                    <IconDelete />
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        )}
      </div>
      {imageSrc && (
        <AvatarModalCropper
          setProfileImage={setProfileImage}
          image={imageSrc}
          onClose={() => setImageSrc('')}
        />
      )}
    </div>
  );
}
