
export const MineTokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export const TreasuryABI = [
  "function pendingRewards(address user) view returns (uint256)",
  "function claimReward()"
];

export const PaymentCollectorABI = [
  "function pay(uint256 amount, string purpose)"
];

export const RareVideoNFTABI = [
  "function balanceOf(address owner) view returns (uint256)"
];