import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ImageUploadCardProps {
  images: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ images, onAdd, onRemove }) => (
  <View style={styles.container}>
    <View style={styles.imageRow}>
      {images.map((img, idx) => (
        <View key={idx} style={styles.imageBox}>
          <Image source={{ uri: img }} style={styles.image} />
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(idx)}>
            <Text style={styles.removeText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  imageRow: { flexDirection: 'row', alignItems: 'center' },
  imageBox: { position: 'relative', marginRight: 10 },
  image: { width: 60, height: 60, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 10, padding: 2, elevation: 2 },
  removeText: { color: '#f00', fontSize: 18, fontWeight: 'bold' },
  addBtn: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eaf0fa', alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#2788ff', fontSize: 32, fontWeight: 'bold' },
});

export default ImageUploadCard;
