# Limit Orders

Limit orders allow you to set a specific price at which you want to open a position.

## Method: `openLimitOrderWithPyth`

Creates a limit order.

```solidity
function openLimitOrderWithPyth(
    IBook.OpenDataInput memory data,
    bytes[] memory priceUpdateData
) external payable returns (bytes32 orderHash)
```

The `data` structure is the same as for [Market Orders](/guide/market-orders). The key difference is the `price` field in `data` acts as the trigger price.

For details on how to fetch `priceUpdateData` and calculate the required `value` (fee), please refer to the [Fetching Oracle Data](/guide/market-orders#fetching-oracle-data-pyth) section.

## Parameters

### `data` (OpenDataInput)

When placing a limit order, the fields in `OpenDataInput` have specific meanings:

| Field | Description |
| :--- | :--- |
| `price` | **Trigger Price**: The price at which you want the order to execute. <br> - **Long**: Price must be *below* current market price. <br> - **Short**: Price must be *above* current market price. |
| `qty` | Position size in Base Asset units (e.g., BTC). |
| `amountIn` | Collateral amount (must include open fee). |

## Example Usage (Viem)

This example places a **Limit Long** order on BTC/USD at a price of **95,000 USD**.

> **Note**: This example uses Monad Mainnet addresses. Ensure you replace `YOUR_PRIVATE_KEY` and verify `PAIR_BASE`.

```javascript
import { createWalletClient, createPublicClient, http, parseUnits, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad } from 'viem/chains'; // or define custom chain

// --- Configuration (Monad Mainnet) ---
const RPC_URL = "https://rpc.monad.xyz/";
const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY";

const LEVERUP_DIAMOND = "0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec";
const USDC_ADDRESS = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";
const PYTH_CONTRACT = "0x2880aB155794e7179c9eE2e38200202908C17B43";

// BTC/USD Parameters
const PAIR_BASE = "0x..."; // Find exact PairBase address for BTC/USD on Mainnet
const LV_TOKEN = "0xFD44B35139Ae53FFF7d8F2A9869c503D987f00d1"; // LVUSD
const PYTH_PRICE_ID_BTC = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const PYTH_PRICE_ID_USDC = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

// --- ABIs ---
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }]
  }
];

const PYTH_ABI = [
  {
    name: "getUpdateFee",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "updateData", type: "bytes[]" }],
    outputs: [{ name: "fee", type: "uint256" }]
  }
];

const LIMIT_ORDER_ABI = [
  {
    inputs: [
      {
        components: [
          { type: "address", name: "pairBase" },
          { type: "bool", name: "isLong" },
          { type: "address", name: "tokenIn" },
          { type: "address", name: "lvToken" },
          { type: "uint96", name: "amountIn" },
          { type: "uint128", name: "qty" },
          { type: "uint128", name: "price" },
          { type: "uint128", name: "stopLoss" },
          { type: "uint128", name: "takeProfit" },
          { type: "uint24", name: "broker" }
        ],
        name: "data",
        type: "tuple"
      },
      { type: "bytes[]", name: "priceUpdateData" }
    ],
    name: "openLimitOrderWithPyth",
    outputs: [{ type: "bytes32", name: "orderHash" }],
    stateMutability: "payable",
    type: "function"
  }
];

async function main() {
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

  // 1. Fetch Pyth Data
  const priceIds = [PYTH_PRICE_ID_BTC, PYTH_PRICE_ID_USDC];
  const params = new URLSearchParams();
  priceIds.forEach(id => params.append("ids[]", id));

  const response = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params.toString()}`);
  if (!response.ok) throw new Error(`Failed to fetch Pyth updates: ${response.statusText}`);
  const data = await response.json();
  const priceUpdateData = data.binary.data.map(d => d.startsWith('0x') ? d : `0x${d}`);
  
  const updateFee = await publicClient.readContract({
    address: PYTH_CONTRACT,
    abi: PYTH_ABI,
    functionName: 'getUpdateFee',
    args: [priceUpdateData]
  });

  // 2. Prepare Order Params
  const limitPriceUsd = 95000;
  const limitPrice = parseUnits(limitPriceUsd.toString(), 18); // 18 decimals

  // Position Size: 100 USD (10 USDC * 10x)
  // Qty = (100 / 95000) * 1e10 (Base Asset 10 decimals)
  const qty = parseUnits((100 / limitPriceUsd).toFixed(10), 10);

  // Fee Calculation (approx 0.07%)
  const amountInRaw = parseUnits("10", 6); // 10 USDC Margin
  const fee = parseUnits("0.07", 6);
  const amountIn = amountInRaw + fee;

  // 3. Approve
  console.log(`Approving USDC...`);
  const approveTx = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [LEVERUP_DIAMOND, amountIn]
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  // 4. Place Limit Order
  const openData = {
    pairBase: PAIR_BASE,
    isLong: true,
    tokenIn: USDC_ADDRESS,
    lvToken: LV_TOKEN,
    amountIn: amountIn,
    qty: qty,
    price: limitPrice, // Trigger Price
    stopLoss: 0n,
    takeProfit: 0n,
    broker: 0
  };

  console.log(`Placing Limit Order @ $${limitPriceUsd}...`);
  const tx = await walletClient.writeContract({
    address: LEVERUP_DIAMOND,
    abi: LIMIT_ORDER_ABI,
    functionName: 'openLimitOrderWithPyth',
    args: [openData, priceUpdateData],
    value: updateFee
  });
  
  console.log(`Tx Sent: ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("Limit Order Placed!");
}

main().catch(console.error);
```

## Managing Orders

### `cancelLimitOrder`

Cancels a pending limit order.

```solidity
function cancelLimitOrder(bytes32 orderHash) external
```

### `batchCancelLimitOrders`

Cancels multiple orders.

```solidity
function batchCancelLimitOrders(bytes32[] memory orderHashes) external
```
