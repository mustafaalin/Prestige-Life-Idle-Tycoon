/** Square picture of a shop item. Homes are photos and fill the square; other items are cut-outs. */
export function Thumb({ image, cover, dim }: { image: string; cover?: boolean; dim?: boolean }) {
  return (
    <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
      <img
        src={image}
        alt=""
        className={`${cover ? 'w-full h-full object-cover object-[center_30%]' : 'w-14 h-14 object-contain'} ${
          dim ? 'grayscale opacity-40' : ''
        }`}
        draggable={false}
      />
    </div>
  );
}
