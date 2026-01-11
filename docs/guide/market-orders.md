# Market Orders

To open a market position, you interact with the `TradingPortalFacet` on the LeverUp Diamond Proxy.

## Method: `openMarketTradeWithPyth`

Opens a market trade with price updates.

```solidity
function openMarketTradeWithPyth(
    IBook.OpenDataInput memory data,
    bytes[] memory priceUpdateData
) external payable returns (bytes32 tradeHash)
```

### Parameters

#### `data` (OpenDataInput)

The `OpenDataInput` struct contains all trade parameters. This struct is used for both market trades and limit orders.

```solidity
struct OpenDataInput {
    address pairBase;   // Address of the pair base contract
    bool isLong;        // true for Long, false for Short
    address tokenIn;    // Token used for collateral (e.g. USDC)
    address lvToken;    // LP token address (e.g. LVUSD)
    uint96 amountIn;    // Amount of tokenIn to deposit
    uint128 qty;        // Position size in BASE ASSET (e.g. BTC) with 10 DECIMALS
    uint128 price;      // Execution price with 18 DECIMALS
    uint128 stopLoss;   // Stop Loss price (0 to disable)
    uint128 takeProfit; // Take Profit price (0 to disable)
    uint24 broker;      // Broker ID (optional, use 0)
}
```

#### `priceUpdateData`

Array of Pyth price update data bytes. This is required to update the on-chain oracle before executing the trade.

## Fetching Oracle Data (Pyth)

LeverUp uses Pyth Network for real-time price feeds. Before opening a position, you must fetch the latest price update data and include it in your transaction.

### 1. Get Price Feed IDs

You need the Pyth Price Feed ID for:
1.  The **Trading Pair** (e.g., BTC/USD).
2.  The **Collateral Token** (if applicable).
    *   If `tokenIn` is **LVMON** or **MON** (Native), you **MUST** include the MON/USD price feed update data.
    *   If `tokenIn` is **USDC** or **LVUSD**, you generally only need the pair feed, but including USDC feed is good practice.

You can find the list of supported pairs and their Pyth IDs in the [Supported Pairs](/guide/supported-pairs) reference page.

### 2. Fetch Update Data

You can fetch the latest signed price updates directly from the Pyth Hermes API using a standard HTTP request.

```javascript
// Example IDs (replace with actual IDs from reference)
const BTC_USD_ID = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const MON_USD_ID = "0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1";

// If opening BTC/USD position with MON collateral:
const priceIds = [
  BTC_USD_ID,
  MON_USD_ID // REQUIRED for MON/LVMON collateral
];

// Construct the URL parameters
const params = new URLSearchParams();
priceIds.forEach(id => params.append("ids[]", id));

// Fetch data from Hermes API
const response = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params.toString()}`);
const data = await response.json();

// Extract the hex strings required for the update
// The API returns { binary: { data: ["..."] } } - we ensure they have 0x prefix
const priceUpdateData = data.binary.data.map(d => d.startsWith('0x') ? d : `0x${d}`);
```

### 3. Calculate Update Fee

The Pyth contract charges a small fee to update the on-chain prices. You must calculate this fee and send it with your transaction.

```javascript
import { createPublicClient, http, getContract, parseEther } from 'viem';
import { monad } from 'viem/chains'; // Assuming Monad chain config is available

const client = createPublicClient({ 
  chain: monad,
  transport: http() 
});

const pythContractAddress = "0x..."; // Pyth Contract Address
const pythAbi = [{
  name: "getUpdateFee",
  type: "function",
  stateMutability: "view",
  inputs: [{ name: "updateData", type: "bytes[]" }],
  outputs: [{ name: "fee", type: "uint256" }]
}];

const updateFee = await client.readContract({
  address: pythContractAddress,
  abi: pythAbi,
  functionName: 'getUpdateFee',
  args: [priceUpdateData]
});
```

### Example Usage (Viem)

Here is a complete, runnable example using Viem. This script connects to the **Monad Mainnet**, fetches price data from Pyth, approves tokens, and opens a 10x long position on BTC/USD.

> **Note**: Replace `YOUR_PRIVATE_KEY` with your actual private key. Ensure your wallet has `MON` for gas and `USDC` for collateral.

```javascript
import { createWalletClient, createPublicClient, http, parseUnits, formatEther, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad } from 'viem/chains'; // or define custom chain

// --- Configuration ---
const RPC_URL = "https://rpc.monad.xyz/";
const PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"; // WARNING: Handle securely!

// Contract Addresses (Monad Mainnet)
const LEVERUP_DIAMOND = "0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec";
const USDC_ADDRESS = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";
const PYTH_CONTRACT = "0x2880aB155794e7179c9eE2e38200202908C17B43";

// Trade Parameters
// Note: This is an example placeholder. You must query the correct PairBase address for BTC/USD on Mainnet.
const PAIR_BASE = "0xcf5a6076cfa32686c0df13abada2b40dec133f1d"; 
const LV_TOKEN = "0xFD44B35139Ae53FFF7d8F2A9869c503D987f00d1";   // LVUSD (Mainnet)
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
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
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

const TRADING_PORTAL_ABI = [
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
    name: "openMarketTradeWithPyth",
    outputs: [{ type: "bytes32", name: "tradeHash" }],
    stateMutability: "payable",
    type: "function"
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

  // 2. Fetch Pyth Price Update Data
  console.log("Fetching Pyth price updates...");
  const priceIds = [PYTH_PRICE_ID_BTC, PYTH_PRICE_ID_USDC];
  
  const params = new URLSearchParams();
  priceIds.forEach(id => params.append("ids[]", id));

  const response = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params.toString()}`);
  if (!response.ok) throw new Error(`Failed to fetch Pyth updates: ${response.statusText}`);
  const data = await response.json();
  
  const priceUpdateData = data.binary.data.map(d => d.startsWith('0x') ? d : `0x${d}`);

  // 3. Calculate Pyth Update Fee
  const updateFee = await publicClient.readContract({
    address: PYTH_CONTRACT,
    abi: PYTH_ABI,
    functionName: 'getUpdateFee',
    args: [priceUpdateData]
  });
  
  console.log(`Pyth Update Fee: ${formatEther(updateFee)} MON`);

  // 4. Approve USDC
  const amountInRaw = parseUnits("10", 6); // 10 USDC Margin
  const fee = parseUnits("0.07", 6);       // 0.07 USDC Open Fee (Estimate)
  const amountIn = amountInRaw + fee;

  console.log(`Approving ${formatEther(amountIn)} USDC...`); // Note: formatEther used for simplicity, real decimals is 6
  
  const approveTx = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [LEVERUP_DIAMOND, amountIn]
  });
  
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  console.log("USDC Approved.");

  // 5. Prepare Trade Data
  const positionSizeUsd = 100; 
  const executionPrice = 100000; 
  
  // Calculate Qty in BTC: 100 / 100,000 = 0.001 BTC * 1e10
  const qty = parseUnits((positionSizeUsd / executionPrice).toFixed(10), 10);
  
  // Slippage: 101,000 USD
  const maxPrice = parseUnits("101000", 18); 

  const openData = {
    pairBase: PAIR_BASE,
    isLong: true,
    tokenIn: USDC_ADDRESS,
    lvToken: LV_TOKEN,
    amountIn: amountIn, 
    qty: qty,           
    price: maxPrice,    
    stopLoss: 0n,        
    takeProfit: 0n,      
    broker: 0
  };

  // 6. Execute Trade
  console.log("Sending Open Market Trade...");
  
  const tx = await walletClient.writeContract({
    address: LEVERUP_DIAMOND,
    abi: TRADING_PORTAL_ABI,
    functionName: 'openMarketTradeWithPyth',
    args: [openData, priceUpdateData],
    value: updateFee
  });

  console.log(`Transaction sent: ${tx}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log("Trade executed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```
