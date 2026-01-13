import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() { 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        Alert.alert('Signup Failed', error.message);
        return;
      }

      if (data?.user) {
        const res = await fetch('http://localhost:4000/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          walletAddress: '0xTEMP',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('SYNC USER FAILED:', text);
        throw new Error('User sync failed');
      }

        Alert.alert(
          'Success',
          'Account created!',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className='w-full p-4'>
        <Text className='text-black font-bold text-3xl text-center mb-4'>Signup</Text>
        
        <TextInput 
          className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4' 
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          autoCapitalize="none" 
          keyboardType="email-address"
        />

        <TextInput 
          className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4' 
          value={username}
          onChangeText={setUsername}
          placeholder='Username'
        />

        <TextInput 
          secureTextEntry={true} 
          className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4'
          value={password}
          onChangeText={setPassword} 
          placeholder='Password'
        />

        <TouchableOpacity 
          className="bg-black p-4 rounded-lg" 
          onPress={handleSignup}
          disabled={loading}
        >
         {loading ? (
            <ActivityIndicator color="#fff" />
         ) : (
            <Text className='text-white text-center'>Signup</Text>
         )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-black font-semibold text-center mt-3">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}