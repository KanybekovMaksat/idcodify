// Набор символьных эмблем (line-art, 24×24). Значения — внутренняя разметка SVG.
// Заливка/обводка через currentColor: медальон задаёт белый цвет.

export const ARCHETYPE_ICONS: Record<string, string> = {
  sage:
    '<path d="M12 6.5C10 5 6.5 5 4.5 6v11.5c2-1 5.5-1 7.5.5 2-1.5 5.5-1.5 7.5-.5V6c-2-1-5.5-1-7.5.5Z"/><path d="M12 6.5v11.5"/>',
  seeker:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5 14 12 12 16.5 10 12Z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  creator:
    '<path d="M12 3c.8 5.2 2.8 7.2 8 8-5.2.8-7.2 2.8-8 8-.8-5.2-2.8-7.2-8-8 5.2-.8 7.2-2.8 8-8Z" fill="currentColor" stroke="none"/>',
  ruler:
    '<path d="M3.5 8.5 7.5 12 12 6.5 16.5 12 20.5 8.5 19 18H5Z"/><path d="M5 18h14"/><circle cx="3.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="20.5" cy="8.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
  caregiver:
    '<path d="M12 11.4c2.2-1.6 3.6-2.9 3.6-4.4 0-1.3-1-2.1-2.1-2.1-.9 0-1.5.6-1.5.6s-.6-.6-1.5-.6c-1.1 0-2.1.8-2.1 2.1 0 1.5 1.4 2.8 3.6 4.4Z" fill="currentColor" stroke="none"/><path d="M5 13c0 3.6 3.1 5.6 7 5.6s7-2 7-5.6"/>',
  everyman:
    '<circle cx="8.5" cy="9" r="2.3"/><circle cx="15.5" cy="9.5" r="2.1"/><path d="M4 18.6c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6"/><path d="M13.6 18.6c.2-2 1.7-3.6 3.7-3.6 2 0 3.2 1.3 3.2 3.6"/>',
  lover:
    '<path d="M12 19.5C5.5 14.8 3.5 11.2 3.5 8.2 3.5 5.9 5.3 4.5 7.2 4.5c1.7 0 3.2 1 4.8 3 1.6-2 3.1-3 4.8-3 1.9 0 3.7 1.4 3.7 3.7 0 3-2 6.6-8.5 11.3Z" fill="currentColor" stroke="none"/>',
  jester:
    '<path d="M4 14 6 6l3 5.5L12 5l3 6.5L18 6l2 8Z"/><path d="M3.5 14.5h17"/><circle cx="6" cy="5.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="4.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="18" cy="5.5" r="1.1" fill="currentColor" stroke="none"/>',
  innocent:
    '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9"/>',
  hero:
    '<path d="M12 3.2 19.5 6v6c0 5-3.8 8-7.5 9-3.7-1-7.5-4-7.5-9V6Z"/><path d="M12 8.8c.4 2.6 1.4 3.6 4 4-2.6.4-3.6 1.4-4 4-.4-2.6-1.4-3.6-4-4 2.6-.4 3.6-1.4 4-4Z" fill="currentColor" stroke="none"/>',
  rebel:
    '<path d="M13 2.5 5.5 13H11l-1.5 8.5L18.5 10H12.5Z" fill="currentColor" stroke="none"/>',
  magician:
    '<path d="M18 13.5A6.5 6.5 0 1 1 11 6a5 5 0 1 0 7 7.5Z"/><path d="M18.5 4.5c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3Z" fill="currentColor" stroke="none"/>',
};

export const FOCUS_ICONS: Record<string, string> = {
  explore:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5 14 12 12 16.5 10 12Z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  master:
    '<path d="M12 3c1.8 3.6 5 5.4 5 9.2C17 16 14.8 19 12 19S7 16 7 12.2C7 10.6 7.9 9.7 8.8 10.6 8.8 7.6 10 5 12 3Z"/>',
  create:
    '<path d="M12 3c.8 5.2 2.8 7.2 8 8-5.2.8-7.2 2.8-8 8-.8-5.2-2.8-7.2-8-8 5.2-.8 7.2-2.8 8-8Z" fill="currentColor" stroke="none"/>',
  share:
    '<circle cx="6" cy="12" r="2.3"/><circle cx="17" cy="6" r="2.3"/><circle cx="17" cy="18" r="2.3"/><path d="M8 11 15 7M8 13l7 4"/>',
};

// Цвета по семьям архетипов CODIFY (сине-фиолетовая палитра бренда).
export const MOTIF_COLOR: Record<string, string> = {
  // Стабильность — синий
  innocent: '#2f6bff', caregiver: '#2f6bff', ruler: '#2f6bff',
  // Независимость — индиго
  seeker: '#4f46e5', sage: '#4f46e5', creator: '#4f46e5',
  // Принадлежность — фиолетовый
  everyman: '#7b61ff', lover: '#7b61ff', jester: '#7b61ff',
  // Риск и мастерство — пурпурный
  hero: '#a855f7', rebel: '#a855f7', magician: '#a855f7',
  // Фокусы теста «Твой фокус»
  explore: '#2f6bff', master: '#4f46e5', create: '#7b61ff', share: '#a855f7',
};

export const FOCUS_ORDER = ['explore', 'master', 'create', 'share'];

/** Собирает эмблему как <g> с белым line-art по центру медальона 200×200. */
export function emblemGroup(icon: string): string {
  return (
    `<g transform="translate(68,68) scale(2.667)" fill="none" stroke="currentColor" ` +
    `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:#fff">` +
    `${icon}</g>`
  );
}
