import referralsImg from '../../assets/illustration.png';
import { IconCoin } from '../../components/Icons/IconCoin';

export function Referrals() {
  return (
    <div className="referrals">
      <img className="mb-32" src={referralsImg} alt="" />
      <div className="text-with-coins subtitle1 mb-32">
        Gift friends 25
        <IconCoin /> and receive 25
        <IconCoin />. Send friends invite with your personal invitation code.
      </div>
      <div className="subtitle1">Your invitation code</div>
    </div>
  );
}
