import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import BrutalistHeader from '@/components/BrutalistHeader';
import BrutalistFooter from '@/components/BrutalistFooter';
import ZohoSalesIQWidget from '@/components/ZohoSalesIQWidget';

export default function TabLayout() {
  return (
    <>
      <BrutalistHeader showBackButton={true} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#FFFFFF',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 4,
            borderTopColor: '#FFFFFF',
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 15,
            height: Platform.OS === 'ios' ? 90 : 70,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'CREAR',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="mic.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'HISTORIAL',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'EXPLORAR',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>
      <BrutalistFooter />
      <ZohoSalesIQWidget widgetCode="siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab" />
    </>
  );
}
