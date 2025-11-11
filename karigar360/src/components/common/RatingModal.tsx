import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from './Button';
import { StarRating } from './StarRating';
import { colors, shadows, spacing, typography } from '../../utils/theme';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  workerName: string;
  taskTitle: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  workerName,
  taskTitle,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (review.trim().length < 10) {
      Alert.alert('Review Required', 'Please write at least 10 characters for your review.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(rating, review.trim());
      setRating(0);
      setReview('');
      onClose();
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.workerName}>{workerName}</Text>
            <Text style={styles.taskTitle}>{taskTitle}</Text>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>How was your experience?</Text>
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size="lg"
                showText
              />
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Write a review (optional but recommended)</Text>
              <TextInput
                style={styles.reviewInput}
                value={review}
                onChangeText={setReview}
                placeholder="Tell others about your experience with this worker..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {review.length}/500 characters
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={submitting ? 'Submitting...' : 'Submit Rating'}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: 'bold',
  },
  content: {
    padding: spacing.lg,
  },
  workerName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  taskTitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  reviewSection: {
    marginBottom: spacing.lg,
  },
  reviewLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.gray[900],
    backgroundColor: colors.gray[50],
    minHeight: 100,
  },
  characterCount: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

