import { useEffect, useRef, useState } from 'react';
import { AD_SKILL_LEVELS } from '../../core/config/ads';
import { SKILLS } from '../../core/config/skills';
import { canTrainSkill, nextSkillAsk, skillBank, skillBankFull, skillLevel, skillProgressShare, trainingLeft } from '../../core/formulas';
import type { SkillDef, SkillId } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { canGiveSkillLevels } from '../../runtime/adRewards';
import { useGameV2 } from '../../runtime/useGameV2';
import { ActionAd } from '../ads/AdOffers';
import { Focusable } from '../home/Focusable';
import { ICONS } from '../icons';
import { GameButton, ImageTile, Panel, SectionLabel } from '../kit';

// The "Me" tab (docs/game-design-v2.md §4.15): the hero's skills. One trains at a time and goes on
// level after level by itself; the levels it trains wait here (at most SKILL_BANK_MAX, then it holds)
// until the player collects them, which is when they count. The round button plays or pauses a
// skill; a rewarded ad next to it gives the training skill two levels. Each card says what the skill
// is needed for next.

const SKILL_ICON: Record<SkillId, string> = { strength: ICONS.skillStrength, smarts: ICONS.skillSmarts, charisma: ICONS.skillCharisma };

/** How long one rising icon lives (matches .v2-run-bubble in mobile.css). */
const POP_MS = 1100;

export function SelfScreen() {
  const { game } = useGameV2();
  const { t } = useT();
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('skills.title')}</SectionLabel>
      {SKILLS.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
      {game.training === null && <p className="px-1 text-[11px] font-bold text-slate-500">{t('skills.idle')}</p>}
    </section>
  );
}

function SkillCard({ skill }: { skill: SkillDef }) {
  const { game, state, actions } = useGameV2();
  const { t, name, duration } = useT();
  const now = Date.now();
  const level = skillLevel(game, skill.id);
  const bank = skillBank(game, skill.id);
  const training = game.training === skill.id;
  const full = skillBankFull(game, skill.id);
  const share = skillProgressShare(game, skill.id);
  const next = nextSkillAsk(game, skill.id);
  const atTop = !canTrainSkill(game, skill.id);

  // Collected levels rise from the picture as the skill's icon with "+2 Lv", like a business run's pay.
  const [pops, setPops] = useState<{ id: number; levels: number }[]>([]);
  const nextPop = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const pop = (levels: number) => {
    const id = nextPop.current++;
    setPops((list) => [...list.slice(-2), { id, levels }]);
    timers.current.push(window.setTimeout(() => setPops((list) => list.filter((item) => item.id !== id)), POP_MS));
  };

  const toggle = () => {
    if (!(training ? actions.stopTraining() : actions.startTraining(skill.id))) return;
    playSfx('click');
    haptic('light');
  };
  const collect = () => {
    const levels = actions.collectSkill(skill.id);
    if (levels <= 0) return;
    playSfx('levelUp');
    haptic('medium');
    pop(levels);
  };
  const adLevels = () => {
    if (!actions.ads.skillLevels(skill.id)) return false;
    pop(AD_SKILL_LEVELS);
    return true;
  };

  return (
    <Panel accent={training} className="p-3 flex items-center gap-3">
      <div className="relative shrink-0">
        <ImageTile className="w-14 h-14">
          <img src={SKILL_ICON[skill.id]} alt="" draggable={false} className="w-11 h-11 object-contain drop-shadow" />
        </ImageTile>
        <span className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" aria-hidden>
          {pops.map((item) => (
            <span
              key={item.id}
              className="v2-run-bubble absolute top-0 flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-white/95 pl-0.5 pr-1.5 shadow-md"
            >
              <img src={SKILL_ICON[skill.id]} alt="" draggable={false} className="w-5 h-5 object-contain" />
              <span className="v2-display text-[11px] text-violet-600 tabular-nums">{t('skills.collectLevels', { count: item.levels })}</span>
            </span>
          ))}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="v2-display text-[16px] leading-tight text-indigo-950">
          {t(`skills.names.${skill.id}`)}
          <span className="ml-1.5 text-[13px] text-violet-600 tabular-nums">{t('skills.level', { level })}</span>
        </p>
        <p className="text-[11px] font-bold leading-snug text-slate-500">{t(`skills.acts.${skill.id}`)}</p>
        {!atTop && (share > 0 || training) && (
          <>
            <div className="mt-1 h-2 rounded-full bg-violet-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  training ? 'bg-gradient-to-r from-violet-400 to-indigo-500' : 'bg-slate-300'
                }`}
                style={{ width: `${(full ? 1 : share) * 100}%` }}
              />
            </div>
            <p className="mt-0.5 text-[11px] font-bold text-slate-500 tabular-nums">
              {full
                ? t('skills.full')
                : training
                  ? t('skills.left', { time: duration(Math.ceil(trainingLeft(game, skill.id))) })
                  : t('skills.paused')}
            </p>
          </>
        )}
        {atTop && bank === 0 ? (
          <p className="text-[11px] font-bold text-emerald-600">{t('skills.max')}</p>
        ) : (
          next && (
            <p className="text-[11px] font-bold leading-snug text-violet-600">
              {t('skills.next', { level: next.level, job: name('career', next.career) })}
            </p>
          )
        )}
      </div>
      <Focusable focusKey={[`skill:${skill.id}:train`, `skill:${skill.id}:collect`]} className="shrink-0 flex flex-col items-end gap-1.5">
        {bank > 0 && (
          <GameButton onClick={collect} className="py-1.5 px-2.5 flex flex-col items-center leading-tight">
            <span className="v2-display text-[13px]">{t('skills.collect')}</span>
            <span className="v2-display text-[11px] tabular-nums">{t('skills.collectLevels', { count: bank })}</span>
          </GameButton>
        )}
        {/* The ad sits next to the play button of the skill it speeds up. */}
        <div className="flex items-start gap-1.5">
          {training && canGiveSkillLevels(state, skill.id, now) && (
            <ActionAd placement="skill_levels" small label={t('ads.skillLevels', { count: AD_SKILL_LEVELS })} run={adLevels} />
          )}
          {!atTop && (
            <GameButton
              tone={training ? 'soft' : 'buy'}
              onClick={toggle}
              aria-label={training ? t('skills.pause') : t('skills.train')}
              className="w-11 h-11 !rounded-full flex items-center justify-center"
            >
              {training ? <PauseGlyph /> : <PlayGlyph />}
            </GameButton>
          )}
        </div>
      </Focusable>
    </Panel>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 ml-0.5 drop-shadow" aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 7 4.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <rect x="5.5" y="4" width="4.5" height="16" rx="1.5" fill="currentColor" />
      <rect x="14" y="4" width="4.5" height="16" rx="1.5" fill="currentColor" />
    </svg>
  );
}
