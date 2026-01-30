# Trading Events

This guide explains how to listen for trading events on the LeverUp protocol, such as opening and closing positions, to track user activity or build notifications.

## Event Overview

The LeverUp Diamond contract emits various events during the lifecycle of a trade.

### Market Orders

-   **MarketPendingTrade**: Emitted when a user requests to open a market position.
-   **OpenMarketTrade**: Emitted when a market position is successfully opened.
-   **PendingTradeRefund**: Emitted when a pending market order is canceled or fails (e.g., due to slippage).

### Limit Orders

-   **OpenLimitOrder**: Emitted when a user places a limit order.
-   **ExecuteLimitOrderSuccessful**: Emitted when a limit order is triggered and executed.
-   **CancelLimitOrder**: Emitted when a user cancels a limit order.
-   **LimitOrderRefund**: Emitted when a limit order execution fails and is refunded.

### Closing Positions

-   **CloseTradeSuccessful**: Emitted when a user manually closes a position.
-   **ExecuteCloseSuccessful**: Emitted when a position is closed by a trigger (Take Profit, Stop Loss, or Liquidation).

## Event Signatures

To listen for these events, you can use the following ABI definitions.

```solidity
// Market Order Events
event MarketPendingTrade(address indexed user, bytes32 indexed tradeHash, OpenDataInput trade);
event OpenMarketTrade(address indexed user, bytes32 indexed tradeHash, OpenTrade ot);
event PendingTradeRefund(address indexed user, bytes32 indexed tradeHash, uint8 refundReason);

// Limit Order Events
event OpenLimitOrder(address indexed user, bytes32 indexed orderHash, OpenDataInput data);
event ExecuteLimitOrderSuccessful(address indexed user, bytes32 indexed orderHash);
event CancelLimitOrder(address indexed user, bytes32 indexed orderHash);

// Closing Events
event CloseTradeSuccessful(address indexed user, bytes32 indexed tradeHash, CloseInfo closeInfo);
event ExecuteCloseSuccessful(address indexed user, bytes32 indexed tradeHash, uint8 executionType, CloseInfo closeInfo);
```

## Data Structures

The events above reference the following structs and enums.

### OpenDataInput

Used in `MarketPendingTrade` and `OpenLimitOrder`.

```solidity
struct OpenDataInput {
    address pairBase;   // Address of the trading pair
    bool isLong;        // True for Long, False for Short
    address tokenIn;    // Collateral token address (e.g., USDC)
    address lvToken;    // LP Token address (e.g., LVUSD)
    uint96 amountIn;    // Amount of collateral (tokenIn decimals)
    uint128 qty;        // Position size in units (1e10 precision)
    uint128 price;      // Execution price (1e18 precision)
    uint128 stopLoss;   // Stop Loss price (1e18 precision)
    uint128 takeProfit; // Take Profit price (1e18 precision)
    uint24 broker;      // Broker ID
}
```

### OpenTrade

Used in `OpenMarketTrade`. Represents the state of an active position.

```solidity
struct OpenTrade {
    address user;
    uint32 userOpenTradeIndex;
    uint40 holdingFeeRate;            // Holding fee rate (1e12 precision)
    uint128 entryPrice;               // Entry price (1e18 precision)
    uint128 qty;                      // Position size (1e10 precision)
    address pairBase;                 // Pair address
    address tokenPay;                 // Token used for payment
    address lvToken;                  // LP Token address
    uint96 lvMargin;                  // Margin in LP Token (lvToken decimals)
    uint128 stopLoss;                 // Stop Loss price
    uint128 takeProfit;               // Take Profit price
    uint24 broker;                    // Broker ID
    bool isLong;                      // Direction
    uint32 timestamp;                 // Open timestamp
    uint96 lvOpenFee;                 // Open fee in LP Token
    uint96 lvExecutionFee;            // Execution fee in LP Token
    int256 longAccFundingFeePerShare; // Funding fee tracker
    uint256 openBlock;                // Block number when opened
}
```

### CloseInfo

Used in `CloseTradeSuccessful` and `ExecuteCloseSuccessful`. Contains details about the closed trade.

```solidity
struct CloseInfo {
    uint128 closePrice; // Closing price (1e18 precision)
    int96 fundingFee;   // Funding fee paid/received (tokenIn decimals)
    uint96 closeFee;    // Closing fee (tokenIn decimals)
    int96 pnl;          // Realized PnL (tokenIn decimals)
    uint96 holdingFee;  // Holding fee (tokenIn decimals)
}
```

### Refund Enum

Used in `PendingTradeRefund` and `LimitOrderRefund` to indicate why an order failed.

```solidity
enum Refund {
    NO,                       // 0
    SWITCH,                   // 1
    PAIR_STATUS,              // 2
    AMOUNT_IN,                // 3
    USER_PRICE,               // 4
    MIN_NOTIONAL_USD,         // 5
    MAX_NOTIONAL_USD,         // 6
    MAX_LEVERAGE,             // 7
    TP,                       // 8
    SL,                       // 9
    PAIR_OI,                  // 10
    OPEN_LOST,                // 11
    SYSTEM,                   // 12
    FEED_DELAY,               // 13
    PRICE_PROTECTION,         // 14
    RESERVE_TOKEN_NOT_ACTIVE, // 15
    LV_TOKEN_NOT_ACTIVE,      // 16
    MIN_LEVERAGE              // 17
}
```

## Example: Listening for Position Updates

Here is an example using `viem` to listen for `OpenMarketTrade` and `CloseTradeSuccessful` events.

```typescript
import { createPublicClient, http, parseAbi, formatUnits } from 'viem'

// Define Monad Chain
const monad = {
  id: 10143, // Monad Testnet ID, update for Mainnet
  name: 'Monad',
  network: 'monad',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
}

// Diamond Contract Address
const contractAddress = '0xea1b8E4aB7f14F7dCA68c5B214303B13078FC5ec'

// ABI for the events we want to listen to
const abi = parseAbi([
  'event OpenMarketTrade(address indexed user, bytes32 indexed tradeHash, (address user, uint32 userOpenTradeIndex, uint40 holdingFeeRate, uint128 entryPrice, uint128 qty, address pairBase, address tokenPay, address lvToken, uint96 lvMargin, uint128 stopLoss, uint128 takeProfit, uint24 broker, bool isLong, uint32 timestamp, uint96 lvOpenFee, uint96 lvExecutionFee, int256 longAccFundingFeePerShare, uint256 openBlock) ot)',
  'event CloseTradeSuccessful(address indexed user, bytes32 indexed tradeHash, (uint128 closePrice, int96 fundingFee, uint96 closeFee, int96 pnl, uint96 holdingFee) closeInfo)'
])

async function watchTradingEvents() {
  const client = createPublicClient({
    chain: monad,
    transport: http()
  })

  console.log("Listening for trading events...")

  // Watch for OpenMarketTrade
  client.watchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: 'OpenMarketTrade',
    onLogs: logs => {
      logs.forEach(log => {
        const { user, tradeHash, ot } = log.args
        console.log(`[OPEN] User: ${user}, TradeHash: ${tradeHash}`)
        console.log(`       Pair: ${ot.pairBase}, Long: ${ot.isLong}, Entry: $${formatUnits(ot.entryPrice, 18)}`)
      })
    }
  })

  // Watch for CloseTradeSuccessful
  client.watchContractEvent({
    address: contractAddress,
    abi: abi,
    eventName: 'CloseTradeSuccessful',
    onLogs: logs => {
      logs.forEach(log => {
        const { user, tradeHash, closeInfo } = log.args
        console.log(`[CLOSE] User: ${user}, TradeHash: ${tradeHash}`)
        console.log(`        Close Price: $${formatUnits(closeInfo.closePrice, 18)}, PnL: ${formatUnits(closeInfo.pnl, 18)}`) // Adjust decimals for PnL based on token
      })
    }
  })
}

watchTradingEvents();
```

### Notes

-   **Decimals**: Prices are typically 1e18 (18 decimals). PnL decimals depend on the collateral token (e.g., USDC is 6 decimals, others might be 18).
-   **Structs**: The event arguments often contain structs (like `OpenTrade` and `CloseInfo`). In `viem`'s `parseAbi`, you need to define these structs inline as tuples.
