import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { FileExporter } from '../../utils/fileExporter';

export default function SimpleExportTest() {
  const [testBrief] = useState({
    projectTitle: "Test Brief",
    briefSummary: "This is a test brief for export functionality",
    businessChallenge: "Testing export features"
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Export</Text>
      
      <Pressable
        style={styles.button}
        onPress={() => {
          console.log('TEST BUTTON PRESSED');
          Alert.alert('Test', 'Button works!');
        }}
      >
        <Text style={styles.buttonText}>Test Alert</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: '#2563eb' }]}
        onPress={async () => {
          console.log('EXPORT BUTTON PRESSED');
          try {
            await FileExporter.downloadAsText(testBrief);
          } catch (error) {
            console.error('Export error:', error);
          }
        }}
      >
        <Text style={styles.buttonText}>Export Test Brief</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});