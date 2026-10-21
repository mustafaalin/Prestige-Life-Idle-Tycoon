import { ArrowBigUpDash, Clapperboard, Lock, Play, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BUSINESSES } from '../../../core/config/businesses';
import { SECONDS_PER_MONTH } from '../../../core/config/life';
import { branchCost, businessImage, businessStage, levelRevenue, nextLevel } from '../../../core/formulas';
import type { BusinessDef } from '../../../core/types';
import { useT } from '../../../i18n/useT';
import { levelNameKey } from '../../home/questText';
import { GameButton, ImageTile, Panel } from '../../kit';
import { managerKey, managerPortrait } from '../managers';

// Business screen draft (business-draft.html, dev server only; discussion-notes §0 "İşletmeler
// ekranı"): a short row per line, the details in a sheet on tap. Numbers come from the real config;
// the state is made up (a Middle Class player) and only lives on this page. Not part of the game.

interface Line {
  def: BusinessDef;
  level: number;
  branches: number;
  managed: boolean;
}

const pick = (id: string) => BUSINESSES.find((def) => def.id === id) as BusinessDef;

const START: Line[] = [
  { def: pick('flower-stand'), level: 15, branches: 2, managed: true },
  { def: pick('coffee-cart'), level: 11, branches: 0, managed: true },
  { def: pick('bakery'), level: 5, branches: 0, managed: false },
  { def: pick('car-wash'), level: 2, branches: 0, managed: false },
  { def: pick('mini-market'), level: 0, branches: 0, managed: false },
];
const TEASER = pick('restaurant');
const START_CASH = 260_000;
const MANAGER_COST = { bakery: 45_000, 'car-wash': 180_000 } as Record<string, number>;
const BRANCH_CAP = 3;

const monthly = (line: Line) => levelRevenue(line.def, line.level) * (1 + line.branches) * SECONDS_PER_MONTH;
const runPay = (line: Line) => levelRevenue(line.def, line.level) * (1 + line.branches);
const stageOf = (line: Line) => businessStage(line.def, Math.max(line.level, 1));

/** Three parts (stand, shop, store), five notches each: where the line is on its way up. */
function StageBar({ def, level }: { def: BusinessDef; level: number }) {
  const parts = [0, 1, 2].map((stage) => def.levels.map((step, index) => ({ step, index })).filter(({ step }) => step.stage === stage));
  return (
    <span className="flex gap-1" aria-hidden>
      {parts.map((part, stage) => (
        <span key={stage} className="flex-1 flex gap-[2px] rounded-full bg-indigo-100 p-[2px]">
          {part.map(({ index }) => (
            <span
              key={index}
              className={`flex-1 h-1.5 rounded-full ${index < level ? 'bg-gradient-to-b from-amber-300 to-orange-500' : 'bg-white'}`}
            />
          ))}
        </span>
      ))}
    </span>
  );
}

function Row({
  line,
  cash,
  onOpen,
  onBuy,
  onHire,
}: {
  line: Line;
  cash: number;
  onOpen: () => void;
  onBuy: () => void;
  onHire: () => void;
}) {
  const { t, name, money, perMonth } = useT();
  const { def, level, managed } = line;
  const opened = level > 0;
  const next = nextLevel(def, { level, branches: line.branches, managed });
  const newBuilding = opened && next !== null && next.stage > businessStage(def, level);
  const atTop = opened && next === null;
  const price = next ? next.cost : branchCost(def, line.branches);
  const canBranch = atTop && line.branches < BRANCH_CAP;
  const hireCost = MANAGER_COST[def.id] ?? Infinity;
  const managerReady = opened && !managed && cash >= hireCost;
  const [bubbles, setBubbles] = useState<number[]>([]);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (!opened || managed || running) return;
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      const id = Date.now();
      setBubbles((list) => [...list, id]);
      window.setTimeout(() => setBubbles((list) => list.filter((item) => item !== id)), 900);
    }, def.cycleSeconds * 1000);
  };

  return (
    <Panel accent={managerReady} className="relative p-2.5 flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={managed || !opened ? onOpen : run}
        className="relative shrink-0 transition-all active:scale-95"
        aria-label={t('business.run')}
      >
        <ImageTile className="w-[68px] h-[68px] relative">
          <img
            src={businessImage(def, Math.max(level, 1))}
            alt=""
            draggable={false}
            className={`w-[60px] h-[60px] object-contain ${opened ? '' : 'grayscale opacity-60'}`}
          />
          {opened && !managed && (
            <span className="absolute inset-x-1 bottom-1 h-1.5 rounded-full bg-white/80 overflow-hidden">
              <span
                className="block h-full bg-gradient-to-r from-emerald-400 to-green-500"
                style={{ width: running ? '100%' : '0%', transition: running ? `width ${def.cycleSeconds}s linear` : 'none' }}
              />
            </span>
          )}
        </ImageTile>
        {bubbles.map((id) => (
          <span
            key={id}
            className="v2-float-up pointer-events-none absolute left-1/2 top-0 whitespace-nowrap v2-display v2-outline-thin text-[14px] text-emerald-400 tabular-nums"
          >
            +{money(runPay(line))}
          </span>
        ))}
        {opened && managed && (
          <span className="absolute z-10 -left-2 -bottom-2 flex items-center rounded-full border-2 border-white bg-gradient-to-b from-violet-400 to-indigo-600 pr-1.5 v2-display text-[10px] text-white shadow">
            <img src={managerPortrait(def.id, 'old')} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-0.5 mr-0.5" />
            OTO
          </span>
        )}
        {opened && !managed && !running && (
          <span className="v2-nudge absolute z-10 left-1/2 -bottom-2 flex items-center gap-0.5 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy pl-1 pr-2 v2-display text-[11px] text-white v2-shadow">
            <Play className="w-3 h-3 fill-white" />
            {t('business.run')}
          </span>
        )}
      </button>

      <button type="button" onClick={onOpen} className="flex-1 min-w-0 flex flex-col gap-1 text-left">
        <span className="flex items-center gap-1 min-w-0">
          <span className="v2-display text-[16px] leading-tight text-indigo-950 truncate">{name('business', def)}</span>
          {opened && <Clapperboard className="shrink-0 w-3.5 h-3.5 text-orange-400" aria-label="Reklam teklifi var" />}
        </span>
        {opened ? (
          <>
            <span className="text-[11px] font-bold text-indigo-700 truncate">
              {t(levelNameKey(def.id, level))} · {level}/{def.levels.length}
              {line.branches > 0 ? ` · ${t('business.branches', { count: line.branches })}` : ''}
            </span>
            <span className={`whitespace-nowrap text-[12px] font-black ${managed ? 'text-emerald-600' : 'text-violet-600'}`}>
              {perMonth(monthly(line) / SECONDS_PER_MONTH)}
              {!managed && <span className="text-[10px] font-bold text-violet-500"> · yöneticiyle</span>}
            </span>
            <StageBar def={def} level={level} />
          </>
        ) : (
          <span className="text-[12px] font-bold text-emerald-600">
            {t('business.openIncome', { amount: perMonth(levelRevenue(def, 1)) })}
          </span>
        )}
      </button>

      <div className="shrink-0 flex flex-col items-end gap-1">
        {(next || canBranch) && (
          <GameButton
            tone={newBuilding ? 'gold' : 'buy'}
            disabled={cash < price}
            onClick={onBuy}
            className="relative w-[92px] py-1.5 px-2 flex flex-col items-center leading-tight"
          >
            {newBuilding && (
              <span className="absolute -top-2 -right-1.5 rounded-full border-2 border-white bg-gradient-to-b from-rose-400 to-rose-600 px-1 v2-display text-[10px] text-white">
                ×2
              </span>
            )}
            <span className="flex items-center gap-1 v2-display text-[12px] v2-shadow">
              {next ? opened ? <ArrowBigUpDash className="w-4 h-4" /> : null : <Store className="w-3.5 h-3.5" />}
              {next ? (opened ? (newBuilding ? 'Yeni bina' : t('business.levelUp')) : t('business.open')) : 'Şube'}
            </span>
            <span className="v2-display text-[13px] v2-shadow tabular-nums">{money(price)}</span>
          </GameButton>
        )}
        {atTop && !canBranch && <span className="text-[10px] font-black text-indigo-900/50">{t('business.branchCapFull')}</span>}
        {cash < price && (next || canBranch) && (
          <span className="text-[10px] font-bold text-indigo-900/50 tabular-nums">{money(price - cash)} eksik</span>
        )}
      </div>

      </div>

      {/* A line without a manager says who could run it, right on the row (user, 2026-10-21). */}
      {opened && !managed && (
        <div className={`flex items-center gap-2 rounded-2xl px-2 py-1.5 ${managerReady ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-violet-50'}`}>
          <img src={managerPortrait(def.id, 'old')} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="v2-display text-[13px] text-violet-700 truncate">{t(managerKey(def.id, 'name', 'old'))}</p>
            <p className="text-[10px] font-bold text-violet-600/80">Senin yerine çalıştırır, sen yokken de kazanır</p>
          </div>
          <GameButton
            tone={managerReady ? 'gold' : 'manager'}
            disabled={!managerReady}
            onClick={onHire}
            className="shrink-0 py-1 px-2.5 flex flex-col items-center leading-tight"
          >
            <span className="v2-display text-[11px] v2-shadow">İşe al</span>
            <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(hireCost)}</span>
          </GameButton>
        </div>
      )}
    </Panel>
  );
}

function Details({ line, cash, onClose, onBuy, onHire }: { line: Line; cash: number; onClose: () => void; onBuy: () => void; onHire: () => void }) {
  const { t, name, money } = useT();
  const { def, level, managed } = line;
  const next = nextLevel(def, { level, branches: line.branches, managed });
  const runNow = runPay(line);
  const runNext = next ? next.revenue * (1 + line.branches) : runNow;
  const managerName = t(managerKey(def.id, 'name', 'old'));
  const hireCost = MANAGER_COST[def.id] ?? 0;
  const stageAt = def.levels.findIndex((step, index) => index >= level && step.stage > stageOf(line));

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-black/35" onClick={onClose}>
      <div
        className="v2-sheet-in w-full max-h-[85%] overflow-y-auto rounded-t-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 p-4 flex flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <ImageTile className="w-24 h-24">
            <img src={businessImage(def, Math.max(level, 1))} alt="" className="w-[88px] h-[88px] object-contain" />
          </ImageTile>
          <div className="flex-1 min-w-0">
            <p className="v2-display text-xl text-indigo-950">{name('business', def)}</p>
            <p className="text-[12px] font-bold text-indigo-700">
              {t(levelNameKey(def.id, Math.max(level, 1)))} · {t('business.level', { level, max: def.levels.length })}
            </p>
            <div className="mt-1.5">
              <StageBar def={def} level={level} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="self-start p-1.5 rounded-full bg-white/70 active:scale-90">
            <X className="w-5 h-5 text-indigo-700" />
          </button>
        </div>

        {next && (
          <Panel className="p-3 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-indigo-900/70">
              Sıradaki seviye: <span className="text-indigo-950">{t(levelNameKey(def.id, level + 1))}</span>
            </p>
            <p className="text-[12px] font-bold text-indigo-900/70">{t('business.nextRun', { from: money(runNow), to: money(runNext) })}</p>
            {stageAt === level ? (
              <p className="text-[11px] font-black text-amber-600">Yeni bina · tur ×{Math.round(runNext / runNow)}</p>
            ) : (
              stageAt > 0 && (
                <p className="text-[11px] font-bold text-amber-600">
                  {t('business.nextStage', { level: stageAt + 1, name: t(levelNameKey(def.id, stageAt + 1)) })}
                </p>
              )
            )}
            <GameButton
              tone={stageAt === level && level > 0 ? 'gold' : 'buy'}
              disabled={cash < next.cost}
              onClick={onBuy}
              className="py-2.5 px-3 flex items-center justify-between"
            >
              <span className="v2-display text-[14px] v2-shadow">{level > 0 ? t('business.levelUp') : t('business.open')}</span>
              <span className="v2-display text-[14px] v2-shadow tabular-nums">{money(next.cost)}</span>
            </GameButton>
          </Panel>
        )}

        {level > 0 && (
          <Panel className="p-3 flex items-center gap-2.5">
            <img src={managerPortrait(def.id, 'old')} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
            <div className="flex-1 min-w-0">
              <p className="v2-display text-[14px] text-violet-700">{managerName}</p>
              <p className="text-[11px] font-bold leading-snug text-violet-700/80">
                {managed ? t(managerKey(def.id, 'line1', 'old')) : t('business.managerHint', { name: managerName })}
              </p>
            </div>
            {!managed && (
              <GameButton tone="manager" disabled={cash < hireCost} onClick={onHire} className="shrink-0 py-1.5 px-2.5 flex flex-col leading-tight">
                <span className="v2-display text-[12px] v2-shadow">{t('business.manager')}</span>
                <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(hireCost)}</span>
              </GameButton>
            )}
          </Panel>
        )}

        {next === null && level > 0 && (
          <Panel className="p-3 flex flex-col gap-1">
            <p className="text-[12px] font-bold text-indigo-900/70">{t('business.branchesCap', { count: line.branches, cap: BRANCH_CAP })}</p>
            <p className="text-[11px] font-bold text-emerald-600">{t('business.branchRun', { amount: money(levelRevenue(def, level)) })}</p>
          </Panel>
        )}

        {level > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="v2-display text-[12px] uppercase tracking-wide text-indigo-900/50 px-1">Reklamla</p>
            {[
              !managed && 'Geçici yönetici · 30 dk',
              'Kampanya ×2 · 10 dk',
              next && `Biraz yardım · +${money(Math.min(next.cost, 20_000))}`,
            ]
              .filter(Boolean)
              .map((label) => (
                <GameButton key={String(label)} tone="ad" className="py-2 px-3 flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" />
                  <span className="v2-display text-[13px] v2-shadow">{label}</span>
                </GameButton>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BusinessDraft() {
  const { money, name } = useT();
  const [lines, setLines] = useState(START);
  const [cash, setCash] = useState(START_CASH);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = lines.find((line) => line.def.id === openId) ?? null;

  // Managed lines earn while the page is open, so buttons light up as in the game.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCash((value) => value + lines.filter((line) => line.managed).reduce((sum, line) => sum + runPay(line), 0) / 4);
    }, 250);
    return () => window.clearInterval(timer);
  }, [lines]);

  const update = (id: string, change: (line: Line) => Line) => setLines((list) => list.map((line) => (line.def.id === id ? change(line) : line)));
  const buy = (line: Line) => {
    const next = nextLevel(line.def, line);
    const price = next ? next.cost : branchCost(line.def, line.branches);
    if (cash < price) return;
    setCash((value) => value - price);
    update(line.def.id, (current) => (next ? { ...current, level: current.level + 1 } : { ...current, branches: current.branches + 1 }));
  };
  const hire = (line: Line) => {
    const price = MANAGER_COST[line.def.id] ?? 0;
    if (cash < price) return;
    setCash((value) => value - price);
    update(line.def.id, (current) => ({ ...current, managed: true }));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1A1446]">
      <div className="absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-indigo-100 shadow-2xl overflow-hidden">
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500">
          <h2 className="flex-1 v2-display v2-outline-thin text-xl text-white">İşletmeler</h2>
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 v2-display text-[14px] text-white tabular-nums">{money(cash)}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 bg-gradient-to-b from-sky-100 to-indigo-100">
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-1.5 text-[12px] font-bold text-indigo-900">
            <span className="v2-display text-amber-600">Hedef</span>
            <span className="flex-1 truncate">Fırın'ı 6. seviyeye çıkar</span>
            <span className="tabular-nums text-indigo-900/50">5/6</span>
          </div>
          {lines.map((line) => (
            <Row
              key={line.def.id}
              line={line}
              cash={cash}
              onOpen={() => setOpenId(line.def.id)}
              onBuy={() => buy(line)}
              onHire={() => hire(line)}
            />
          ))}
          <div className="rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-2.5 flex items-center gap-2.5">
            <ImageTile className="w-12 h-12">
              <img src={TEASER.image} alt="" className="w-10 h-10 object-contain grayscale opacity-40" />
            </ImageTile>
            <p className="flex-1 v2-display text-[15px] text-indigo-900/50 truncate">{name('business', TEASER)}</p>
            <Lock className="w-4 h-4 text-indigo-900/40" />
          </div>
        </div>
      </div>
      {open && (
        <Details
          line={open}
          cash={cash}
          onClose={() => setOpenId(null)}
          onBuy={() => buy(open)}
          onHire={() => hire(open)}
        />
      )}
    </div>
  );
}
