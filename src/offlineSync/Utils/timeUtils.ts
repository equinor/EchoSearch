/**
 * Returns the elapsed time in seconds between start and end time.
 * @param startTimeMs The start time to measure elapsed time from in milliseconds.
 * @param startTimeMs The end time to measure elapsed time to in milliseconds.
 */
export function elapsedTimeInSecondsBetween(startTimeMs: number, endTimeMs: number): number {
    if (startTimeMs > endTimeMs) {
        const swapEndTime = endTimeMs;
        endTimeMs = startTimeMs;
        startTimeMs = swapEndTime;
    }
    return (endTimeMs - startTimeMs) / 1000;
}

/**
 * Returns the elapsed time since startTime in seconds.
 * @param startTimeMs The start time to measure elapsed time from in milliseconds.
 */
export function ElapsedTimeInSeconds(startTimeMs: number): number {
    return elapsedTimeInSecondsBetween(performance.now(), startTimeMs);
}
