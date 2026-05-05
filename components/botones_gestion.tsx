import React from 'react';
import { Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionButtonProps {
  text: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
}

export const ButtonGestion: React.FC<ActionButtonProps> = ({
  text,
  iconName,
  onPress,
  containerStyle,
  textStyle,
  iconSize = 36,
  iconColor = '#000000',
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textStyle]}>{text}</Text>
      {iconName && (
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} style={styles.icon} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4a7fb8',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    maxWidth: 220, 
  },
  text: {
    color: '#e0f2fe',
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1, 
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  icon: {
    marginLeft: 4,
  },
});