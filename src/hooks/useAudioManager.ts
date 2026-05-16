import { useEffect, useRef } from 'react';
import { setModalOpen, ensureMusicStarted, pauseMusic, resumeMusic } from '../services/audioService';

export function useAudioManager(anyModalOpen: boolean) {
  const prevOpen = useRef(false);

  useEffect(() => {
    ensureMusicStarted();
  }, []);

  // Uygulama arka plana geçince müziği durdur, ön plana gelince devam ettir
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        pauseMusic();
      } else {
        resumeMusic();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (prevOpen.current === anyModalOpen) return;
    prevOpen.current = anyModalOpen;
    setModalOpen(anyModalOpen);
  }, [anyModalOpen]);
}
