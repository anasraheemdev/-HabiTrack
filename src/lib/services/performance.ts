// ════════════════════════════════════════════════════════════
// Performance Calculation Services
// Pure functions for completion %, streak, and 40-day average
// ════════════════════════════════════════════════════════════

/**
 * Calculate daily completion percentage.
 * @param completedTasks - Number of completed tasks
 * @param totalTasks - Total number of assigned tasks
 * @returns Completion percentage (0–100)
 */
export function calculateCompletion(
    completedTasks: number,
    totalTasks: number
): number {
    if (totalTasks <= 0) return 0;
    const percentage = (completedTasks / totalTasks) * 100;
    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate current streak from an array of submission dates.
 * Dates must be sorted in ascending order.
 * @param submissionDates - Array of date strings (YYYY-MM-DD)
 * @returns Current consecutive day streak
 */
export function calculateStreak(submissionDates: string[]): number {
    if (submissionDates.length === 0) return 0;

    // Sort dates ascending
    const sorted = [...submissionDates].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    let streak = 1;
    // Start from the most recent date and work backwards
    for (let i = sorted.length - 1; i > 0; i--) {
        const current = new Date(sorted[i]);
        const previous = new Date(sorted[i - 1]);

        // Calculate difference in days
        const diffTime = current.getTime() - previous.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Calculate 40-day rolling average of daily completion percentages.
 * @param dailyPercentages - Array of daily completion percentages (most recent first or in any order)
 * @returns 40-day rolling average
 */
export function calculate40DayAverage(dailyPercentages: number[]): number {
    if (dailyPercentages.length === 0) return 0;

    // Take the last 40 entries (or fewer if not enough data)
    const relevant = dailyPercentages.slice(-40);
    const sum = relevant.reduce((acc, val) => acc + val, 0);
    const average = sum / 40; // Always divide by 40, even if fewer entries

    return Math.round(average * 100) / 100;
}

/**
 * Calculate the longest streak from submission dates.
 * @param submissionDates - Array of date strings (YYYY-MM-DD)
 * @returns Longest consecutive day streak
 */
export function calculateLongestStreak(submissionDates: string[]): number {
    if (submissionDates.length === 0) return 0;

    const sorted = [...submissionDates].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
        const current = new Date(sorted[i]);
        const previous = new Date(sorted[i - 1]);
        const diffTime = current.getTime() - previous.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return longestStreak;
}

/**
 * Determine the most missed task from report items.
 * @param taskCompletionMap - Map of task names to completion counts
 * @param totalReports - Total number of reports
 * @returns Name of the most frequently missed task
 */
export function getMostMissedTask(
    taskCompletionMap: Record<string, number>,
    totalReports: number
): string | null {
    if (totalReports === 0 || Object.keys(taskCompletionMap).length === 0) {
        return null;
    }

    let mostMissed = '';
    let maxMisses = 0;

    for (const [taskName, completions] of Object.entries(taskCompletionMap)) {
        const misses = totalReports - completions;
        if (misses > maxMisses) {
            maxMisses = misses;
            mostMissed = taskName;
        }
    }

    return mostMissed || null;
}
