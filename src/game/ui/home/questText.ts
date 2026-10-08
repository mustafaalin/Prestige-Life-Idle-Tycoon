import { BUSINESSES } from '../../core/config/businesses';
import { CAREERS } from '../../core/config/careers';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { HOUSES } from '../../core/config/housing';
import { LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { UPGRADES } from '../../core/config/upgrades';
import type { QuestDef } from '../../core/types';
import type { MessageKey, Translator } from '../../i18n/translate';
import { managerKey, managerPortrait } from '../businesses/managers';
import type { FocusTarget } from './focus';

// How a goal reads on screen: its sentence, its picture, where in the game it's done, and which
// button "Go" points at (ui/home/focus.ts).

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));
const UPGRADE_BY_ID = new Map(UPGRADES.map((upgrade) => [upgrade.id, upgrade]));
/** The first vehicle you can buy (index 0 is the free wheelbarrow). */
const FIRST_VEHICLE = LIFESTYLE_ITEMS.filter((item) => item.kind === 'vehicle')[1];

export const upgradeNameKey = (upgradeId: string) => `upgrades.${upgradeId.replace(':', '.')}` as MessageKey;

type Words = Pick<Translator, 't' | 'name'>;

function businessName(businessId: string, { name }: Words) {
  const def = BUSINESS_BY_ID.get(businessId);
  return def ? name('business', def) : businessId;
}

export function questText(quest: QuestDef, words: Words) {
  const { t, name } = words;
  const goal = quest.goal;
  switch (goal.type) {
    case 'collect':
      return t('quests.collect', { count: goal.count });
    case 'find':
      return t('quests.find', { count: goal.count });
    case 'units': {
      const business = businessName(goal.businessId, words);
      return goal.count === 1 ? t('quests.open', { business }) : t('quests.units', { count: goal.count, business });
    }
    case 'manager':
      return t('quests.manager', { business: businessName(goal.businessId, words) });
    case 'upgrade': {
      const upgrade = UPGRADE_BY_ID.get(goal.upgradeId);
      return t('quests.upgrade', {
        business: upgrade ? businessName(upgrade.businessId, words) : '',
        upgrade: t(upgradeNameKey(goal.upgradeId)),
      });
    }
    case 'career':
      return t(goal.index === 0 ? 'quests.career' : 'quests.promote', { job: name('career', CAREERS[goal.index]) });
    case 'home':
      return t('quests.home', { home: name('lifestyle', HOUSES[goal.index]) });
    case 'class':
      return t('quests.class', { class: name('wealthClass', WEALTH_CLASSES[goal.index]) });
    case 'vehicle':
      return t('quests.vehicle');
  }
}

export interface QuestVisual {
  image: string;
  /** Photos (homes) fill the box; cut-outs sit inside it. */
  cover?: boolean;
  /** Manager portraits are round. */
  round?: boolean;
  /** Small arrow badge for upgrades. */
  upgrade?: boolean;
}

export function questVisual(quest: QuestDef): QuestVisual {
  const goal = quest.goal;
  switch (goal.type) {
    case 'collect':
      return { image: '/assets/scene/bottle-green.webp' };
    case 'find':
      return { image: '/assets/scene/sans-wallet.webp' };
    case 'units':
      return { image: BUSINESS_BY_ID.get(goal.businessId)?.image ?? '/assets/icons/business.png' };
    case 'manager':
      return { image: managerPortrait(goal.businessId), round: true };
    case 'upgrade': {
      const businessId = UPGRADE_BY_ID.get(goal.upgradeId)?.businessId ?? '';
      return { image: BUSINESS_BY_ID.get(businessId)?.image ?? '/assets/icons/business.png', upgrade: true };
    }
    case 'career':
      return { image: CAREERS[goal.index].image };
    case 'home':
      return { image: HOUSES[goal.index].image, cover: true };
    case 'class':
      return { image: '/assets/icons/prestige-points.png' };
    case 'vehicle':
      return { image: FIRST_VEHICLE.image };
  }
}

/** The button "Go" points at, or null when the goal is done on the home scene. */
export function questTarget(quest: QuestDef): FocusTarget | null {
  const goal = quest.goal;
  switch (goal.type) {
    case 'units':
      return { tab: 'businesses', key: `business:${goal.businessId}:buy` };
    case 'manager':
      return { tab: 'businesses', key: `business:${goal.businessId}:manager` };
    case 'upgrade': {
      const businessId = UPGRADE_BY_ID.get(goal.upgradeId)?.businessId ?? '';
      return { tab: 'businesses', key: `business:${businessId}:upgrade` };
    }
    case 'career':
      return { tab: 'career', key: 'career:promote' };
    case 'home':
      return { tab: 'shop', shopTab: 'house', key: 'shop:house:next' };
    case 'vehicle':
      return { tab: 'shop', shopTab: 'vehicle', key: 'shop:vehicle:next' };
    case 'collect':
    case 'find':
    case 'class':
      return null;
  }
}

/** Where the goal is done: "Businesses", "Shop › Homes", or a hint for goals on the home scene. */
export function questWhere(quest: QuestDef, { t }: Words) {
  const goal = quest.goal;
  if (goal.type === 'collect') return t('quests.hint.collect');
  if (goal.type === 'find') return t('quests.hint.find');
  if (goal.type === 'class') return t('quests.hint.class');
  const target = questTarget(quest);
  if (!target) return '';
  const tab = t(`tabs.${target.tab}` as MessageKey);
  if (target.shopTab) return `${tab} › ${t(`shop.${target.shopTab}` as MessageKey)}`;
  if (goal.type === 'manager') return `${tab} · ${t(managerKey(goal.businessId, 'name'))}`;
  return tab;
}
