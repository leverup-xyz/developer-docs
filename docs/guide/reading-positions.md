# Reading Positions

This guide explains how to fetch open positions for a user from the LeverUp protocol.

## Method: `getPositionsV2`

To get all open positions for a specific user and trading pair, you use the `getPositionsV2` function on the **TradingReaderFacet**.

```solidity
function getPositionsV2(address user, address pairBase) external view returns (Position[] memory)
```

> **Note**: `getPositionsV2` is a view function and does not cost gas to call.

### Return Structure: `Position`

The function returns an array of `Position` structs.

```solidity
struct Position {
    bytes32 positionHash; // Unique identifier
    string pair;          // Pair name (e.g. "BTC/USD")
    address pairBase;     // Pair base address
    address tokenIn;      // Collateral token
    address marginToken;  // Token used for margin (usually same as tokenIn)
    bool isLong;          // True = Long, False = Short
    uint96 margin;        // Current margin amount
    uint128 qty;          // Position size
    uint128 entryPrice;   // Entry price
    uint128 stopLoss;     // Stop loss price
    uint128 takeProfit;   // Take profit price
    uint96 openFee;       // Fee paid to open
    uint96 executionFee;  // Execution fee
    int256 fundingFee;    // Accrued funding fee (+/-)
    uint32 timestamp;     // Last update timestamp
    uint96 holdingFee;    // Accrued holding fee
}
```

## Example Usage (Viem)

This example fetches all open BTC/USD positions for a user on Monad Mainnet.

```javascript
import { createPublicClient, http, formatUnits } from 'viem';
import { monad } from 'viem/chains'; // or define custom chain

// Configuration (Monad Mainnet)
const RPC_URL = "https://rpc.monad.xyz/";
const LEVERUP_DIAMOND = "0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec";

// Replace with the actual Mainnet PairBase address for BTC/USD
const PAIR_BASE_BTC = "0x..."; 

const USER_ADDRESS = "0xYOUR_WALLET_ADDRESS"; // Replace with user address

// Minimal ABI
const READER_ABI = [
  {
    type: "function",
    inputs: [
      { type: "address", name: "user" },
      { type: "address", name: "pairBase" }
    ],
    name: "getPositionsV2",
    outputs: [
      {
        components: [
          { type: "bytes32", name: "positionHash" },
          { type: "string", name: "pair" },
          { type: "address", name: "pairBase" },
          { type: "address", name: "tokenIn" },
          { type: "address", name: "marginToken" },
          { type: "bool", name: "isLong" },
          { type: "uint96", name: "margin" },
          { type: "uint128", name: "qty" },
          { type: "uint128", name: "entryPrice" },
          { type: "uint128", name: "stopLoss" },
          { type: "uint128", name: "takeProfit" },
          { type: "uint96", name: "openFee" },
          { type: "uint96", name: "executionFee" },
          { type: "int256", name: "fundingFee" },
          { type: "uint32", name: "timestamp" },
          { type: "uint96", name: "holdingFee" }
        ],
        type: "tuple[]",
        name: ""
      }
    ],
    stateMutability: "view"
  }
];

async function main() {
  const client = createPublicClient({
    chain: monad,
    transport: http(RPC_URL)
  });

  console.log(`Fetching positions for ${USER_ADDRESS}...`);
  
  const positions = await client.readContract({
    address: LEVERUP_DIAMOND,
    abi: READER_ABI,
    functionName: 'getPositionsV2',
    args: [USER_ADDRESS, PAIR_BASE_BTC]
  });

  if (positions.length === 0) {
    console.log("No open positions found.");
    return;
  }

  positions.forEach((pos, index) => {
    console.log(`\nPosition #${index + 1}:`);
    console.log(`Hash: ${pos.positionHash}`);
    console.log(`Pair: ${pos.pair}`);
    console.log(`Type: ${pos.isLong ? "LONG" : "SHORT"}`);
    // Note: Decimals depend on the specific field (see docs)
    console.log(`Entry Price: ${formatUnits(pos.entryPrice, 18)} USD`); 
    console.log(`Margin: ${formatUnits(pos.margin, 6)} USDC`); // Assuming USDC collateral
    console.log(`Size: ${formatUnits(pos.qty, 10)} ${pos.pair.split('/')[0]}`); // Base Asset Qty (10 decimals)
  });
}

main().catch(console.error);
```

