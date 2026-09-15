/**
 * Derives sentiment distribution counts from an array of review objects.
 * @param {Array} reviews - Array of review objects with a `sentiment` field
 * @returns {{ positive: number, neutral: number, negative: number }} Counts per sentiment
 */
export function computeSentimentDistribution(reviews) {
  const distribution = { positive: 0, neutral: 0, negative: 0 };

  reviews.forEach((review) => {
    const s = review.sentiment;
    if (s === 'positive' || s === 'neutral' || s === 'negative') {
      distribution[s] += 1;
    }
  });

  return distribution;
}

/**
 * Converts raw sentiment counts to Recharts-compatible pie chart data.
 * @param {Array} reviews - Array of review objects
 * @returns {Array} Array of { name, value, color } objects for Recharts PieChart
 */
export function getSentimentPieData(reviews) {
  const dist = computeSentimentDistribution(reviews);

  return [
    { name: 'Positive', value: dist.positive, color: '#34d399' },
    { name: 'Neutral',  value: dist.neutral,  color: '#fbbf24' },
    { name: 'Negative', value: dist.negative, color: '#fb7185' },
  ].filter((d) => d.value > 0);
}
