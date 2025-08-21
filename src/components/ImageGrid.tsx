import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../api/axios';

interface ImageGridProps {
  imageUrl: string[];
  onImagePress?: (index: number) => void;
}

const placeholder = require('../../assets/EventraLogo.png');

const ImageGrid: React.FC<ImageGridProps> = ({ imageUrl, onImagePress }) => {
  const getImageUrl = (imageUrl: string | undefined | null): string | undefined => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith('http')) return imageUrl;
    // If already starts with /uploads, just prepend baseURL
    if (imageUrl.startsWith('/uploads')) {
      return `${api.defaults.baseURL?.replace(/\/api$/, '')}${imageUrl}`;
    }
    // If starts with /, but not /uploads, add /uploads
    if (imageUrl.startsWith('/')) {
      return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads${imageUrl}`;
    }
    // Otherwise, add /uploads/
    return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${imageUrl}`;
  };

  const renderImage = (uri?: string, containerStyle?: any, index?: number) => {
    const Img = (
      <Image
        source={uri ? { uri: getImageUrl(uri) } : placeholder}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        defaultSource={placeholder}
      />
    );
    if (typeof index === 'number' && onImagePress) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onImagePress(index)}
          style={containerStyle}
        >
          {Img}
        </TouchableOpacity>
      );
    }
    return <View style={containerStyle}>{Img}</View>;
  };

  if (!imageUrl || imageUrl.length === 0) {
    return renderImage(undefined, styles.singleImage, 0);
  }

  if (imageUrl.length === 1) {
    return renderImage(imageUrl[0], styles.singleImage, 0);
  }

  if (imageUrl.length === 2) {
    return (
      <View style={styles.row}>
        {imageUrl.map((img, idx) => renderImage(img, styles.halfImage, idx))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {renderImage(imageUrl[0], styles.halfImage, 0)}
      <View style={styles.column}>
    {renderImage(imageUrl[1], styles.quarterImage, 1)}
    {onImagePress ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onImagePress(2)}
            style={styles.quarterContainer}
          >
      {renderImage(imageUrl[2], styles.quarterImage)}
            {imageUrl.length > 3 && (
              <View style={styles.overlay} pointerEvents="none">
                <Text style={styles.overlayText}>+{imageUrl.length - 3}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.quarterContainer}>
      {renderImage(imageUrl[2], styles.quarterImage)}
            {imageUrl.length > 3 && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>+{imageUrl.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ImageGrid;

const styles = StyleSheet.create({
  singleImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    height: 250,
  },
  halfImage: {
    width: '50%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  quarterImage: {
    width: '100%',
    height: '50%',
    backgroundColor: '#f0f0f0',
  },
  quarterContainer: {
    position: 'relative',
    width: '100%',
    height: '50%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});