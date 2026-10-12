import type { CoverFit } from './coverFit';
import { FEET_Y, type PoseArt, type SpriteArt, type VehicleBox } from './stages';

// Where the stage's cut-outs land on screen, shared by the scene and the scene lab (DEV).

/** `shift` moves the hero and Şans sideways for a home whose picture needs it (stages.ts HomeArt.castX). */
export function poseBox(fit: CoverFit, art: PoseArt, shift = 0) {
  const height = fit.h(art.height);
  const width = height * art.aspect;
  return { left: fit.x(art.x + shift) - width / 2, top: fit.y(FEET_Y) - height, width, height };
}

export function spriteBox(fit: CoverFit, art: SpriteArt, shift = 0) {
  const height = fit.h(art.height);
  const width = height * art.aspect;
  return { left: fit.x(art.x + shift) - width / 2, top: fit.y(art.y) - height, width, height };
}

/** The art faces right, its rear at the box's left edge; a lane that faces left shows it mirrored. */
export function vehicleStyle(fit: CoverFit, box: VehicleBox) {
  return {
    left: fit.x(box.x),
    bottom: fit.height - fit.y(box.y),
    width: fit.h(9 / 16) * box.width,
    transform: box.facesLeft ? 'scaleX(-1)' : undefined,
  };
}

/** `light` is the home's shade (stages.ts HomeArt). */
export function spriteFilter(light: string) {
  return `${light} drop-shadow(0 8px 10px rgba(0,0,0,0.35))`;
}
