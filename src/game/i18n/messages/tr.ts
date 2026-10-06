import type { Messages } from './en';

export const tr: Messages = {
  common: {
    collect: 'Topla',
    close: 'Kapat',
  },
  hud: {
    perSecond: '{amount}/sn',
    toNextClass: 'Sonraki: {name} · %{percent}',
    topClass: 'Dünyanın zirvesindesin',
  },
  tap: {
    button: 'Dokun, kazan',
  },
  business: {
    title: 'İşletmeler',
    max: 'Maks',
    buy: 'Al ×{count}',
    manager: 'Yönetici',
    auto: 'OTOMATİK',
    tapToRun: 'Çalıştırmak için dokun',
    earns: 'Her {duration} {amount} kazandırır',
    milestone: '{target} adede {left} kaldı → ×2 kâr',
    allMilestones: 'Tüm kilometre taşları tamam',
    teaser: 'Sıradaki · {price}',
  },
  offline: {
    title: 'Tekrar hoş geldin!',
    body: '{duration} uzaktaydın. Yöneticilerin kazandı:',
  },
  placeholder: {
    body: 'Kariyer ve alışveriş ekranları yolda.',
  },
  dev: {
    open: 'DEV',
    title: 'Geliştirici menüsü',
    speed: 'Oyun hızı',
    addCash: 'Para ekle',
    away: 'Uzakta kalmayı dene',
    language: 'Dil',
    reset: 'Kaydı sıfırla',
    resetConfirm: 'Kaydı silmek için tekrar dokun',
  },
};
