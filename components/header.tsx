import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderBarProps {
  title: string;
  titleIconName?: keyof typeof MaterialIcons.glyphMap;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onNotificationPress?: () => void;
  onOptionsPress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  titleIconName,
  showSearch = true,
  searchValue,
  onSearchChange,
  onNotificationPress,
  onOptionsPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCancelSearch = () => {
    setIsExpanded(false);
    Keyboard.dismiss(); // Oculta el teclado
  };

  return (
    <View style={styles.container}>
      
      {/* Título: Solo se muestra si NO está expandido */}
      {!isExpanded && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {titleIconName && (
            <MaterialIcons name={titleIconName} size={24} color="#111827" style={styles.titleIcon} />
          )}
        </View>
      )}

      {/* Barra de Búsqueda */}
      {showSearch && (
        <View style={[styles.searchContainer, isExpanded && styles.searchExpanded]}>
          {isExpanded && (
            <TouchableOpacity onPress={handleCancelSearch} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
          )}
          
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            placeholderTextColor="#6488b3"
            value={searchValue}
            onChangeText={onSearchChange}
            onFocus={() => setIsExpanded(true)} // Expande al presionar
          />
          <MaterialIcons name="search" size={20} color="#6488b3" />
        </View>
      )}

      {/* Iconos de Acción: Solo se muestran si NO está expandido */}
      {!isExpanded && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onNotificationPress}>
            <MaterialIcons name="notifications-none" size={28} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onOptionsPress}>
            <MaterialIcons name="more-vert" size={28} color="#334155" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b699e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    elevation: 3,
  },
  titleText: {
    color: '#e0f2fe',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  titleIcon: {
    marginLeft: 4,
  },
  searchContainer: {
    flex: 1, // Toma el espacio restante por defecto
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#86a8cf',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
  },
  searchExpanded: {
    marginHorizontal: 0, // Al expandirse, elimina los márgenes para usar el 100%
  },
  searchInput: {
    flex: 1,
    color: '#1e293b',
    fontSize: 16,
    marginLeft: 8,
  },
  backButton: {
    marginRight: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});