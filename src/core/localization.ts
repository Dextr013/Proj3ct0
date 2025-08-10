import type { Language } from './types';

type Dict = Record<string, string>;

const ru: Dict = {
  game_title: 'Fantasy Boss Clicker',
  start_game: 'Начать игру',
  load_game: 'Загрузить',
  save_game: 'Сохранить',
  settings: 'Настройки',
  close: 'Закрыть',
  volume: 'Громкость',
  language: 'Язык',
  pause: 'Пауза',
  resume: 'Продолжить',
  menu: 'Меню',
  boss: 'Босс',
  gold: 'золото',
  crystals: 'кристаллы',
  choose_next: 'Куда пойти?',
  go_tavern: 'В таверну',
  go_merchant: 'К торговцу',
  tavern: 'Таверна',
  merchant: 'Торговец',
  back: 'Назад',
  hire: 'Нанять',
  buy_rub: 'Купить за 499₽',
  hire_gold: 'Нанять за',
  legendary_hero: 'Легендарный герой',
};

const en: Dict = {
  game_title: 'Fantasy Boss Clicker',
  start_game: 'Start',
  load_game: 'Load',
  save_game: 'Save',
  settings: 'Settings',
  close: 'Close',
  volume: 'Volume',
  language: 'Language',
  pause: 'Pause',
  resume: 'Resume',
  menu: 'Menu',
  boss: 'Boss',
  gold: 'gold',
  crystals: 'crystals',
  choose_next: 'Choose your path',
  go_tavern: 'Go to Tavern',
  go_merchant: 'Go to Merchant',
  tavern: 'Tavern',
  merchant: 'Merchant',
  back: 'Back',
  hire: 'Hire',
  buy_rub: 'Buy for 499₽',
  hire_gold: 'Hire for',
  legendary_hero: 'Legendary Hero',
};

const dicts: Record<Language, Dict> = { ru, en };

export function translate(language: Language, key: string): string {
  const dict = dicts[language] ?? ru;
  return dict[key] ?? key;
}

export function applyTranslations(language: Language): void {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = translate(language, key);
  });
}