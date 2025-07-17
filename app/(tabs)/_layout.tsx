import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import BrutalistHeader from '@/components/BrutalistHeader';
import BrutalistFooter from '@/components/BrutalistFooter';
import ZohoSalesIQWidget from '@/components/ZohoSalesIQWidget';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <BrutalistHeader showBackButton={true} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="explore" />
      </Stack>
      <BrutalistFooter />
      <ZohoSalesIQWidget widgetCode="siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab" />
    </View>
  );
}
