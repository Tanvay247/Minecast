import { ethers } from "ethers";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

import {
  MINE_TOKEN_ADDRESS,
  TREASURY_ADDRESS,
} from "@/lib/contracts";

import {
  MineTokenABI,
  TreasuryABI,
} from "@/lib/abis";

export default function Wallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [pending, setPending] = useState("0");
  const [loading, setLoading] = useState(false);

  // WalletConnect provider (mobile only)
  const wcProviderRef = useRef<any>(null);

  // 🔹 Connect Wallet
  async function connectWallet() {
    try {
      // 🌐 WEB → MetaMask extension
      if (Platform.OS === "web") {
        // @ts-ignore
        if (!window.ethereum) {
          alert("MetaMask not installed");
          return;
        }

        // @ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        setAddress(addr);
        await loadBalances(provider, addr);
        return;
      }

      // 📱 MOBILE → WalletConnect (lazy loaded)
      if (!wcProviderRef.current) {
        const module = await import("@/lib/walletConnect");
        wcProviderRef.current =
          await module.createWalletConnectProvider();
      }

      const wcProvider = wcProviderRef.current;

      if (!wcProvider.connected) {
        await wcProvider.connect();
      }

      const provider = new ethers.BrowserProvider(wcProvider);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAddress(addr);
      await loadBalances(provider, addr);
    } catch (err) {
      console.error(err);
      Alert.alert("Wallet error", "Failed to connect wallet");
    }
  }

  // 🔹 Load balances
  async function loadBalances(
    provider: ethers.Provider,
    addr: string
  ) {
    const mineToken = new ethers.Contract(
      MINE_TOKEN_ADDRESS,
      MineTokenABI,
      provider
    );

    const treasury = new ethers.Contract(
      TREASURY_ADDRESS,
      TreasuryABI,
      provider
    );

    const bal = await mineToken.balanceOf(addr);
    const pend = await treasury.pendingRewards(addr);

    setBalance(ethers.formatUnits(bal, 18));
    setPending(ethers.formatUnits(pend, 18));
  }

  // 🔹 Claim rewards
  async function claimRewards() {
    if (!address) return;

    try {
      setLoading(true);

      let provider: ethers.BrowserProvider;

      if (Platform.OS === "web") {
        // @ts-ignore
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        if (!wcProviderRef.current) {
          Alert.alert("Wallet not connected");
          return;
        }
        provider = new ethers.BrowserProvider(
          wcProviderRef.current
        );
      }

      const signer = await provider.getSigner();

      const treasury = new ethers.Contract(
        TREASURY_ADDRESS,
        TreasuryABI,
        signer
      );

      const tx = await treasury.claimReward();
      await tx.wait();

      await loadBalances(provider, address);
    } catch (err) {
      console.error(err);
      Alert.alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Wallet</Text>
      <Text style={styles.subtitle}>
        Manage your MineToken rewards
      </Text>

      {!address ? (
        <Button
          mode="contained"
          onPress={connectWallet}
          style={styles.button}
        >
          Connect Wallet
        </Button>
      ) : (
        <>
          <Text style={styles.address}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              MineToken Balance
            </Text>
            <Text style={styles.value}>
              {balance} MT
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              Unclaimed Rewards
            </Text>
            <Text style={styles.value}>
              {pending} MT
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={claimRewards}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              "Claim Rewards"
            )}
          </Button>
        </>
      )}
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
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 32,
  },
  address: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    color: "#888",
    marginBottom: 4,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
});