import EthereumProvider from "@walletconnect/ethereum-provider";
import { Platform } from "react-native";

export async function createWalletConnectProvider() {
  return await EthereumProvider.init({
    projectId: "3e96175d6361f84a776aa909c629fa41",
    chains: [11155111], // Sepolia
    showQrModal: Platform.OS === "web",
    methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign"],
    events: ["chainChanged", "accountsChanged"],
    metadata: {
      name: "MineCast",
      description: "Watch. Earn. Mine.",
      url: "https://minecast.app",
      icons: ["https://minecast.app/icon.png"],
    },
  });
}