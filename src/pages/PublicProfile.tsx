import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { ProfilePageUserIcon } from '../components/ProfilePageUserIcon';
import { getPublicProfile } from '../http';
import './PublicProfile.scss';

export function PublicProfile() {
  const [inited, setInited] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [_, setDescription] = useState('');

  const { address } = useParams();

  useEffect(() => {
    getPublicProfile(address as string).then((resp) => {
      setInited(true);
      const { firstName, lastName, description, profileImage } = resp.data;
      setFirstName(firstName);
      setLastName(lastName);
      setProfileImage(profileImage);
      setDescription(description);
    });
  }, []);

  if (!inited) {
    return <Loading />;
  }

  return (
    <div className="public-profile">
      <div className="content">
        <ProfilePageUserIcon
          firstName={firstName}
          lastName={lastName}
          profileImage={profileImage}
        ></ProfilePageUserIcon>
        <div className="h2 name">{`${firstName} ${lastName}`}</div>
      </div>
    </div>
  );
}
