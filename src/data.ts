// src/data.ts
// Данные цифрового профиля студента. Профиль открывается по номеру карты
// (?card=ABC123) — сама карта хранит только ссылку, данные живут на сервере.
// Пока бэкенда нет, loadProfile отдаёт демо-профиль для любого номера.

import type { SkillScores } from './types';
import type { Gender } from './archetypeCard';

/**
 * Статус карты.
 * diagnostic — выдана после диагностики, активна до cardValidUntil;
 * locked — срок вышел, на курс не записались, карта не активна;
 * active — студент учится или учился, карта активна.
 */
export type CardStatus = 'diagnostic' | 'locked' | 'active';

/** Проект студента: ссылка на GitHub, Scratch, видео или файл. */
export interface ProjectRecord {
  id: string;
  title: string;
  /** Курс, на котором сделан проект (если есть). */
  courseTitle?: string;
  /** Дата добавления, ISO. */
  date: string;
  url: string;
}

/** Пройденный или текущий курс с цифровым сертификатом. */
export interface CourseRecord {
  id: string;
  title: string;
  /** Период обучения, ISO-даты. `to` пустой, пока курс идёт. */
  from: string;
  to?: string;
  /** Номер сертификата. Есть только у завершённых курсов. */
  certificate?: {
    number: string;
    issued: string; // ISO-дата выдачи
    /** Ссылка на проверку подлинности. */
    verifyUrl: string;
  };
}

export interface StudentProfile {
  /** Номер карты, по которому открыт профиль. */
  card: string;
  fullName: string;
  /** Имя в именительном падеже — для текста карты. */
  firstName: string;
  /** Род — для согласования слов в тексте карты. */
  gender: Gender;
  /** id архетипа из tests-data/archetypes (sage, creator, …). */
  archetype: string;
  /** Навыки сейчас. */
  skills: SkillScores;
  /** Навыки на первой диагностике — чтобы показать рост. */
  baseline?: { date: string; skills: SkillScores };
  status: CardStatus;
  /** До какой даты карта активна после диагностики (ISO). */
  cardValidUntil?: string;
  courses: CourseRecord[];
  /** Проекты с сервера. Добавленные на устройстве хранятся отдельно, см. loadLocalProjects. */
  projects: ProjectRecord[];
}

const DEMO: StudentProfile = {
  card: '000417',
  fullName: 'Асанова Айдана Бакытовна',
  firstName: 'Айдана',
  gender: 'f',
  archetype: 'creator',
  baseline: {
    date: '2026-01-14',
    skills: { analytics: 41, logic: 46, creativity: 68, communication: 52, initiative: 58 },
  },
  skills: { analytics: 63, logic: 71, creativity: 84, communication: 66, initiative: 74 },
  status: 'active',
  cardValidUntil: '2026-01-28',
  courses: [
    {
      id: 'robo-start',
      title: 'Robo Start',
      from: '2026-01-19',
      to: '2026-04-10',
      certificate: {
        number: 'CDF-2026-00412',
        issued: '2026-04-12',
        verifyUrl: 'https://codifylab.com/verify/CDF-2026-00412',
      },
    },
    {
      id: 'ai-start',
      title: 'AI Start',
      from: '2026-04-20',
      to: '2026-07-03',
      certificate: {
        number: 'CDF-2026-00987',
        issued: '2026-07-05',
        verifyUrl: 'https://codifylab.com/verify/CDF-2026-00987',
      },
    },
    {
      id: 'javascript',
      title: 'JavaScript',
      from: '2026-09-07',
    },
  ],
  projects: [
    {
      id: 'robo-sorter',
      title: 'Робот-сортировщик',
      courseTitle: 'Robo Start',
      date: '2026-03-28',
      url: 'https://github.com/codify-students/robo-sorter',
    },
    {
      id: 'homework-bot',
      title: 'Бот-помощник по домашке',
      courseTitle: 'AI Start',
      date: '2026-06-20',
      url: 'https://github.com/codify-students/homework-bot',
    },
  ],
};

/**
 * Загружает профиль по номеру карты. Сейчас — демо-данные.
 * Когда появится API, здесь будет fetch(`/api/profile?card=${card}`).
 */
export async function loadProfile(card: string | null): Promise<StudentProfile | null> {
  if (!card) return null;
  return { ...DEMO };
}

// --- Проекты, добавленные на устройстве. Пока нет API, они живут в localStorage
// этого браузера. Когда появится сервер, saveLocalProject заменится на запрос.

function localKey(card: string): string {
  return `idcodify.projects.${card}`;
}

export function loadLocalProjects(card: string): ProjectRecord[] {
  try {
    const raw = localStorage.getItem(localKey(card));
    return raw ? (JSON.parse(raw) as ProjectRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalProject(card: string, project: ProjectRecord): void {
  try {
    const list = loadLocalProjects(card);
    list.push(project);
    localStorage.setItem(localKey(card), JSON.stringify(list));
  } catch {
    // Хранилище недоступно (приватный режим): проект покажется до перезагрузки.
  }
}
