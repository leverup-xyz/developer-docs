# LVToken Parameter Guide

When opening a position (Market or Limit), you must specify the correct `lvToken` address in the `OpenDataInput` struct. This corresponds to the synthetic asset associated with your chosen collateral.

## Logic

The `lvToken` parameter depends on the `tokenIn` (collateral) you are using:

-   If you deposit **USDC**, the system mints/uses **LVUSD**.
-   If you deposit **MON** (Native), the system mints/uses **LVMON**.
-   If you deposit **LVToken** (e.g. LVUSD) directly, the system uses that same **LVToken** (e.g. LVUSD).

## Reference Table

### Monad Testnet

| Your Collateral (`tokenIn`) | Address | Required Parameter (`lvToken`) |
| :--- | :--- | :--- |
| **USDC** | `0xA1E873dFc5B1b69e268ab88de42E6e2090bc545a` | **LVUSD** (`0x76903262B1d4b70E3F2a5Af8Ed9F7E8Ace646Dcc`) |
| **MON** (Native) | `0x0000000000000000000000000000000000000000` | **LVMON** (`0xBe3fa50514D9617ce645a02B34F595541AF02b6b`) |
| **LVUSD** | `0x76903262B1d4b70E3F2a5Af8Ed9F7E8Ace646Dcc` | **LVUSD** (`0x76903262B1d4b70E3F2a5Af8Ed9F7E8Ace646Dcc`) |
| **LVMON** | `0xBe3fa50514D9617ce645a02B34F595541AF02b6b` | **LVMON** (`0xBe3fa50514D9617ce645a02B34F595541AF02b6b`) |

### Monad Mainnet

| Your Collateral (`tokenIn`) | Address | Required Parameter (`lvToken`) |
| :--- | :--- | :--- |
| **USDC** | `0x754704Bc059F8C67012fEd69BC8A327a5aafb603` | **LVUSD** (`0xFD44B35139Ae53FFF7d8F2A9869c503D987f00d1`) |
| **MON** (Native) | `0x0000000000000000000000000000000000000000` | **LVMON** (`0x91b81bfbe3A747230F0529Aa28d8b2Bc898E6D56`) |
| **LVUSD** | `0xFD44B35139Ae53FFF7d8F2A9869c503D987f00d1` | **LVUSD** (`0xFD44B35139Ae53FFF7d8F2A9869c503D987f00d1`) |
| **LVMON** | `0x91b81bfbe3A747230F0529Aa28d8b2Bc898E6D56` | **LVMON** (`0x91b81bfbe3A747230F0529Aa28d8b2Bc898E6D56`) |

> **Tip**: For native MON, use the zero address `0x0000000000000000000000000000000000000000` as `tokenIn`.
