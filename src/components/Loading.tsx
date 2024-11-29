import './Loading.scss';

export function Loading({style}:{style?: string}) {
  return (
    <div className={`loading ${style}`}>
      <span className="loader"></span>
    </div>
  );
}
