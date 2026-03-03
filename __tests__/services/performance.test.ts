// ════════════════════════════════════════════════════════════
// Unit Tests – Performance Calculation Functions
// ════════════════════════════════════════════════════════════
import { describe, it, expect } from 'vitest';
import {
    calculateCompletion,
    calculateStreak,
    calculate40DayAverage,
    calculateLongestStreak,
    getMostMissedTask,
} from '@/lib/services/performance';

describe('calculateCompletion', () => {
    it('returns 0 when no tasks exist', () => {
        expect(calculateCompletion(0, 0)).toBe(0);
    });

    it('returns 0 when nothing completed', () => {
        expect(calculateCompletion(0, 10)).toBe(0);
    });

    it('returns 50% for half completed', () => {
        expect(calculateCompletion(5, 10)).toBe(50);
    });

    it('returns 100% for all completed', () => {
        expect(calculateCompletion(10, 10)).toBe(100);
    });

    it('handles partial completion with decimals', () => {
        expect(calculateCompletion(1, 3)).toBeCloseTo(33.33, 1);
    });

    it('handles negative totalTasks', () => {
        expect(calculateCompletion(5, -1)).toBe(0);
    });
});

describe('calculateStreak', () => {
    it('returns 0 for empty dates', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('returns 1 for single date', () => {
        expect(calculateStreak(['2024-01-01'])).toBe(1);
    });

    it('returns correct streak for consecutive days', () => {
        expect(
            calculateStreak(['2024-01-01', '2024-01-02', '2024-01-03'])
        ).toBe(3);
    });

    it('returns 1 when streak is broken', () => {
        expect(
            calculateStreak(['2024-01-01', '2024-01-03'])
        ).toBe(1);
    });

    it('handles unsorted dates', () => {
        expect(
            calculateStreak(['2024-01-03', '2024-01-01', '2024-01-02'])
        ).toBe(3);
    });

    it('returns latest streak when broken mid-sequence', () => {
        expect(
            calculateStreak(['2024-01-01', '2024-01-02', '2024-01-05', '2024-01-06'])
        ).toBe(2);
    });
});

describe('calculate40DayAverage', () => {
    it('returns 0 for empty array', () => {
        expect(calculate40DayAverage([])).toBe(0);
    });

    it('divides by 40 even with fewer entries', () => {
        // 10 entries of 100% = 1000 / 40 = 25
        const percentages = Array(10).fill(100);
        expect(calculate40DayAverage(percentages)).toBe(25);
    });

    it('calculates correctly for full 40 days', () => {
        const percentages = Array(40).fill(80);
        expect(calculate40DayAverage(percentages)).toBe(80);
    });

    it('uses only last 40 entries when more provided', () => {
        const old = Array(20).fill(0);
        const recent = Array(40).fill(100);
        expect(calculate40DayAverage([...old, ...recent])).toBe(100);
    });
});

describe('calculateLongestStreak', () => {
    it('returns 0 for empty dates', () => {
        expect(calculateLongestStreak([])).toBe(0);
    });

    it('returns 1 for single date', () => {
        expect(calculateLongestStreak(['2024-01-01'])).toBe(1);
    });

    it('returns longest streak when multiple streaks exist', () => {
        expect(
            calculateLongestStreak([
                '2024-01-01', '2024-01-02', '2024-01-03',  // 3-day streak
                '2024-01-10', '2024-01-11',                // 2-day streak
            ])
        ).toBe(3);
    });
});

describe('getMostMissedTask', () => {
    it('returns null for empty inputs', () => {
        expect(getMostMissedTask({}, 0)).toBeNull();
    });

    it('returns null for empty map', () => {
        expect(getMostMissedTask({}, 10)).toBeNull();
    });

    it('returns the most missed task', () => {
        const map = {
            'Fajr Salah': 35,     // missed 5
            'Tahajjud': 20,       // missed 20 (most missed)
            'Quran Tilawat': 30,  // missed 10
        };
        expect(getMostMissedTask(map, 40)).toBe('Tahajjud');
    });
});
