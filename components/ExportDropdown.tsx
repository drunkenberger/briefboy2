import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Modal } from 'react-native';

interface ExportDropdownProps {
  briefToShow: any;
  handleExportBrief: (brief: any, format: 'txt' | 'md' | 'html' | 'json' | 'all') => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ briefToShow, handleExportBrief }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const exportOptions = [
    { label: 'Texto Plano (.txt)', format: 'txt', icon: '📄' },
    { label: 'Markdown (.md)', format: 'md', icon: '📝' },
    { label: 'HTML (.html)', format: 'html', icon: '🌐' },
    { label: 'JSON (.json)', format: 'json', icon: '📊' },
    { label: 'Todos los Formatos', format: 'all', icon: '📦' },
  ];

  return (
    <>
      <Pressable
        style={styles.exportButton}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={styles.exportButtonIcon}>📤</Text>
        <Text style={styles.exportButtonText}>Exportar</Text>
      </Pressable>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>SELECCIONAR FORMATO</Text>
            {exportOptions.map((option) => (
              <Pressable
                key={option.format}
                style={styles.dropdownOption}
                onPress={() => {
                  handleExportBrief(briefToShow, option.format as any);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownOptionIcon}>{option.icon}</Text>
                <Text style={styles.dropdownOptionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  exportButton: {
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  exportButtonIcon: {
    fontSize: 20,
  },
  exportButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111111',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#333333',
  },
  dropdownOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dropdownOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default ExportDropdown;