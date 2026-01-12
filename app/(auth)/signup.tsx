import { supabase } from '@/utils/supabase';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() { 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSignup = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username, 
          },
        },
      });

      if (error) {
        Alert.alert('Signup Failed', error.message);
      } else {
        Alert.alert('Success', 'Check your email for the confirmation link!');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'An unexpected error occurred');
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
      </View>
    </View>
  );
}