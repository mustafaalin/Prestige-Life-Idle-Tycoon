import { Component, type ReactNode } from 'react';
import { useT } from '../i18n/useT';
import { reportError } from '../runtime/crashReports';
import { GameButton } from './kit';

// A screen that failed to draw would leave the whole game blank. This catches it, sends a crash
// report (runtime/crashReports.ts) and offers a restart; the save is written as the game runs, so
// nothing is lost.

export class CrashBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, 'screen');
  }

  render() {
    return this.state.failed ? <CrashScreen /> : this.props.children;
  }
}

export function CrashScreen() {
  const { t } = useT();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#1A1446] px-8 text-center">
      <p className="v2-display text-xl text-white">{t('common.crashTitle')}</p>
      <GameButton className="px-6 py-3.5" onClick={() => window.location.reload()}>
        {t('common.crashRestart')}
      </GameButton>
    </div>
  );
}
