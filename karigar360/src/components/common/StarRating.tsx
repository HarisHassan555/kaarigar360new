import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = false,
}) => {
  const handleStarPress = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.xs;
      case 'lg':
        return typography.sizes.md;
      default:
        return typography.sizes.sm;
    }
  };

  const starSize = getStarSize();
  const textSize = getTextSize();

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= Math.round(rating);
          const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;

          return (
            <TouchableOpacity
              key={index}
              style={styles.star}
              onPress={() => handleStarPress(starRating)}
              disabled={!interactive}
            >
              <Text
                style={[
                  styles.starText,
                  {
                    fontSize: starSize,
                    color: isFilled ? colors.warning : colors.gray[300],
                  },
                ]}
              >
                {isHalfFilled ? '☆' : isFilled ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {showText && (
        <Text style={[styles.ratingText, { fontSize: textSize }]}>
          {rating.toFixed(1)} ({maxRating})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  star: {
    marginRight: 2,
  },
  starText: {
    fontWeight: 'bold',
  },
  ratingText: {
    color: colors.gray[600],
    fontWeight: '500',
  },
});