import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { HOUSES } from '../../core/config/housing';
import { VEHICLES } from '../../core/config/lifestyle';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { useCoverFit } from './coverFit';
import { poseBox, spriteBox, spriteFilter, vehicleStyle } from './place';
import { classLook, FEET_Y, heroLook, homeArt, vehicleArt, vehicleBox } from './stages';

// Scene lab (DEV menu): every home with one vehicle in front of it, drawn by the same rules as the
// scene, with the stage's lines on top. New art is checked here before it is tuned on the phone.
// Red: what bars and narrow phones hide. Blue: the ground lines of the car, the bike and the feet.

const SAFE_X = [0.12, 0.88];
const TOP_BAR_Y = 0.15;
const MENU_Y = 0.9;

function Stage({ houseId, vehicleId }: { houseId: string; vehicleId: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const fit = useCoverFit(ref);
  const home = homeArt(houseId);
  const vehicle = vehicleId ? vehicleArt(vehicleId) : null;
  const box = vehicle ? vehicleBox(vehicle, home.layout) : null;
  const light = spriteFilter(home.light);
  const hero = heroLook(0, houseId).idle;
  const sans = classLook(0).sans;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#0d1530]">
      <img
        src={home.background}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {fit.width > 0 && (
        <>
          {vehicle && box && (
            <img
              src={vehicle.src}
              alt=""
              draggable={false}
              className="absolute"
              style={{ ...vehicleStyle(fit, box), filter: light }}
            />
          )}
          <img src={hero.src} alt="" draggable={false} className="absolute" style={{ ...poseBox(fit, hero, home.castX), filter: light }} />
          <img src={sans.src} alt="" draggable={false} className="absolute" style={{ ...spriteBox(fit, sans, home.castX), filter: light }} />

          <span className="absolute inset-x-0 top-0 bg-rose-500/25" style={{ height: fit.y(TOP_BAR_Y) }} />
          <span className="absolute inset-x-0 bottom-0 bg-rose-500/25" style={{ top: fit.y(MENU_Y) }} />
          {SAFE_X.map((x) => (
            <span key={x} className="absolute inset-y-0 w-px bg-rose-500" style={{ left: fit.x(x) }} />
          ))}
          {[home.layout.car.y, home.layout.near.y, FEET_Y].map((y) => (
            <span key={y} className="absolute inset-x-0 h-px bg-sky-400" style={{ top: fit.y(y) }} />
          ))}
        </>
      )}
      {box && box.fit < 1 && (
        <span className="absolute left-1 top-1 rounded-lg bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
          ×{box.fit.toFixed(2)}
        </span>
      )}
    </div>
  );
}

export function SceneLab({ onClose }: { onClose: () => void }) {
  const { t, name } = useT();
  const [vehicleId, setVehicleId] = useState<string | null>(VEHICLES[0].id);
  const [zoomed, setZoomed] = useState<string | null>(null);
  useBackButton(true, 210, onClose);
  useBackButton(zoomed !== null, 220, () => setZoomed(null));

  return (
    <div className="fixed inset-0 z-[210] flex flex-col bg-slate-900 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-xl font-black text-white">{t('dev.sceneLab')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="p-1.5 rounded-full hover:bg-white/10 transition-all active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-2">
        {[null, ...VEHICLES].map((vehicle) => (
          <button
            key={vehicle?.id ?? 'none'}
            type="button"
            onClick={() => setVehicleId(vehicle?.id ?? null)}
            className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-black transition-all active:scale-95 ${
              vehicleId === (vehicle?.id ?? null)
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {vehicle ? name('lifestyle', vehicle) : t('dev.labNoVehicle')}
          </button>
        ))}
      </div>
      <p className="px-4 pb-2 text-[11px] font-semibold text-slate-400">{t('dev.labHint')}</p>

      <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto px-4 pb-4 sm:grid-cols-6">
        {HOUSES.map((house) => (
          <button
            key={house.id}
            type="button"
            onClick={() => setZoomed(house.id)}
            className="flex flex-col gap-1 transition-all active:scale-[0.98]"
          >
            <span className="relative block w-full aspect-[9/16] overflow-hidden rounded-xl">
              <Stage houseId={house.id} vehicleId={vehicleId} />
            </span>
            <span className="text-[10px] font-black text-slate-300">{name('lifestyle', house)}</span>
          </button>
        ))}
      </div>

      {zoomed && (
        <button
          type="button"
          onClick={() => setZoomed(null)}
          aria-label={t('common.close')}
          className="fixed inset-0 z-[220]"
        >
          <Stage houseId={zoomed} vehicleId={vehicleId} />
        </button>
      )}
    </div>
  );
}
