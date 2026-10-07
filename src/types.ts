// src/types.ts

/** Оценки по 5 навыкам для радара (0..100). Те же оси, что в диагностике Codify. */
export interface SkillScores {
  analytics: number;
  logic: number;
  creativity: number;
  communication: number;
  initiative: number;
}
