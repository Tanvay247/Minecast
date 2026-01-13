import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function () {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
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

        router.replace('/');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Unexpected error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className='w-full p-4'>
        <Text className='text-black font-bold text-3xl text-center mb-4'>Login</Text>
        <TextInput 
        className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4' 
        value={email}
        onChangeText={setEmail}
        placeholder='email'
        />
        <TextInput 
        secureTextEntry={true} 
        className='bg-white p-4 rounded-lg border border-gray-300 w-full mb-4'
        value={password}
        onChangeText={setPassword} 
        placeholder='password'
        />
        <TouchableOpacity
          className="bg-black p-4 rounded-lg"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className='text-white font-bold text-center'>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={() => router.push('/(auth)/signup')}
        >
         <Text className='text-black font-semibold text-center mt-3'>Signup</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}