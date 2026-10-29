import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { DESKTOP_SCREEN, PHONE_SCREEN } from './deviceScreens';

const BROWSER_W = 600;
const BROWSER_CHROME_H = 30;
const BROWSER_SCREEN_H = Math.round(
  (DESKTOP_SCREEN.height * BROWSER_W) / DESKTOP_SCREEN.width
);
const DESKTOP_VIRTUAL_W = DESKTOP_SCREEN.width;

const PHONE_W = 196;
const PHONE_BEZEL = 7;
const PHONE_SCREEN_W = PHONE_W - PHONE_BEZEL * 2;
const PHONE_VIRTUAL_W = PHONE_SCREEN.width;
const PHONE_VIRTUAL_H = PHONE_SCREEN.height;
const PHONE_SCREEN_H = Math.round(
  (PHONE_VIRTUAL_H * PHONE_SCREEN_W) / PHONE_VIRTUAL_W
);
const PHONE_H = PHONE_SCREEN_H + PHONE_BEZEL * 2;

const PHONE_OVERLAP = 84;
const PHONE_DROP = 36;
const STAGE_W = BROWSER_W + PHONE_W - PHONE_OVERLAP;
const STAGE_H = Math.max(
  BROWSER_CHROME_H + BROWSER_SCREEN_H,
  PHONE_DROP + PHONE_H
);

function useFitScale(naturalWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      if (available > 0) setScale(Math.min(1, available / naturalWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [naturalWidth]);

  return { ref, scale };
}

function ScaledScreen({
  width,
  height,
  virtualWidth,
  children,
}: {
  width: number;
  height: number;
  virtualWidth: number;
  children: ReactNode;
}) {
  const k = width / virtualWidth;
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: virtualWidth,
          height: height / k,
          transform: `scale(${k})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BrowserFrame({
  url,
  dark,
  children,
}: {
  url: string;
  dark: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-xl"
      style={{
        width: BROWSER_W,
        border: `1px solid ${dark ? '#2a2d35' : '#d9dde3'}`,
        background: dark ? '#0f1115' : '#ffffff',
      }}
    >
      <div
        className="flex items-center gap-3 px-3"
        style={{
          height: BROWSER_CHROME_H,
          background: dark ? '#1f2228' : '#eef0f3',
          borderBottom: `1px solid ${dark ? '#2a2d35' : '#d9dde3'}`,
        }}
      >
        <div className="flex gap-1.5 shrink-0">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="flex-1 min-w-0 truncate rounded-md px-2 text-center text-[10px] leading-[18px] font-sans"
          style={{
            background: dark ? '#2a2d35' : '#ffffff',
            color: dark ? '#9aa1b2' : '#6b7280',
          }}
        >
          {url}
        </div>
        <div className="w-[42px] shrink-0" />
      </div>
      <ScaledScreen
        width={BROWSER_W}
        height={BROWSER_SCREEN_H}
        virtualWidth={DESKTOP_VIRTUAL_W}
      >
        {children}
      </ScaledScreen>
    </div>
  );
}

function PhoneFrame({
  dark,
  children,
}: {
  dark: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="relative shadow-2xl"
      style={{
        width: PHONE_W,
        height: PHONE_H,
        padding: PHONE_BEZEL,
        borderRadius: 34,
        background: '#111318',
        border: `1px solid ${dark ? '#3a3e48' : '#2a2d35'}`,
      }}
    >
      <div className="overflow-hidden" style={{ borderRadius: 27 }}>
        <ScaledScreen
          width={PHONE_SCREEN_W}
          height={PHONE_SCREEN_H}
          virtualWidth={PHONE_VIRTUAL_W}
        >
          {children}
        </ScaledScreen>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
        style={{ top: PHONE_BEZEL + 6, width: 52, height: 15 }}
      />
    </div>
  );
}

// A status bar for phone screens, drawn at the phone's virtual size.
export function PhoneStatusBar({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-between shrink-0 font-sans font-semibold"
      style={{ height: 54, padding: '18px 32px 0', fontSize: 16, color }}
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg
          width="18"
          height="12"
          viewBox="0 0 18 12"
          fill={color}
          aria-hidden="true"
        >
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg
          width="26"
          height="12"
          viewBox="0 0 26 12"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="3"
            stroke={color}
            opacity="0.5"
          />
          <rect x="2" y="2" width="19" height="8" rx="2" fill={color} />
          <rect
            x="24"
            y="4"
            width="2"
            height="4"
            rx="1"
            fill={color}
            opacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
}

export function DevicePreviewStage({
  url,
  dark,
  desktop,
  phone,
}: {
  url: string;
  dark: boolean;
  desktop: ReactNode;
  phone: ReactNode;
}) {
  const { ref, scale } = useFitScale(STAGE_W);
  return (
    <div
      ref={ref}
      className="relative w-full min-w-0"
      style={{ height: STAGE_H * scale }}
    >
      <div
        className="absolute top-0 left-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          marginLeft: -STAGE_W / 2,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="absolute left-0 top-0">
          <BrowserFrame url={url} dark={dark}>
            {desktop}
          </BrowserFrame>
        </div>
        <div className="absolute right-0" style={{ top: PHONE_DROP }}>
          <PhoneFrame dark={dark}>{phone}</PhoneFrame>
        </div>
      </div>
    </div>
  );
}
