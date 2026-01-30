# Pair Slippage Configuration

This guide explains how to retrieve the slippage configuration for a specific trading pair on the LeverUp protocol.

## Contract Information

To interact with the pairs configuration, you should call the main Diamond contract address using the `PairsManagerFacet` ABI.

- **Diamond Contract Address (Monad Mainnet)**: `0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec`

## Function Signature

The relevant function to retrieve the slippage configuration is `getPairSlippageConfig`.

```solidity
function getPairSlippageConfig(address base) external view returns (SlippageConfigView memory);
```

### Parameters

- `base`: The base address of the trading pair (e.g., BTC/USD pair address). You can find these addresses in the [Supported Pairs](./supported-pairs.md) section.

### Return Value

The function returns a `SlippageConfigView` struct:

```solidity
struct SlippageConfigView {
    uint256 onePercentDepthAboveUsd; // Depth for 1% slippage above price (in USD)
    uint256 onePercentDepthBelowUsd; // Depth for 1% slippage below price (in USD)
    uint16 slippageLongP;            // Base slippage for long positions (Precision: 1e4, e.g., 50 = 0.5%)
    uint16 slippageShortP;           // Base slippage for short positions (Precision: 1e4, e.g., 50 = 0.5%)
    uint256 longThresholdUsd;        // Threshold for long slippage calculation
    uint256 shortThresholdUsd;       // Threshold for short slippage calculation
    SlippageType slippageType;       // Type of slippage model (0: FIXED, 1: ONE_PERCENT_DEPTH, 2: NET_POSITION, 3: THRESHOLD)
}

enum SlippageType {
    FIXED,
    ONE_PERCENT_DEPTH,
    NET_POSITION,
    THRESHOLD
}
```

## Example Code

Here is an example using `viem` to fetch the slippage configuration for a pair.

```typescript
import { createPublicClient, http, parseAbi, formatUnits } from 'viem'

// Define Monad Chain (or import if available)
const monad = {
  id: 10143, // Monad Testnet ID, adjust if using Mainnet
  name: 'Monad',
  network: 'monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
} 

// ABI for the getPairSlippageConfig function
const abi = parseAbi([
  'function getPairSlippageConfig(address base) external view returns ((uint256 onePercentDepthAboveUsd, uint256 onePercentDepthBelowUsd, uint16 slippageLongP, uint16 slippageShortP, uint256 longThresholdUsd, uint256 shortThresholdUsd, uint8 slippageType))'
])

// Diamond Contract Address
const contractAddress = '0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec'

// Example Pair Address (e.g., BTC/USD)
const pairBaseAddress = '0xcf5a6076cfa32686c0df13abada2b40dec133f1d'

async function getSlippageConfig() {
  const client = createPublicClient({
    chain: monad,
    transport: http()
  })

  try {
    const config = await client.readContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getPairSlippageConfig',
      args: [pairBaseAddress]
    })
    
    console.log("Slippage Configuration:");
    console.log(`- Type: ${config.slippageType}`);
    
    // Slippage values have 1e4 precision (10000 = 100%).
    // Divide by 100 to get the percentage value (e.g., 50 / 100 = 0.5%).
    console.log(`- Long Slippage (Base): ${Number(config.slippageLongP) / 100}%`);
    console.log(`- Short Slippage (Base): ${Number(config.slippageShortP) / 100}%`);
    console.log(`- 1% Depth Above: $${formatUnits(config.onePercentDepthAboveUsd, 18)}`); 
    console.log(`- 1% Depth Below: $${formatUnits(config.onePercentDepthBelowUsd, 18)}`);
  } catch (error) {
    console.error("Error fetching slippage config:", error);
  }
}

getSlippageConfig();
```
