// src/main.ts
// ID-карта студента Codify: ФИО, архетип, радар навыков, курсы с сертификатами, проекты.
// Открывается по ссылке с NFC-карты: /?card=000417
// Статус карты: ?status=diagnostic|locked|active (предпросмотр), иначе из профиля.
// Оформление — дизайн-система Codify (codify-app-web/design): токены в tokens.css.

import type { SkillScores } from './types';
import { ARCHETYPE_ICONS } from './icons';
import { renderRadar } from './radar';
import {
  loadProfile, loadLocalProjects, saveLocalProject,
  type CardStatus, type CourseRecord, type ProjectRecord, type StudentProfile,
} from './data';
import { archetypeCard } from './archetypeCard';

const app = document.querySelector<HTMLElement>('#app')!;

/** Куда ведёт «Записаться на курс». */
const ENROLL_URL = 'https://codifylab.com';

const MONTHS = [
  'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];
const MONTHS_FULL = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const SKILL_META: { key: keyof SkillScores; label: string }[] = [
  { key: 'analytics', label: 'Аналитика' },
  { key: 'logic', label: 'Логика' },
  { key: 'creativity', label: 'Креативность' },
  { key: 'communication', label: 'Коммуникация' },
  { key: 'initiative', label: 'Инициативность' },
];

const STATUSES: CardStatus[] = ['diagnostic', 'locked', 'active'];
const STATUS_LABEL: Record<CardStatus, string> = {
  diagnostic: 'После диагностики',
  locked: 'Карта закрыта',
  active: 'Студент',
};

/** Тема: всегда светлая (белый фон). Тёмная только по ?theme=dark, например из LMS. */
function applyTheme(): void {
  const forced = new URLSearchParams(location.search).get('theme');
  document.documentElement.dataset.theme = forced === 'dark' ? 'dark' : 'light';
}

/** Статус из адреса (предпросмотр), иначе из профиля. */
function readStatus(p: StudentProfile): CardStatus {
  const q = new URLSearchParams(location.search).get('status');
  return STATUSES.includes(q as CardStatus) ? (q as CardStatus) : p.status;
}

function writeStatus(status: CardStatus): void {
  const params = new URLSearchParams(location.search);
  params.set('status', status);
  history.replaceState(null, '', `${location.pathname}?${params}`);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateFull(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtPeriod(from: string, to?: string): string {
  const a = new Date(from);
  const b = to ? new Date(to) : null;
  const left = `${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
  if (!b) return `с ${left}`;
  const right = `${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
  return left === right ? left : `${left} — ${right}`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, className?: string, text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Иконка 24×24 line-art. Толщина штриха: 1.5 рядом с обычным текстом, 2 рядом с полужирным (space.md). */
function icon(paths: string, stroke: 1.5 | 2 = 2): string {
  return (
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
  );
}

const I_CHECK = '<path d="M6 12.5l4 4 8-9"/>';
const I_CARD = '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M14.5 9.5a3.5 3.5 0 0 1 0 5M16.8 7.5a6.5 6.5 0 0 1 0 9"/><circle cx="12" cy="12" r="1" fill="currentColor"/>';
const I_COURSE = '<path d="M4 7.5 12 4l8 3.5-8 3.5z"/><path d="M7 9.8V15c0 1.4 2.3 2.5 5 2.5s5-1.1 5-2.5V9.8"/><path d="M20 7.5V13"/>';
const I_UP = '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>';
const I_CHEVRON = '<path d="M9 6l6 6-6 6"/>';
const I_PLAY = '<circle cx="12" cy="12" r="8.5"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/>';
const I_LINE_DASH = '<path d="M3 12h4M10 12h4M17 12h4"/>';
const I_LINE = '<path d="M3 12h18"/>';
const I_CLOCK = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
const I_LOCK = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';
const I_FOLDER = '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5H10l2 2h6.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/>';
const I_PLUS = '<path d="M12 5v14M5 12h14"/>';

// --- Переключатель статуса (предпросмотр) ---

function renderStatusBar(current: CardStatus, onChange: (s: CardStatus) => void): HTMLElement {
  const bar = el('div', 'pf-statusbar');
  const col = el('div', 'pf-col');
  col.appendChild(el('span', 'pf-meta', 'Статус карты'));
  const group = el('div', 'pf-segment');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Статус карты');
  for (const s of STATUSES) {
    const btn = el('button', 'pf-segment__btn', STATUS_LABEL[s]);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(s === current));
    btn.addEventListener('click', () => { if (s !== current) onChange(s); });
    group.appendChild(btn);
  }
  col.appendChild(group);
  bar.appendChild(col);
  return bar;
}

// --- Шапка ---

function renderStatusBadge(p: StudentProfile, status: CardStatus): HTMLElement {
  const badge = el('span', `pf-status pf-status--${status}`);
  if (status === 'active') {
    badge.innerHTML = `${icon(I_CHECK)}<span>Активна</span>`;
  } else if (status === 'diagnostic') {
    const until = p.cardValidUntil ? ` до ${fmtDate(p.cardValidUntil)}` : '';
    badge.innerHTML = `${icon(I_CLOCK)}<span>Активна${until}</span>`;
  } else {
    badge.innerHTML = `${icon(I_LOCK)}<span>Не активна</span>`;
  }
  return badge;
}

function renderHeader(p: StudentProfile, status: CardStatus): HTMLElement {
  const header = el('header', 'pf-header');
  const col = el('div', 'pf-col');

  const logo = document.createElement('a');
  logo.className = 'pf-logo';
  logo.href = 'https://codifylab.com';
  logo.setAttribute('aria-label', 'Codify');
  logo.innerHTML = '<span class="pf-logo__mark"></span>';
  col.appendChild(logo);

  const head = el('div', 'pf-head');
  head.appendChild(el('p', 'pf-kicker', 'ID-карта студента Codify'));
  head.appendChild(el('h1', 'pf-name', p.fullName));
  col.appendChild(head);

  const badges = el('div', 'pf-header__badges');
  const card = el('p', 'pf-card-badge');
  card.innerHTML = `${icon(I_CARD)}<span>Карта <bdi>№ ${p.card}</bdi></span>`;
  badges.appendChild(card);
  badges.appendChild(renderStatusBadge(p, status));
  col.appendChild(badges);

  header.appendChild(col);
  return header;
}

function enrollLink(): HTMLAnchorElement {
  const a = document.createElement('a');
  a.className = 'pf-action';
  a.href = ENROLL_URL;
  a.textContent = 'Записаться на курс';
  return a;
}

// --- Состояния карты ---

/** После диагностики: карта активна до даты, одно действие — записаться. */
function renderNotice(p: StudentProfile): HTMLElement {
  const box = el('div', 'pf-notice');
  box.setAttribute('role', 'status');
  const until = p.cardValidUntil ? ` до ${fmtDateFull(p.cardValidUntil)}` : '';
  box.innerHTML =
    `${icon(I_CLOCK)}<div class="pf-notice__body">` +
    `<p class="pf-notice__title">Карта активна${until}</p>` +
    `<p>Запишитесь на курс, чтобы сохранить профиль и смотреть, как растут навыки.</p></div>`;
  box.querySelector('.pf-notice__body')!.appendChild(enrollLink());
  return box;
}

/** Карта закрыта: имя остаётся в шапке, остальное скрыто. */
function renderLocked(): HTMLElement {
  const sec = el('section', 'pf-section pf-locked');
  const ic = el('span', 'pf-locked__icon');
  ic.innerHTML = icon(I_LOCK, 1.5);
  sec.appendChild(ic);
  sec.appendChild(el('h2', 'pf-h2', 'Карта не активна'));
  sec.appendChild(el('p', 'pf-text pf-text--soft', 'Архетип, навыки и сертификаты откроются после записи на курс.'));
  sec.appendChild(enrollLink());
  return sec;
}

// --- Архетип ---

function renderArchetype(p: StudentProfile): HTMLElement {
  const sec = el('section', 'pf-section');
  const card = archetypeCard(p.archetype, p.firstName, p.gender);
  if (!card) {
    sec.appendChild(el('h2', 'pf-h2', 'Архетип личности'));
    sec.appendChild(el('p', 'pf-text pf-text--soft', 'Диагностика ещё не пройдена.'));
    return sec;
  }

  const top = el('div', 'pf-arch');
  const tile = el('div', 'pf-arch__tile');
  const glyph = ARCHETYPE_ICONS[p.archetype];
  if (glyph) tile.innerHTML = icon(glyph, 1.5);
  top.appendChild(tile);
  const titles = el('div', 'pf-arch__titles');
  titles.appendChild(el('h2', 'pf-meta', 'Архетип личности'));
  titles.appendChild(el('p', 'pf-arch__name', card.title));
  top.appendChild(titles);
  sec.appendChild(top);

  sec.appendChild(el('p', 'pf-text', card.portrait));

  const list = el('ul', 'pf-list');
  for (const s of card.strengths) {
    const li = document.createElement('li');
    li.innerHTML = `${icon(I_CHECK, 1.5)}<span></span>`;
    li.querySelector('span')!.textContent = s;
    list.appendChild(li);
  }
  sec.appendChild(list);

  const fits = el('div', 'pf-inset');
  fits.appendChild(el('span', 'pf-meta', 'Подходит'));
  fits.appendChild(el('p', 'pf-text', card.fits));
  sec.appendChild(fits);
  return sec;
}

// --- Навыки ---

function renderSkills(skills: SkillScores, baseline?: { date: string; skills: SkillScores }): HTMLElement {
  const sec = el('section', 'pf-section');
  sec.appendChild(el('h2', 'pf-h2', 'Навыки'));
  const radar = renderRadar(baseline ? baseline.skills : skills, baseline ? skills : undefined);
  // Подписи осей крупнее (text-sm), поэтому поле обзора шире, чтобы край не резал текст.
  radar.setAttribute('viewBox', '-72 -6 464 300');
  sec.appendChild(radar);

  if (baseline) {
    const legend = el('p', 'pf-legend');
    legend.innerHTML =
      `<span class="pf-lg--base">${icon(I_LINE_DASH)}<span>Диагностика · ${fmtDate(baseline.date)}</span></span>` +
      `<span class="pf-lg--now">${icon(I_LINE)}<span>Сейчас</span></span>`;
    sec.appendChild(legend);
  }

  const rows = el('ul', 'pf-skills');
  for (const m of SKILL_META) {
    const now = skills[m.key];
    const was = baseline?.skills[m.key];
    const delta = was !== undefined ? now - was : 0;
    const row = el('li', 'pf-skill');
    row.innerHTML =
      `<div class="pf-skill__row">` +
      `<span class="pf-skill__label">${m.label}</span>` +
      `<span class="pf-skill__values"><span class="pf-skill__num">${now}</span>` +
      (delta > 0 ? `<span class="pf-delta" aria-label="рост на ${delta}">${icon(I_UP)}${delta}</span>` : '') +
      `</span></div>` +
      `<span class="pf-track" role="img" aria-label="${m.label}: ${now} из 100"><i style="inline-size:${now}%"></i></span>`;
    rows.appendChild(row);
  }
  sec.appendChild(rows);
  return sec;
}

// --- Курсы и сертификаты ---

/** Превью сертификата: документ с логотипом, именем, курсом, датой и номером. Целиком — ссылка на проверку. */
function renderCertificate(c: CourseRecord, student: StudentProfile): HTMLElement {
  const cert = c.certificate!;
  const a = document.createElement('a');
  a.className = 'pf-certificate';
  a.href = cert.verifyUrl;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', `Сертификат ${cert.number}, курс ${c.title}. Проверить подлинность`);
  const passed = student.gender === 'f' ? 'прошла курс' : 'прошёл курс';
  a.innerHTML =
    `<span class="pf-certificate__head">` +
    `<span class="pf-logo__mark pf-certificate__logo" role="img" aria-label="Codify"></span>` +
    `<span class="pf-certificate__seal">${icon(I_CHECK)}</span></span>` +
    `<span class="pf-certificate__body">` +
    `<span class="pf-meta">Сертификат подтверждает, что</span>` +
    `<span class="pf-certificate__name"></span>` +
    `<span class="pf-meta">${passed}</span>` +
    `<span class="pf-certificate__course"></span></span>` +
    `<span class="pf-certificate__foot">` +
    `<span class="pf-meta">${fmtDateFull(cert.issued)} · <bdi>№ ${cert.number}</bdi></span>` +
    `<span class="pf-certificate__verify">Проверить${icon(I_CHEVRON)}</span></span>`;
  a.querySelector('.pf-certificate__name')!.textContent = student.fullName;
  a.querySelector('.pf-certificate__course')!.textContent = c.title;
  return a;
}

function renderCourse(c: CourseRecord, student: StudentProfile): HTMLElement {
  const row = el('li', 'pf-course');

  const tile = el('div', 'pf-course__tile');
  tile.innerHTML = icon(I_COURSE, 1.5);
  row.appendChild(tile);

  const main = el('div', 'pf-course__main');
  main.appendChild(el('p', 'pf-course__title', c.title));
  main.appendChild(el('p', 'pf-meta', fmtPeriod(c.from, c.to)));
  row.appendChild(main);

  const aside = el('div', 'pf-course__aside');
  if (c.certificate) {
    aside.classList.add('pf-course__aside--wide');
    aside.appendChild(renderCertificate(c, student));
  } else {
    const badge = el('span', 'pf-badge');
    badge.innerHTML = `${icon(I_PLAY)}<span>Учится сейчас</span>`;
    aside.appendChild(badge);
  }
  row.appendChild(aside);
  return row;
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function renderCourses(p: StudentProfile): HTMLElement {
  const sec = el('section', 'pf-section');
  const head = el('div', 'pf-section__head');
  head.appendChild(el('h2', 'pf-h2', 'Курсы'));
  const certs = p.courses.filter((c) => c.certificate).length;
  if (certs > 0) {
    head.appendChild(el('span', 'pf-meta', `${certs} ${plural(certs, 'сертификат', 'сертификата', 'сертификатов')}`));
  }
  sec.appendChild(head);

  if (p.courses.length === 0) {
    sec.appendChild(el('p', 'pf-text pf-text--soft', 'Курсов пока нет. Они появятся после первого занятия.'));
    return sec;
  }
  const list = el('ul', 'pf-courses');
  const sorted = [...p.courses].sort((a, b) => b.from.localeCompare(a.from));
  for (const c of sorted) list.appendChild(renderCourse(c, p));
  sec.appendChild(list);
  return sec;
}

// --- Мои проекты ---

function renderProject(pr: ProjectRecord): HTMLElement {
  const row = el('li', 'pf-project');
  const tile = el('div', 'pf-project__tile');
  tile.innerHTML = icon(I_FOLDER, 1.5);
  row.appendChild(tile);

  const main = el('div', 'pf-project__main');
  main.appendChild(el('p', 'pf-project__title', pr.title));
  const meta = [pr.courseTitle, fmtDate(pr.date)].filter(Boolean).join(' · ');
  main.appendChild(el('p', 'pf-meta', meta));
  row.appendChild(main);

  const open = document.createElement('a');
  open.className = 'pf-project__open';
  open.href = pr.url;
  open.target = '_blank';
  open.rel = 'noopener';
  open.setAttribute('aria-label', `Открыть проект «${pr.title}»`);
  open.innerHTML = `Открыть${icon(I_CHEVRON)}`;
  row.appendChild(open);
  return row;
}

function field(id: string, label: string, type: 'text' | 'url', placeholder: string): HTMLElement {
  const wrap = el('div', 'pf-field');
  const lab = el('label', 'pf-field__label', label);
  lab.htmlFor = id;
  const input = el('input', 'pf-input');
  input.id = id;
  input.name = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.setAttribute('aria-describedby', `${id}-error`);
  const err = el('p', 'pf-field__error');
  err.id = `${id}-error`;
  err.setAttribute('aria-live', 'polite');
  wrap.append(lab, input, err);
  return wrap;
}

function setFieldError(wrap: HTMLElement, message: string): void {
  wrap.classList.toggle('pf-field--error', message !== '');
  wrap.querySelector('.pf-field__error')!.textContent = message;
}

function renderProjects(p: StudentProfile, onSaved: () => void): HTMLElement {
  const sec = el('section', 'pf-section');
  const projects = [...p.projects, ...loadLocalProjects(p.card)]
    .sort((a, b) => b.date.localeCompare(a.date));

  const head = el('div', 'pf-section__head');
  head.appendChild(el('h2', 'pf-h2', 'Мои проекты'));
  if (projects.length > 0) {
    head.appendChild(el('span', 'pf-meta', `${projects.length} ${plural(projects.length, 'проект', 'проекта', 'проектов')}`));
  }
  sec.appendChild(head);

  if (projects.length === 0) {
    sec.appendChild(el('p', 'pf-text pf-text--soft', 'Проектов пока нет. Добавьте первый по ссылке на Scratch, GitHub или видео.'));
  } else {
    const list = el('ul', 'pf-projects');
    for (const pr of projects) list.appendChild(renderProject(pr));
    sec.appendChild(list);
  }

  // Одно действие на экране: «Добавить проект». Пока форма открыта, кнопка скрыта.
  const addBtn = el('button', 'pf-action');
  addBtn.type = 'button';
  addBtn.innerHTML = `${icon(I_PLUS)}Добавить проект`;
  sec.appendChild(addBtn);

  const form = el('form', 'pf-form');
  form.hidden = true;
  form.noValidate = true;
  form.setAttribute('aria-label', 'Новый проект');
  const titleField = field('project-title', 'Название', 'text', 'Например, Лабиринт для кота');
  const urlField = field('project-url', 'Ссылка на проект', 'url', 'https://scratch.mit.edu/projects/…');
  const actions = el('div', 'pf-form__actions');
  const save = el('button', 'pf-action', 'Сохранить');
  save.type = 'submit';
  const cancel = el('button', 'pf-action pf-action--secondary', 'Отмена');
  cancel.type = 'button';
  actions.append(save, cancel);
  form.append(titleField, urlField, actions);
  sec.appendChild(form);

  const openForm = (): void => {
    addBtn.hidden = true;
    form.hidden = false;
    titleField.querySelector('input')!.focus();
  };
  const closeForm = (): void => {
    form.hidden = true;
    addBtn.hidden = false;
    form.reset();
    setFieldError(titleField, '');
    setFieldError(urlField, '');
    addBtn.focus();
  };
  addBtn.addEventListener('click', openForm);
  cancel.addEventListener('click', closeForm);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleField.querySelector('input')!.value.trim();
    const url = urlField.querySelector('input')!.value.trim();
    let ok = true;
    if (!title) { setFieldError(titleField, 'Введите название проекта.'); ok = false; }
    else setFieldError(titleField, '');
    if (!/^https?:\/\/\S+$/.test(url)) { setFieldError(urlField, 'Нужна ссылка, которая начинается с https://'); ok = false; }
    else setFieldError(urlField, '');
    if (!ok) return;
    saveLocalProject(p.card, {
      id: `local-${Date.now()}`,
      title,
      url,
      date: new Date().toISOString().slice(0, 10),
    });
    onSaved();
  });

  return sec;
}

// --- Экран ---

function renderProfile(p: StudentProfile, status: CardStatus): void {
  app.innerHTML = '';
  app.appendChild(renderStatusBar(status, (next) => {
    writeStatus(next);
    renderProfile(p, next);
  }));
  app.appendChild(renderHeader(p, status));

  const main = el('main', 'pf-main');
  const col = el('div', 'pf-col');
  if (status === 'locked') {
    col.appendChild(renderLocked());
  } else if (status === 'diagnostic') {
    // Есть только первый замер: показываем его без роста, курсов и проектов ещё нет.
    col.appendChild(renderNotice(p));
    col.appendChild(renderArchetype(p));
    col.appendChild(renderSkills(p.baseline?.skills ?? p.skills));
  } else {
    col.appendChild(renderArchetype(p));
    col.appendChild(renderSkills(p.skills, p.baseline));
    col.appendChild(renderCourses(p));
    col.appendChild(renderProjects(p, () => renderProfile(p, status)));
  }
  main.appendChild(col);
  app.appendChild(main);
}

/** Пустое состояние: одно предложение и одно действие (rules.md, п. 8). */
function renderEmpty(): void {
  app.innerHTML = '';
  const main = el('main', 'pf-main');
  const col = el('div', 'pf-col pf-empty');
  col.appendChild(el('h1', undefined, 'Профиль не найден'));
  col.appendChild(el('p', 'pf-text pf-text--soft', 'Приложите карту студента к телефону ещё раз.'));
  const link = document.createElement('a');
  link.className = 'pf-action';
  link.href = 'https://codifylab.com';
  link.textContent = 'На сайт Codify';
  col.appendChild(link);
  main.appendChild(col);
  app.appendChild(main);
}

function renderLoading(): void {
  app.innerHTML =
    '<main class="pf-main"><div class="pf-col pf-loading" role="status">' +
    '<span class="pf-spinner" aria-hidden="true"></span><span>Загружаем профиль</span></div></main>';
}

async function boot(): Promise<void> {
  applyTheme();
  const card = new URLSearchParams(location.search).get('card');
  renderLoading();
  const profile = await loadProfile(card);
  if (profile) renderProfile(profile, readStatus(profile));
  else renderEmpty();
}

void boot();
