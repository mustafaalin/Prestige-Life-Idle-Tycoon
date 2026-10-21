import { businessDef } from '../../core/economy/business';
import { careerDef } from '../../core/config/careers';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { courseDef } from '../../core/config/courses';
import { HOUSES } from '../../core/config/housing';
import { LIFESTYLE_ITEMS, VEHICLES } from '../../core/config/lifestyle';
import type { Requirement } from '../../core/types';
import type { Translator } from '../../i18n/translate';
import type { FocusTarget } from '../home/focus';

// How a condition reads and where its "Go" leads (ui/career/Requirements.tsx draws the list).

const ITEM_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));

export type Words = Pick<Translator, 't' | 'name'>;

/** The sentence for one condition ("Master Dishwasher", "Driving License"). */
export function requirementText(requirement: Requirement, words: Words): string {
  const { t, name } = words;
  switch (requirement.type) {
    case 'mastered': {
      const career = careerDef(requirement.careerId);
      return t('requirement.mastered', { job: career ? name('career', career) : requirement.careerId });
    }
    case 'vehicle':
      return t('requirement.vehicle', { vehicle: name('lifestyle', VEHICLES[requirement.index]) });
    case 'managers':
      return t('requirement.managers', { count: requirement.count });
    case 'course': {
      const course = courseDef(requirement.courseId);
      return t('requirement.course', { course: course ? name('course', course) : requirement.courseId });
    }
    case 'item': {
      const item = ITEM_BY_ID.get(requirement.itemId);
      return t('requirement.item', { item: item ? name('lifestyle', item) : requirement.itemId });
    }
    case 'home':
      return t('requirement.home', { home: name('lifestyle', HOUSES[requirement.index]) });
    case 'class':
      return t('requirement.class', { class: name('wealthClass', WEALTH_CLASSES[requirement.index]) });
    case 'businessLevel': {
      const def = businessDef(requirement.businessId);
      return t('requirement.businessLevel', { business: def ? name('business', def) : requirement.businessId, level: requirement.level });
    }
    case 'anyOf':
      return requirement.options.map((option) => requirementText(option, words)).join(t('requirement.or'));
  }
}

/** Where a condition is worked on, or null when it just takes time (a job's mastery, a class). */
export function requirementTarget(requirement: Requirement): FocusTarget | null {
  switch (requirement.type) {
    case 'course':
      return { tab: 'career', key: `career:course:${requirement.courseId}` };
    case 'item': {
      const item = ITEM_BY_ID.get(requirement.itemId);
      if (!item) return null;
      return item.kind === 'gadget'
        ? { tab: 'shop', shopTab: 'gadget', key: `shop:gadget:${item.id}` }
        : { tab: 'shop', shopTab: item.kind, key: `shop:${item.kind}:next` };
    }
    case 'home':
      return { tab: 'shop', shopTab: 'house', key: 'shop:house:next' };
    case 'vehicle':
      return { tab: 'shop', shopTab: 'vehicle', key: 'shop:vehicle:next' };
    case 'businessLevel':
      return { tab: 'businesses', key: `business:${requirement.businessId}:level` };
    case 'managers':
      return { tab: 'businesses', key: 'businesses:manager' };
    case 'mastered':
    case 'class':
    case 'anyOf':
      return null;
  }
}

