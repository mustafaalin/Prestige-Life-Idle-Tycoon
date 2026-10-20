import { Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  EVENT_BOLD_CHANCE,
  EVENT_CARDS,
  EVENT_FIRST_MAX_SECONDS,
  EVENT_FIRST_MIN_SECONDS,
  EVENT_MAX_SECONDS,
  EVENT_MIN_SECONDS,
  type EventOutcome,
} from '../../core/config/events';
import { awaitsHandover, eventCardsFor, eventReward } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx, useMusic } from '../../runtime/feedback';
import { pendingCeremony, sceneClass } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { holdBalance, payout, spillCoins } from '../home/coins';
import { GameButton } from '../kit';
import { EVENT_AD_MULTIPLIER } from '../../core/config/ads';
import { canWatch, eventAdExtra } from '../../runtime/adRewards';
import { AdButton } from '../ads/AdButton';
import { useAdText } from '../ads/useAdText';
import { eventKey, eventSpeaker, onEventCardRequest } from './eventScript';
import { portalRoot } from '../stage';

// Event cards (game-design §4.7): from Middle Class on, someone the hero knows calls every few
// minutes. The call waits on the home scene until it is answered; the card asks one thing and has a
// safe and a bold answer; a bold one that fails costs money, and the button says how much before the
// player chooses. The timers live here and start over with each session, like Şans's finds;
// only the time of the last answer is saved, so reopening the game does not bring a call sooner.

const random = (min: number, max: number) => min + Math.random() * (max - min);

interface EventCardsProps {
  /** A tab is open: the call keeps waiting but is not shown over the sheet. */
  tabOpen: boolean;
  /** A card is on screen (story moments wait for it). */
  onOpenChange: (open: boolean) => void;
}

export function EventCards({ tabOpen, onOpenChange }: EventCardsProps) {
  const { game, state } = useGameV2();
  const { t } = useT();
  const cards = eventCardsFor(game, sceneClass(game, state.story));
  const enabled = cards.length > 0 && !awaitsHandover(game);

  /** The card whose caller is waiting. */
  const [calling, setCalling] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  /** The open card is answered and paid: it stays up until collected, whatever else is waiting. */
  const [answered, setAnswered] = useState(false);
  /** Answered cards this session: the first call comes quickly, and each answer starts the next wait. */
  const [round, setRound] = useState(0);
  const lastCard = useRef<string | null>(null);
  // Read by the timer when it fires, so the choice is made from the cards open at that moment.
  const cardIds = useRef<string[]>([]);
  const answeredAt = useRef(0);
  useEffect(() => {
    cardIds.current = cards.map((card) => card.id);
    answeredAt.current = state.story.eventAnsweredAt;
  });

  const ring = () => {
    // Never the same caller twice in a row (unless only one can call).
    const others = cardIds.current.filter((id) => id !== lastCard.current);
    const pool = others.length > 0 ? others : cardIds.current;
    if (pool.length === 0) return;
    const id = pool[Math.floor(Math.random() * pool.length)];
    lastCard.current = id;
    setCalling(id);
  };

  useEffect(() => {
    if (!enabled || calling) return;
    const wait = random(EVENT_MIN_SECONDS, EVENT_MAX_SECONDS);
    // A session's first call comes quickly, but never sooner than the wait since the last answer.
    const sinceAnswer = Math.max(0, (Date.now() - answeredAt.current) / 1000);
    const seconds =
      round === 0 ? Math.max(random(EVENT_FIRST_MIN_SECONDS, EVENT_FIRST_MAX_SECONDS), wait - sinceAnswer) : wait;
    const timer = window.setTimeout(ring, seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [enabled, calling, round]);

  // The dev menu rings any card, also before Middle Class.
  useEffect(
    () =>
      onEventCardRequest(() => {
        if (cardIds.current.length === 0) cardIds.current = EVENT_CARDS.map((card) => card.id);
        ring();
      }),
    [],
  );

  useEffect(() => onOpenChange(open), [open, onOpenChange]);

  // A ceremony, the offline card or the end of life come first; the caller waits behind them.
  const quiet = pendingCeremony(game, state.story) !== null || state.offline !== null || awaitsHandover(game);
  const showsCall = calling !== null && !quiet && !open && !tabOpen;
  // The phone rings once when the call button appears.
  useEffect(() => {
    if (showsCall) playSfx('ring');
  }, [showsCall, calling]);
  if (!calling || (quiet && !answered)) return null;

  if (open) {
    return (
      <EventCard
        cardId={calling}
        onLater={() => setOpen(false)}
        onAnswered={() => setAnswered(true)}
        onDone={() => {
          setOpen(false);
          setAnswered(false);
          setCalling(null);
          setRound((value) => value + 1);
        }}
      />
    );
  }

  if (tabOpen) return null;
  const caller = eventSpeaker(calling, 'ask');
  return (
    <div className="absolute inset-x-0 bottom-3 flex justify-center">
      <button
        type="button"
        onClick={() => {
          playSfx('click');
          haptic('light');
          setOpen(true);
        }}
        className="pointer-events-auto v2-pop-in transition-transform active:scale-95"
      >
        <span className="v2-ring flex items-center gap-2 rounded-full bg-gradient-to-b from-violet-400 to-indigo-600 border-2 border-white v2-glossy pl-1 pr-3.5 py-1 shadow-xl">
          <span className="relative">
            <span className="v2-pulse-ring absolute left-1/2 top-1/2 w-full aspect-square rounded-full border-4 border-violet-300" />
            <img
              src={caller.portrait}
              alt=""
              draggable={false}
              className="relative w-11 h-11 rounded-full object-cover border-2 border-white"
            />
          </span>
          <span className="v2-display text-[15px] text-white v2-shadow whitespace-nowrap">
            {t('events.calling', { name: t(caller.name) })}
          </span>
          <Phone className="w-4 h-4 text-white" />
        </span>
      </button>
    </div>
  );
}

interface EventCardProps {
  cardId: string;
  onLater: () => void;
  onAnswered: () => void;
  onDone: () => void;
}

function EventCard({ cardId, onLater, onAnswered, onDone }: EventCardProps) {
  const { game, state, actions } = useGameV2();
  const adText = useAdText();
  const { t, money } = useT();
  const [outcome, setOutcome] = useState<EventOutcome | null>(null);
  // Settled the moment the card is answered (negative: a loss); the top bar shows it once the card is
  // closed, so the coins and the red amount land where the player is looking.
  const [amount, setAmount] = useState(0);
  useEffect(() => () => holdBalance(0), []);
  useMusic('event');
  const speaker = eventSpeaker(cardId, outcome ?? 'ask');

  const answer = (bold: boolean) => {
    const result: EventOutcome = !bold ? 'safe' : Math.random() < EVENT_BOLD_CHANCE ? 'win' : 'lose';
    playSfx(result === 'lose' ? 'click' : 'levelUp');
    haptic('medium');
    const paid = actions.answerEvent(cardId, result);
    holdBalance(paid);
    setAmount(paid);
    onAnswered();
    setOutcome(result);
  };

  const collect = () => {
    if (!outcome) return;
    holdBalance(0);
    if (amount < 0) {
      // A loss: the coins leave the wallet instead of arriving.
      playSfx('loss');
      haptic('light');
      spillCoins({ count: 6, label: `−${money(-amount)}` });
      onDone();
      return;
    }
    playSfx('payout');
    haptic('medium');
    payout({ amount, label: `+${money(amount)}`, count: 12 });
    onDone();
  };
  const lost = outcome === 'lose';

  // Android back: let the call wait, or collect once it is answered.
  useBackButton(true, 70, outcome ? collect : onLater);

  const titles: Record<EventOutcome, string> = {
    safe: t('events.safeTitle'),
    win: t('events.winTitle'),
    lose: t('events.loseTitle'),
  };

  // Portaled to <body>, like the reward card, so it covers the bars as well.
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6">
      <div key={lost ? 'lost' : 'card'} className={`${lost ? 'v2-flinch' : 'v2-pop-in'} w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden`}>
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-500">
          <img
            key={speaker.portrait}
            src={speaker.portrait}
            alt=""
            draggable={false}
            className="v2-pop-in w-16 h-16 rounded-full object-cover border-[3px] border-white shadow"
          />
          <p className="flex-1 v2-display v2-outline-thin text-xl text-white">{t(speaker.name)}</p>
          <Phone className="w-5 h-5 text-white/90" />
        </div>

        <div className="px-4 pt-4 pb-5">
          {/* The safe answer needs no comment from the caller: the question stays up. */}
          <div className="rounded-[20px] rounded-tl-md bg-slate-50 border-2 border-violet-100 px-4 py-3">
            <p key={outcome ?? 'ask'} className="v2-line-in text-[16px] font-bold leading-snug text-slate-800">
              {t(eventKey(cardId, outcome === 'win' || outcome === 'lose' ? outcome : 'ask'))}
            </p>
          </div>

          {outcome === null ? (
            <div className="mt-4 flex flex-col gap-2.5">
              <GameButton tone="buy" onClick={() => answer(false)} className="w-full px-3 py-2.5 text-center">
                <span className="block v2-display text-[16px] v2-shadow [text-wrap:balance]">{t(eventKey(cardId, 'safe'))}</span>
                <span className="block text-[11px] font-black text-white/90 tabular-nums [text-wrap:balance]">
                  {t('events.sure', {
                    amount: money(eventReward(game, 'safe')),
                  })}
                </span>
              </GameButton>
              <GameButton tone="gold" onClick={() => answer(true)} className="w-full px-3 py-2.5 text-center">
                <span className="block v2-display text-[16px] v2-shadow [text-wrap:balance]">{t(eventKey(cardId, 'bold'))}</span>
                {/* The stake is spelled out before the choice: the win, and the loss in red. */}
                <span className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[11px] font-black text-white/90 tabular-nums">
                  <span>
                    {t('events.chance', {
                      chance: Math.round(EVENT_BOLD_CHANCE * 100),
                      win: money(eventReward(game, 'win')),
                    })}
                  </span>
                  <span className="rounded-full bg-rose-600/90 px-2 py-px text-white">
                    {t('events.risk', { lose: money(-eventReward(game, 'lose')) })}
                  </span>
                </span>
              </GameButton>
            </div>
          ) : (
            <div className="mt-3 text-center">
              <h2 className="v2-display text-xl text-slate-900">{titles[outcome]}</h2>
              <p
                className={`v2-display v2-outline text-[40px] leading-tight tabular-nums my-1 ${
                  lost ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {lost ? `−${money(Math.abs(amount))}` : `+${money(amount)}`}
              </p>
              {/* An ad pays the result again, or takes a loss back and pays the safe answer. */}
              {canWatch(state.ads, 'event_bonus', Date.now()) && (
                <AdButton
                  placement="event_bonus"
                  className="mt-2"
                  onReward={() => {
                    const extra = actions.ads.eventBonus(outcome);
                    holdBalance(0);
                    // What the card ends at: its result and the ad's extra (after a loss, the safe answer).
                    const total = Math.max(0, amount + extra);
                    if (total > 0) {
                      playSfx('payout');
                      haptic('medium');
                      payout({ amount: total, label: `+${money(total)}`, count: 12 });
                    }
                    onDone();
                  }}
                >
                  {lost
                    ? adText('ads.eventSecondChance', { amount: money(eventAdExtra(game, outcome)) })
                    : adText('ads.double', { amount: money(amount * EVENT_AD_MULTIPLIER), factor: EVENT_AD_MULTIPLIER })}
                </AdButton>
              )}
              {lost ? (
                <GameButton tone="soft" onClick={collect} className="w-full mt-2 py-3 v2-display text-lg">
                  {t('events.loseOk')}
                </GameButton>
              ) : (
                <GameButton tone="buy" onClick={collect} className="w-full mt-2 py-3 v2-display text-lg v2-shadow">
                  {t('common.collect')}
                </GameButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}
