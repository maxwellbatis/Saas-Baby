import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

interface Activity {
  id: string;
  type: string;
  title: string;
  time: string;
  duration?: string;
  amount?: string;
  weight?: string;
  notes?: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${activity.color}15` }]}>
            {activity.icon}
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{activity.title}</Text>
            <View style={styles.timeContainer}>
              <Clock color="#6B7280" size={12} />
              <Text style={styles.time}>{activity.time}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.details}>
          {activity.duration && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duração</Text>
              <Text style={styles.detailValue}>{activity.duration}</Text>
            </View>
          )}
          
          {activity.amount && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantidade</Text>
              <Text style={styles.detailValue}>{activity.amount}</Text>
            </View>
          )}
          
          {activity.weight && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Peso</Text>
              <Text style={styles.detailValue}>{activity.weight}</Text>
            </View>
          )}
        </View>
        
        {activity.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notes}>{activity.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  notes: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
});