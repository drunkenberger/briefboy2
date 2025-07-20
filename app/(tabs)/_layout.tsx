import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import BrutalistHeader from '@/components/BrutalistHeader';
import BrutalistFooter from '@/components/BrutalistFooter';
import ZohoSalesIQWidget from '@/components/ZohoSalesIQWidget';
import PageSenseTracker from '@/components/PageSenseTracker';

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
      <ZohoSalesIQWidget />
      <PageSenseTracker />
    </View>
  );
}
