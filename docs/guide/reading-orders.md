# Reading Limit Orders

To retrieve active limit orders for a user, you use the `getLimitOrders` function on the `LimitOrderFacet`.

## Method: `getLimitOrders`

Fetches all active limit orders for a user on a specific trading pair.

```solidity
function getLimitOrders(
    address user, 
    address pairBase
) external view returns (LimitOrderView[] memory)
```

### Parameters

-   `user`: The address of the trader.
-   `pairBase`: The base contract address of the trading pair (e.g., BTC/USD).

### Return Structure: `LimitOrderView`

The function returns an array of `LimitOrderView` structs:

```solidity
struct LimitOrderView {
    bytes32 orderHash;    // Unique order identifier
    string pair;          // Pair name (e.g., "BTC/USD")
    address pairBase;     // Pair base address
    bool isLong;          // True = Long, False = Short
    address tokenIn;      // Collateral token
    address lvToken;      // LP token
    uint96 amountIn;      // Collateral amount
    uint128 qty;          // Position size (Base Asset units, 10 decimals)
    uint128 limitPrice;   // Trigger price (18 decimals)
    uint128 stopLoss;     // Stop loss price
    uint128 takeProfit;   // Take profit price
    uint24 broker;        // Broker ID
    uint32 timestamp;     // Creation timestamp
}
```

## Example Usage (Viem)

This example fetches all active limit orders for BTC/USD on Monad Mainnet.

```javascript
import { createPublicClient, http, formatUnits } from 'viem';
import { monad } from 'viem/chains'; // or define custom chain

// Configuration (Monad Mainnet)
const RPC_URL = "https://rpc.monad.xyz/";
const LEVERUP_DIAMOND = "0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec";
// Replace with actual BTC/USD PairBase on Mainnet
const PAIR_BASE_BTC = "0x..."; 

const USER_ADDRESS = "0xYOUR_WALLET_ADDRESS";

const ABI = [
  {
    type: "function",
    inputs: [
      { type: "address", name: "user" },
      { type: "address", name: "pairBase" }
    ],
    name: "getLimitOrders",
    outputs: [
      {
        components: [
          { type: "bytes32", name: "orderHash" },
          { type: "string", name: "pair" },
          { type: "address", name: "pairBase" },
          { type: "bool", name: "isLong" },
          { type: "address", name: "tokenIn" },
          { type: "address", name: "lvToken" },
          { type: "uint96", name: "amountIn" },
          { type: "uint128", name: "qty" },
          { type: "uint128", name: "limitPrice" },
          { type: "uint128", name: "stopLoss" },
          { type: "uint128", name: "takeProfit" },
          { type: "uint24", name: "broker" },
          { type: "uint32", name: "timestamp" }
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

  console.log(`Fetching limit orders for ${USER_ADDRESS}...`);
  const orders = await client.readContract({
    address: LEVERUP_DIAMOND,
    abi: ABI,
    functionName: 'getLimitOrders',
    args: [USER_ADDRESS, PAIR_BASE_BTC]
  });

  if (orders.length === 0) {
    console.log("No active limit orders found.");
    return;
  }

  orders.forEach((order, index) => {
    console.log(`\nOrder #${index + 1}:`);
    console.log(`Hash: ${order.orderHash}`);
    console.log(`Type: Limit ${order.isLong ? "Long" : "Short"}`);
    console.log(`Trigger Price: $${formatUnits(order.limitPrice, 18)}`);
    // Assuming BTC/USD where BTC has 10 decimals in qty context
    // You might need dynamic logic if pair splitting is strictly required, 
    // but here we just log it.
    console.log(`Size: ${formatUnits(order.qty, 10)} ${order.pair.split('/')[0]}`);
    console.log(`Collateral: ${formatUnits(order.amountIn, 6)} (USDC)`); // Assuming USDC
  });
}

main().catch(console.error);
```
