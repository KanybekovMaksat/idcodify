import type { SkillScores } from './types';
import { ARCHETYPE_ICONS, FOCUS_ICONS } from './icons';

const NS = 'http://www.w3.org/2000/svg';

const BRAIN =
  '<path d="M9.5 4.5C7.6 4.5 6.3 6 6.5 7.6 5.4 8.1 4.8 9.1 4.8 10.2c0 1 .5 1.9 1.4 2.4-.1 1.5 1.1 2.7 2.6 2.7.7 0 1.4-.3 1.9-.8V5.2c-.5-.5-1.2-.7-1.7-.7Z"/><path d="M14.5 4.5C16.4 4.5 17.7 6 17.5 7.6c1.1.5 1.7 1.5 1.7 2.6 0 1-.5 1.9-1.4 2.4.1 1.5-1.1 2.7-2.6 2.7-.7 0-1.4-.3-1.9-.8V5.2c.5-.5 1.2-.7 1.7-.7Z"/>';
const CALC =
  '<rect x="6" y="3.5" width="12" height="17" rx="2"/><rect x="8.5" y="6" width="7" height="3" rx="0.6"/><path d="M9 12.5h.01M12 12.5h.01M15 12.5h.01M9 15.5h.01M12 15.5h.01M15 15.5h.01M9 18.5h.01M12 18.5h.01"/>';
const ROCKET =
  '<path d="M12 3c3 1.6 4.8 4.6 4.8 8.2L14.5 13.5h-5L7.2 11.2C7.2 7.6 9 4.6 12 3Z"/><circle cx="12" cy="9.3" r="1.5" fill="none"/><path d="M9.5 13.8 8 18l2.4-1M14.5 13.8 16 18l-2.4-1"/>';

interface Axis {
  key: keyof SkillScores;
  label: string;
  icon: string;
  angle: number; // градусы
}

const AXES: Axis[] = [
  { key: 'analytics', label: 'Аналитика', icon: BRAIN, angle: -90 },
  { key: 'logic', label: 'Логика', icon: CALC, angle: -18 },
  { key: 'creativity', label: 'Креативность', icon: FOCUS_ICONS.create, angle: 54 },
  { key: 'communication', label: 'Коммуникация', icon: ARCHETYPE_ICONS.everyman, angle: 126 },
  { key: 'initiative', label: 'Инициативность', icon: ROCKET, angle: 198 },
];

const CX = 160;
const CY = 150;
const R = 84;

function pt(radius: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

function poly(radius: number): string {
  return AXES.map((ax) => pt(radius, ax.angle).map((n) => n.toFixed(1)).join(',')).join(' ');
}

function iconBadge(x: number, y: number, icon: string): string {
  return (
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16" fill="#fff" stroke="#e6e9f6"/>` +
    `<g transform="translate(${(x - 8.4).toFixed(1)},${(y - 8.4).toFixed(1)}) scale(0.7)" ` +
    `fill="none" stroke="#7b61ff" stroke-width="1.8" stroke-linecap="round" ` +
    `stroke-linejoin="round" style="color:#7b61ff">${icon}</g>`
  );
}

function seriesPoly(skills: SkillScores): [number, number][] {
  return AXES.map((ax) => pt(R * (skills[ax.key] / 100), ax.angle));
}

function polyStr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** Радар навыков. Если передан `after` — рисует «сейчас» пунктиром и «после» заливкой. */
export function renderRadar(skills: SkillScores, after?: SkillScores): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-56 -6 432 300');
  svg.setAttribute('width', '100%');
  svg.setAttribute('class', 'radar');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Радар навыков');

  // Сетка
  let grid = '';
  for (const ring of [0.34, 0.67, 1]) {
    grid += `<polygon points="${poly(R * ring)}" fill="none" stroke="#dfe3f3" stroke-width="1"/>`;
  }
  for (const ax of AXES) {
    const [x, y] = pt(R, ax.angle);
    grid += `<line x1="${CX}" y1="${CY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6e9f6" stroke-width="1"/>`;
  }

  // Значки и подписи осей
  let labels = '';
  for (const ax of AXES) {
    const [bx, by] = pt(R + 26, ax.angle);
    labels += iconBadge(bx, by, ax.icon);
    const rad = (ax.angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
    const [lx] = pt(R + 30, ax.angle);
    const ly = by + (sin < -0.3 ? -22 : 32);
    labels +=
      `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" ` +
      `font-family="Onest, sans-serif" font-size="13" font-weight="600" fill="#1a1f3d">${ax.label}</text>`;
  }

  let data: string;
  if (after) {
    // «Сейчас» — пунктиром, «После» — заливкой поверх.
    const nowPts = seriesPoly(skills);
    const aftPts = seriesPoly(after);
    data =
      `<polygon points="${polyStr(nowPts)}" fill="#8a8fb0" fill-opacity="0.08" ` +
      `stroke="#9aa0c4" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>` +
      `<polygon points="${polyStr(aftPts)}" fill="#7b61ff" fill-opacity="0.22" ` +
      `stroke="#6b4ee0" stroke-width="2.5" stroke-linejoin="round"/>` +
      aftPts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#6b4ee0"/>`).join('');
  } else {
    const pts = seriesPoly(skills);
    data =
      `<polygon points="${polyStr(pts)}" fill="#7b61ff" fill-opacity="0.24" ` +
      `stroke="#7b61ff" stroke-width="2.5" stroke-linejoin="round"/>` +
      pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#6b4ee0"/>`).join('');
  }

  svg.innerHTML = grid + data + labels;
  return svg;
}
