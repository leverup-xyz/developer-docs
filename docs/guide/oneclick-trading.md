# One-Click Trading API Documentation

This documentation describes how to interact with the One-Click Trading (1CT) service. This service allows for low-latency trade execution by relaying pre-signed EIP-712 messages to the blockchain.

**Base URL**: `https://oneclick-01-keeper.leverup.xyz`

## Overview

The One-Click Trading flow consists of:
1.  **Delegation**: The user delegates trading authority to a session wallet (1CT Wallet) on-chain via the `OneClickAgent` contract.
2.  **Signing**: The client signs trade instructions using the session wallet's private key (EIP-712).
3.  **Relaying**: The client submits the signed instruction and trade data to this API.
4.  **Execution**: The server validates the signature and submits the transaction to the blockchain.

## Prerequisites

*   **Wallet Connection**: The user must have their main wallet connected.
*   **Allowlist**: Currently, the user must be on the allowlist to access this feature.
*   **ERC20 Only**: One-Click Trading only supports ERC20 tokens as collateral.
    *   If you wish to use native **MON**, you must first wrap it into **WMON**.
*   **Token Approval**: The user must approve the **LeverUp** contract to spend their ERC20 collateral tokens (e.g., USDC, WMON, LVMON) *before* attempting to open a position.

## Authentication & Security

All trade requests must be signed using **EIP-712**.
The signer address must be authorized as a "Trader Agent" for the user on the `OneClickAgent` contract.

### EIP-712 Domain Separator

All signatures use the following domain separator:

```json
{
  "chainId": <Current_Chain_ID>,
  "verifyingContract": "<OneClickAgent_Contract_Address>"
}
```

*   **chainId**: The integer ID of the network.
    *   Monad Mainnet: `143`
    *   Monad Testnet: `10143`
*   **verifyingContract**: The address of the `OneClickAgent` contract on that chain.

## Contract Addresses

For contract addresses (OneClickAgent, LeverUp, Tokens), please refer to the [Contract Addresses](/guide/contracts) page.

## Pyth Price Feeds & Update Data

When opening a position, you must provide **Pyth Update Data** (`pythUpdateData`) in the request body. This data proves the current price on-chain.

### 1. Get Price IDs

You need the Pyth Price Feed ID for:
1.  The **Trading Pair** (e.g., BTC/USD).
2.  The **Collateral Token** (if applicable).

You can find the full list of supported pairs and their Pyth IDs in the [Supported Pairs](/guide/supported-pairs) reference page.

### 2. Fetch Update Data (Hermes API)

Call the Pyth Hermes API (e.g., `https://hermes.pyth.network`) to get the signed VAA (Verification Across Arbitrary Chain) data.

**Request:**
`GET https://hermes.pyth.network/v2/updates/price/latest?ids[]=<ID_1>&ids[]=<ID_2>&...`

**Example (BTC/USD & USDC Collateral):**
```bash
curl "https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43&ids[]=0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
```

**Response:**
The API returns a JSON object containing a `binary` field. This binary string (hex) is what you pass as `pythUpdateData` in the `send-open-position` request.

```json
{
  "binary": {
    "data": ["<HEX_STRING_1>"] 
  },
  ...
}
```

---

## Endpoints

### 1. Open Position

Submits a request to open a new market position.

**Endpoint**: `POST /v1/trading/send-open-position`

**Query Parameters**:
*   `blockchain` (required): The target blockchain (e.g., `MONAD`).

**Request Body (`application/json`)**:

```json
{
  "openData": {
    "pairBase": "0x...",      // Pair base address (string)
    "isLong": true,           // Direction (boolean)
    "tokenIn": "0x...",       // token in address (string)
    "lvToken": "0x...",       // collateral token address(LVUSD/LVMON) (string)
    "amountIn": "1000...",    // Amount in(tokenIn) (wei, as string)
    "qty": "5000...",         // Position size (wei, as string)
    "price": "2000...",       // Execution price (wei, as string)
    "stopLoss": "0",          // Stop loss price (wei, as string)
    "takeProfit": "0",        // Take profit price (wei, as string)
    "broker": "0"             // Broker ID (string)
  },
  "trader": "0x...",          // The actual user's address (string)
  "salt": "0x...",            // Unique 32-byte salt (string)
  "deadline": 1715000000,     // Unix timestamp expiry (integer)
  "signature": "0x...",       // EIP-712 Signature (string)
  "pythUpdateData": ["0x..."] // Array of Pyth price update data (array of strings)
}
```

**EIP-712 Type Definition (`OneClickOpenPosition`)**:

```javascript
const types = {
  OneClickOpenPosition: [
    { type: 'address', name: 'pairBase' },
    { type: 'bool', name: 'isLong' },
    { type: 'address', name: 'tokenIn' },
    { type: 'address', name: 'lvToken' },
    { type: 'uint96', name: 'amountIn' },
    { type: 'uint128', name: 'qty' },
    { type: 'uint128', name: 'price' },
    { type: 'uint128', name: 'stopLoss' },
    { type: 'uint128', name: 'takeProfit' },
    { type: 'uint24', name: 'broker' },
    { type: 'address', name: 'trader' },
    { type: 'bytes32', name: 'salt' },
    { type: 'uint128', name: 'deadline' }
  ]
};
```

### 2. Close Position

Submits a request to close an existing position.

**Endpoint**: `POST /v1/trading/send-close-position`

**Query Parameters**:
*   `blockchain` (required): The target blockchain (e.g., `MONAD`).

**Request Body (`application/json`)**:

```json
{
  "positionHash": "0x...",    // Unique identifier of the position (string)
  "deadline": 1715000000,     // Unix timestamp expiry (integer)
  "signature": "0x..."        // EIP-712 Signature (string)
}
```

**EIP-712 Type Definition (`OneClickClosePosition`)**:

```javascript
const types = {
  OneClickClosePosition: [
    { type: 'bytes32', name: 'positionHash' },
    { type: 'uint128', name: 'deadline' }
  ]
};
```

### 3. Check Execution Status

Polls the status of a submitted trade using the input hash returned from the open/close endpoints.

**Endpoint**: `GET /v1/trading/{input_hash}/status`

**Path Parameters**:
*   `input_hash`: The hash returned by the `send-open-position` or `send-close-position` endpoint.

**Response**:
```json
{
  "executed": true,         // Whether the trade has been processed
  "success": true,          // Whether the trade was successful
  "txnHash": "0x...",       // The transaction hash on-chain
  "reason": null            // Error reason if failed (or null)
}
```

---

## Signing Examples

### Generating a Signature (TypeScript / Viem)

Below are complete examples for generating EIP-712 signatures for both Opening and Closing positions using `viem`.

#### 1. Sign OneClick Open Position

```typescript
import { createWalletClient, http, keccak256, stringToHex, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monad } from 'viem/chains';

// 1. Setup Client & Account (The Session Key)
// Ideally, this private key is generated locally in the browser and stored securely.
const account = privateKeyToAccount('0xYOUR_SESSION_PRIVATE_KEY'); 

const client = createWalletClient({
  account,
  chain: monad, // Use monadTestnet for Testnet (Chain ID 10143)
  transport: http()
});

// 2. Define Domain
const domain = {
  name: 'OneClickAgent', // Verify if your contract uses a name/version in domain separator
  version: '1',
  chainId: 143, // Monad Mainnet ID (Use 10143 for Testnet)
  verifyingContract: '0x1567FB09f13653f63A047B4F11Fb11fD1D7567d0' // Mainnet OneClickAgent
} as const;

// 3. Define Types
const types = {
  OneClickOpenDataInput: [
    { name: 'openData', type: 'OpenDataInput' },
    { name: 'trader', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'deadline', type: 'uint128' }
  ],
  OpenDataInput: [
    { name: 'pairBase', type: 'address' },
    { name: 'isLong', type: 'bool' },
    { name: 'tokenIn', type: 'address' },
    { name: 'lvToken', type: 'address' },
    { name: 'amountIn', type: 'uint96' },
    { name: 'qty', type: 'uint128' },
    { name: 'price', type: 'uint128' },
    { name: 'stopLoss', type: 'uint128' },
    { name: 'takeProfit', type: 'uint128' },
    { name: 'broker', type: 'uint24' }
  ]
} as const;

// 4. Prepare Message
const salt = keccak256(stringToHex(`leverup-1ct-open:${Date.now()}`));
const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes expiry

const message = {
  openData: {
    pairBase: '0x...', // Trading Pair Base Address
    isLong: true,
    tokenIn: '0x...', // Collateral Token Address
    lvToken: '0x...', // Corresponding LV Token
    amountIn: 1000000000n, // 1000 USDC (6 decimals)
    qty: 50000000000n, // Position Size in Base Asset (10 decimals)
    price: 60000000000000000000000n, // Execution Price (18 decimals)
    stopLoss: 0n,
    takeProfit: 0n,
    broker: 0
  },
  trader: '0xUserRealAddress...', // The user who authorized the session key
  salt: salt,
  deadline: deadline
};

// 5. Sign Data
const signature = await client.signTypedData({
  domain,
  primaryType: 'OneClickOpenDataInput',
  types,
  message
});

console.log('Open Position Signature:', signature);
```

#### 2. Sign OneClick Close Position

```typescript
// ... (Client setup same as above) ...

// 3. Define Types for Close
const closeTypes = {
  OneClickCloseDataInput: [
    { name: 'positionHash', type: 'bytes32' },
    { name: 'deadline', type: 'uint128' }
  ]
} as const;

// 4. Prepare Message
const closeMessage = {
  positionHash: '0x...', // The hash of the position you want to close
  deadline: BigInt(Math.floor(Date.now() / 1000) + 300) // 5 minutes expiry
};

// 5. Sign Data
const closeSignature = await client.signTypedData({
  domain,
  primaryType: 'OneClickCloseDataInput',
  types: closeTypes,
  message: closeMessage
});

console.log('Close Position Signature:', closeSignature);
```

### Note on Domain Separator

Ensure you use the correct `chainId` and `verifyingContract` address for the network you are targeting (Mainnet vs Testnet). The `name` and `version` fields in the domain separator should match what is defined in the `OneClickAgent` smart contract. If the contract does not check for name/version, you can omit them, but `chainId` and `verifyingContract` are mandatory.
