import Image, { StaticImageData } from 'next/image';
import React, { FC } from 'react';

type BackgroundImageProps = {
  src: StaticImageData;
  alt?: string;
};

const BackgroundImage: FC<BackgroundImageProps> = ({ src, alt }) => {
  return (
    <div className="absolute left-0 top-0 -z-1 size-full">
      <Image fill className="size-full object-cover object-center" src={src} alt={alt || ''} />
    </div>
  );
};

export default BackgroundImage;
