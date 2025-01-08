import { Dialog, DialogPanel } from '@headlessui/react';
import { useRef, useState } from 'react';
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from 'react-image-crop';

// import './AvatarModalCropper.scss';

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const setCanvasPreview = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const pixelRatio = window.devicePixelRatio;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';
  ctx.save();

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  ctx.translate(-cropX, -cropY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
};

interface Props {
  onClose: () => void;
  image: string;
  setProfileImage: (newImage: string) => void;
}

export function AvatarModalCropper({ onClose, image, setProfileImage }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [crop, setCrop] = useState<Crop>();

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const onCrop = () => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (image && canvas && crop) {
      setCanvasPreview(
        image, // HTMLImageElement
        canvas, // HTMLCanvasElement
        convertToPixelCrop(crop, image.width, image.height)
      );
      const dataUrl = canvas.toDataURL();
      setProfileImage(dataUrl);
      onClose();
    }
  };

  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={onClose}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4">
        <div className="flex justify-center items-cente">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            circularCrop
            keepSelection
            aspect={ASPECT_RATIO}
            minWidth={MIN_DIMENSION}
          >
            <img
              ref={imgRef}
              src={image}
              alt="Upload"
              style={{ maxHeight: '70vh' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <div className="flex gap-8 mt-8">
          <button className="rounded-xl border-brand-500 border max-w-[416px] w-full text-center text-brand-500 p-2" onClick={() => onClose()}>
            Cancel
          </button>
          <button className="rounded-xl bg-brand-500 border max-w-[416px] w-full text-center text-white p-2" onClick={() => onCrop()}>
            Done
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
