import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function () {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Login</Text>
      <TouchableOpacity className="bg-black p-4 rounded-lg" onPress={() => router.push('/(tabs)')} >
        <Text className='text-white text-center'>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}