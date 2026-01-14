import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const login = async () => {
    if (!email || !password) {
      setErrorMsg("Email and password are required");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", { data, error });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (!data.session) {
      setErrorMsg("Login failed. Please verify your email.");
      return;
    }

    // ✅ SUCCESS
    // RootLayout will auto-redirect to /(tabs)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MineCast</Text>
      <Text style={styles.subtitle}>Watch. Earn. Mine.</Text>

      {errorMsg && (
        <Text style={styles.error}>{errorMsg}</Text>
      )}

      <TextInput
        mode="outlined"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={login}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Log In
      </Button>

      <Button
        mode="text"
        textColor="#aaa"
        onPress={() => router.push("/(auth)/signup")}
      >
        Don’t have an account? Sign up
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
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
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
  error: {
    color: "#ff4444",
    marginBottom: 12,
    textAlign: "center",
  },
});