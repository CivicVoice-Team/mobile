import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

const DEFAULT_MAX_HEIGHT = 280;

export function NewsCardImage({
  uri,
  maxHeight = DEFAULT_MAX_HEIGHT,
  backgroundColor = 'transparent',
}: {
  uri: string;
  maxHeight?: number;
  backgroundColor?: string;
}) {
  const [boxWidth, setBoxWidth] = useState(0);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);

  let height = 180;
  if (boxWidth > 0 && natural) {
    height = Math.min(maxHeight, boxWidth * (natural.height / natural.width));
  }

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => {
        const nextWidth = Math.round(e.nativeEvent.layout.width);
        setBoxWidth((prev) => (prev === nextWidth ? prev : nextWidth));
      }}
    >
      <Image
        source={{ uri }}
        style={[styles.image, { height, backgroundColor }]}
        contentFit="contain"
        onLoad={(e) => {
          const width = e.source?.width;
          const nextHeight = e.source?.height;
          if (width && nextHeight) {
            setNatural({ width, height: nextHeight });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  image: {
    width: '100%',
    borderRadius: 12,
  },
});
