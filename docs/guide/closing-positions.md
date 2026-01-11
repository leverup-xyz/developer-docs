# Closing Positions

To close a position, you use the `TradingPortalFacet`.

## Method: `closeTrade`

Closes a single trade.

```solidity
function closeTrade(bytes32 tradeHash) external
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `tradeHash` | `bytes32` | The unique identifier of the position to close. |

## Method: `batchCloseTrade`

Closes multiple trades in one transaction.

```solidity
function batchCloseTrade(bytes32[] memory tradeHashes) external
```

### Finding the Trade Hash

You can find the `tradeHash` by querying the open positions using `getPositionsV2` (see [Reading Positions](/guide/reading-positions)).

### Example Usage

Here is a complete, runnable example using Viem. This script connects to the **Monad Mainnet** and closes a specific position by its trade hash.

> **Note**: Replace `YOUR_PRIVATE_KEY` with your actual private key.

```javascript
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad } from 'viem/chains'; // or define custom chain

// --- Configuration ---
const RPC_URL = "https://rpc.monad.xyz/";
const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"; // WARNING: Handle securely!

// Contract Address (Monad Mainnet)
const LEVERUP_DIAMOND = "0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec";

// --- ABI ---
const TRADING_PORTAL_ABI = [
  {
    name: "closeTrade",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tradeHash", type: "bytes32" }],
    outputs: []
  }
];

async function main() {
  // 1. Setup Clients
  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: monad,
    transport: http(RPC_URL)
  });

  const walletClient = createWalletClient({
    account,
    chain: monad,
    transport: http(RPC_URL)
  });

  console.log(`Connected wallet: ${account.address}`);

  // 2. Identify the Trade to Close
  // You can find this hash by querying open positions (see Reading Data guide).
  const tradeHash = "0x..."; // Replace with your actual tradeHash

  // 3. Close the Position
  console.log(`Closing position: ${tradeHash}...`);
  
  const tx = await walletClient.writeContract({
    address: LEVERUP_DIAMOND,
    abi: TRADING_PORTAL_ABI,
    functionName: 'closeTrade',
    args: [tradeHash]
  });
  
  console.log(`Transaction sent: ${tx}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("Position closed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

