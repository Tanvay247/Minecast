import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    await supabase.auth.signUp({ email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Join MineCast</Text>

      <TextInput
        mode="outlined"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        theme={{ colors: { text: "white", placeholder: "#888" } }}
      />

      <TextInput
        mode="outlined"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        theme={{ colors: { text: "white", placeholder: "#888" } }}
      />

      <Button mode="contained" onPress={signup} style={styles.button}>
        Sign Up
      </Button>

      <Button
        mode="text"
        textColor="#aaa"
        onPress={() => router.back()}
      >
        Already have an account? Log in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#111",
  },
  button: {
    marginTop: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});