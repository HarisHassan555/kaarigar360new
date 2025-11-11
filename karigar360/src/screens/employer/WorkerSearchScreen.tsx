import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { EmployerStackParamList } from '../../navigation/types';
import { getWorkers, searchWorkers } from '../../services/firebase/workerService';
import { Worker, WORKER_SKILLS } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { shadows, spacing, typography } from '../../utils/theme';

type Props = NativeStackScreenProps<EmployerStackParamList, 'WorkerSearch'>;

export const WorkerSearchScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load workers on component mount
  useEffect(() => {
    loadWorkers();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || selectedSkill) {
        handleSearch();
      } else {
        loadWorkers();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedSkill]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const workersData = await getWorkers();
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      const filteredWorkers = await searchWorkers(selectedSkill || undefined, searchQuery.trim() || undefined);
      setWorkers(filteredWorkers);
    } catch (error) {
      console.error('Error searching workers:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (searchQuery.trim() || selectedSkill) {
      await handleSearch();
    } else {
      await loadWorkers();
    }
  }, [searchQuery, selectedSkill]);

  const renderWorkerCard = ({ item }: { item: Worker }) => {
    if (!item.profile) return null;

    return (
      <TouchableOpacity
      style={styles.workerCard}
      onPress={() => navigation.navigate('WorkerProfile', { workerId: item.uid })}
    >
      <View style={styles.workerHeader}>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.profile?.fullName}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {(item.profile?.rating || 0).toFixed(1)}</Text>
            <Text style={styles.experience}>
              {item.profile?.experienceYears || 0} years exp.
            </Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>PKR {item.profile?.hourlyRate || 0}/hr</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.profile?.description}
      </Text>
      
      <View style={styles.skillsContainer}>
        {item.profile.skills?.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.profile.skills && item.profile.skills.length > 3 && (
          <Text style={styles.moreSkills}>
            +{item.profile.skills.length - 3} more
          </Text>
        )}
      </View>
      
      {item.profile.cnicVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ CNIC Verified</Text>
        </View>
      )}
    </TouchableOpacity>
    );
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading workers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Find Workers</Text>
          {searching && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.searchIndicator}
            />
          )}
        </View>
        {workers.length > 0 && (
          <Text style={styles.resultCount}>
            {workers.length} worker{workers.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      <View style={styles.searchSection}>
        <Input
          placeholder="Search by name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.skillsFilter}
        >
          <TouchableOpacity
            style={[
              styles.skillFilterItem,
              !selectedSkill && styles.skillFilterItemActive,
            ]}
            onPress={() => setSelectedSkill(null)}
          >
            <Text
              style={[
                styles.skillFilterText,
                !selectedSkill && styles.skillFilterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {WORKER_SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillFilterItem,
                selectedSkill === skill && styles.skillFilterItemActive,
              ]}
              onPress={() => setSelectedSkill(skill)}
            >
              <Text
                style={[
                  styles.skillFilterText,
                  selectedSkill === skill && styles.skillFilterTextActive,
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={workers}
        renderItem={renderWorkerCard}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.workersList}
        showsVerticalScrollIndicator={false}
        refreshing={searching}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedSkill 
                ? 'No workers found matching your criteria'
                : 'No workers available'
              }
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  searchIndicator: {
    marginLeft: spacing.sm,
  },
  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  searchSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  skillsFilter: {
    flexDirection: 'row',
  },
  skillFilterItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  skillFilterItemActive: {
    backgroundColor: colors.primary,
  },
  skillFilterText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  skillFilterTextActive: {
    color: colors.white,
  },
  workersList: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  workerCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    marginRight: spacing.sm,
  },
  experience: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  skillTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  skillText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 