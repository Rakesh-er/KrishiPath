/** Weighted quality score from metric inputs (0–100 per metric). */
export const DEFAULT_WEIGHTS = {
    appearance: 0.3,
    freshness: 0.25,
    size: 0.15,
    contamination: 0.3
};

export function computeCompositeQualityScore(metrics, weights = DEFAULT_WEIGHTS) {
    if (!metrics || typeof metrics !== 'object') return 0;
    let score = 0;
    for (const [metric, value] of Object.entries(metrics)) {
        const n = Number(value);
        if (!Number.isFinite(n)) continue;
        score += (weights[metric] ?? 0) * n;
    }
    return score;
}

export function gradeFromScore(qualityScore) {
    if (qualityScore >= 90) return 'A';
    if (qualityScore >= 75) return 'B';
    return 'C';
}
