import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface ImageGridProps {
  imageUrl: string[];
}

const placeholder = require('../../assets/EventraLogo.png');

const ImageGrid: React.FC<ImageGridProps> = ({ imageUrl }) => {
  const renderImage = (uri?: string, style?: any) => (
    <Image
      source={uri ? { uri } : placeholder}
      style={style}
      resizeMode="cover"
      defaultSource={placeholder}
    />
  );

  if (!imageUrl || imageUrl.length === 0) {
    return renderImage(undefined, styles.singleImage);
  }

  if (imageUrl.length === 1) {
    return renderImage(imageUrl[0], styles.singleImage);
  }

  if (imageUrl.length === 2) {
    return (
      <View style={styles.row}>
        {imageUrl.map((img, idx) => renderImage(img, styles.halfImage))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      {renderImage(imageUrl[0], styles.halfImage)}
      <View style={styles.column}>
        {renderImage(imageUrl[1], styles.quarterImage)}
        <View style={styles.quarterContainer}>
          {renderImage(imageUrl[2], styles.quarterImage)}
          {imageUrl.length > 3 && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>+{imageUrl.length - 3}</Text>
            </View>
          )}
        </View>
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
