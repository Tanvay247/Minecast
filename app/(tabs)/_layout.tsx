import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#ff0050',   // active (MineCast pink)
        tabBarInactiveTintColor: '#888',    // inactive
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ marginBottom: 18 }}>
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={54}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? 'message-processing'
                  : 'message-processing-outline'
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}