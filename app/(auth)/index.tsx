import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function () {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const handleLogin = () => {
    console.log(email, password);
    alert("Button Pressed")
  }
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
        >
         <Text className='text-white font-bold text-center'>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={() => router.push('/signup')}
        >
         <Text className='text-black font-semibold text-center mt-3'>Signup</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}