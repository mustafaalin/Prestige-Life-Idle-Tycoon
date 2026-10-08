import { ImageTile } from '../kit';

/** Square picture of a shop item. Homes are photos and fill the square; other items are cut-outs. */
export function Thumb({
  image,
  cover,
  dim,
  large,
}: {
  image: string;
  cover?: boolean;
  dim?: boolean;
  large?: boolean;
}) {
  return (
    <ImageTile className={large ? 'w-20 h-20' : 'w-16 h-16'}>
      <img
        src={image}
        alt=""
        className={`${cover ? 'w-full h-full object-cover object-[center_30%]' : large ? 'w-[72px] h-[72px] object-contain' : 'w-14 h-14 object-contain'} ${
          dim ? 'grayscale opacity-40' : ''
        }`}
        draggable={false}
      />
    </ImageTile>
  );
}
