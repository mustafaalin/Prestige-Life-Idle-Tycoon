import { useEffect, useRef } from 'react';
import { setModalOpen, ensureMusicStarted } from '../services/audioService';

export function useAudioManager(anyModalOpen: boolean) {
  const prevOpen = useRef(false);

  // İlk render'da müziği başlatmak için kullanıcı etkileşimi beklenir,
  // ama state değişimlerinde (modal açma gibi) tetikleyebiliriz.
  useEffect(() => {
    ensureMusicStarted();
  }, []);

  useEffect(() => {
    if (prevOpen.current === anyModalOpen) return;
    prevOpen.current = anyModalOpen;
    setModalOpen(anyModalOpen);
  }, [anyModalOpen]);
}
