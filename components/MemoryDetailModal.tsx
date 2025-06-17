import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Memory } from '@/services/memoryService';
import { X, Calendar, Tag, Edit, Trash2, Share } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface MemoryDetailModalProps {
  visible: boolean;
  memory: Memory | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export default function MemoryDetailModal({ 
  visible, 
  memory, 
  onClose, 
  onEdit, 
  onDelete, 
  onShare 
}: MemoryDetailModalProps) {
  const { colors } = useTheme();

  if (!memory) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {memory.title}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onShare} style={styles.headerActionButton}>
              <Share color={colors.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit} style={styles.headerActionButton}>
              <Edit color={colors.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.headerActionButton}>
              <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo */}
          {memory.photoUrl && (
            <View style={styles.photoContainer}>
              <Image 
                source={{ uri: memory.photoUrl }} 
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Memory Info */}
          <View style={styles.memoryInfo}>
            <Text style={[styles.title, { color: colors.text }]}>
              {memory.title}
            </Text>

            {/* Date */}
            <View style={styles.dateContainer}>
              <Calendar color={colors.textSecondary} size={16} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(memory.date)}
              </Text>
            </View>

            {/* Description */}
            {memory.description && (
              <View style={styles.descriptionContainer}>
                <Text style={[styles.description, { color: colors.text }]}>
                  {memory.description}
                </Text>
              </View>
            )}

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <View style={styles.tagsHeader}>
                  <Tag color={colors.textSecondary} size={16} />
                  <Text style={[styles.tagsTitle, { color: colors.textSecondary }]}>
                    Tags
                  </Text>
                </View>
                <View style={styles.tagsList}>
                  {memory.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Additional Info */}
            <View style={[styles.additionalInfo, { backgroundColor: colors.card }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Criada em
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(memory.createdAt)}
                </Text>
              </View>
              
              {memory.isPublic && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Visibilidade
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    Pública
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    width: '100%',
    height: height * 0.4,
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  memoryInfo: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  additionalInfo: {
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 