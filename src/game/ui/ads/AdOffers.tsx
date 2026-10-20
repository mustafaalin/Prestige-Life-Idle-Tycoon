import type { AdPlacement } from '../../core/config/ads';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { payout } from '../home/coins';
import { AdButton } from './AdButton';

// The two shapes every new ad place takes (docs/monetization-v2.md §4): one pays money (coins fly to
// the wallet), the other changes something (time, a stand-in manager). The place decides whether its
// button is on screen; these only run the ad and the reward.

/** An ad that pays: `run` grants the reward and returns what it added to the wallet. */
export function PayAd({
  placement,
  label,
  run,
  className = '',
}: {
  placement: AdPlacement;
  label: string;
  run: () => number;
  className?: string;
}) {
  const { money } = useT();
  return (
    <AdButton
      placement={placement}
      className={className}
      onReward={() => {
        const amount = run();
        if (amount <= 0) return;
        playSfx('reward');
        haptic('medium');
        payout({ amount, label: `+${money(amount)}`, count: 10 });
      }}
    >
      {label}
    </AdButton>
  );
}

/** An ad that changes something: `run` grants it and says whether it went through. */
export function ActionAd({
  placement,
  label,
  run,
  className = '',
}: {
  placement: AdPlacement;
  label: string;
  run: () => boolean;
  className?: string;
}) {
  return (
    <AdButton
      placement={placement}
      className={className}
      onReward={() => {
        if (!run()) return;
        playSfx('levelUp');
        haptic('medium');
      }}
    >
      {label}
    </AdButton>
  );
}
