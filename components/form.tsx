import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  label?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap; // Tipado exacto para MaterialIcons
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  iconName,
  containerStyle,
  ...rest // Permite pasar props nativas de TextInput (placeholder, onChangeText, etc.)
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#6a87af" // Ajuste de color según tu imagen
          {...rest}
        />
        {iconName && (
          <MaterialIcons name={iconName} size={24} color="#111827" style={styles.icon} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ancho por defecto, sobreescribible con containerStyle
    marginBottom: 16,
  },
  label: {
    color: '#d8e0ea',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d5386', // Fondo simulado de la imagen
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56, // Altura base
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  icon: {
    marginLeft: 12,
  },
});