import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import BrutalistHeader from '@/components/BrutalistHeader';
import BrutalistFooter from '@/components/BrutalistFooter';
import ZohoSalesIQWidget from '@/components/ZohoSalesIQWidget';
import PageSenseTracker from '@/components/PageSenseTracker';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <View style={{ flex: 1 }}>
        <BrutalistHeader showBackButton={false} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide default tab bar since we use custom header
          }}>
          <Tabs.Screen 
            name="index" 
            options={{
              title: 'App',
            }} 
          />
          <Tabs.Screen 
            name="briefs" 
            options={{
              title: 'Briefs',
            }} 
          />
          <Tabs.Screen 
            name="profile" 
            options={{
              title: 'Profile',
            }} 
          />
        </Tabs>
        <BrutalistFooter />
        <ZohoSalesIQWidget />
        <PageSenseTracker />
      </View>
    </AuthGuard>
  );
}
