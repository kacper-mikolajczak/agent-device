declare module 'skillgym' {
  import type { Assert } from 'node:assert/strict';

  export interface SkillDetection {
    name: string;
    confidence: 'weak' | 'medium' | 'strong' | 'explicit';
  }

  export interface SessionReport {
    finalOutput: string;
    detectedSkills?: SkillDetection[];
    files?: {
      observedReads?: string[];
    };
  }

  export interface AssertionContext {
    getCommands(): string[];
    getToolCalls(tool?: string): unknown[];
    getFileReads(): string[];
    detectedSkills(): SkillDetection[];
    finalOutput(): string;
  }

  export interface TestCase {
    id: string;
    prompt: string;
    timeoutMs?: number;
    assert(report: SessionReport, ctx: AssertionContext): void | Promise<void>;
  }

  export const assert: Assert & {
    skills: {
      has(report: SessionReport, skill: string, options?: unknown): void;
      includes(report: SessionReport, skills: string[], options?: unknown): void;
    };
    fileReads: {
      includes(report: SessionReport, matcher: string | RegExp, options?: unknown): void;
      notIncludes(report: SessionReport, matcher: string | RegExp, options?: unknown): void;
      atLeast(
        report: SessionReport,
        matcher: string | RegExp,
        min: number,
        options?: unknown,
      ): void;
    };
    output: {
      includes(report: SessionReport, matcher: string | RegExp, options?: unknown): void;
      notEmpty(report: SessionReport, options?: unknown): void;
    };
  };
}
