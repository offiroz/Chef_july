const RATING_SYSTEM = {
  MIN_DISPLAY_RATING: 3.5,
  RECOMMENDED_RATING: 4.0,
  MIN_RATINGS_COUNT: 3,
  FIRST_RATING_WEIGHT: 0.8,

  calculateWeightedAverage: (ratings) => {
    if (ratings.length === 0) return 0;
    if (ratings.length === 1) return ratings[0].score * RATING_SYSTEM.FIRST_RATING_WEIGHT;

    const weightedSum = ratings.reduce((sum, rating, index) => {
      const recencyWeight = 1 + (index / ratings.length) * 0.2;
      return sum + (rating.score * recencyWeight);
    }, 0);

    const totalWeight = ratings.reduce((sum, _rating, index) => {
      return sum + (1 + (index / ratings.length) * 0.2);
    }, 0);

    return weightedSum / totalWeight;
  }
};

module.exports = RATING_SYSTEM;
