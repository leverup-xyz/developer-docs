# Trading Pairs

This page lists all supported trading pairs on the LeverUp protocol (Monad Mainnet).

## Columns

-   **Pair**: The trading pair symbol (e.g., BTC/USD).
-   **Pair Base Address**: The contract address for the trading pair. You need this for the `pairBase` parameter in API calls.
-   **Pyth ID**: The oracle price feed ID.
-   **Category**: The asset class (Crypto, Forex, Stocks, etc.).

## Monad Mainnet Pairs

<script setup>
const pairs = [
  { name: 'XRP/USD', baseAddress: '0xaeb724422620edb430dcaf22aeeff2e9388a578c', pythId: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', category: 'Crypto' },
  { name: 'QQQ/USD', baseAddress: '0xb589511c51d1ffda5d943ac1c9733e112abeff7b', pythId: '0x9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d', category: 'Indices' },
  { name: 'SPY/USD', baseAddress: '0xcb8900160bd4a86d3b80f5ad5a44ee15823b0592', pythId: '0x19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5', category: 'Indices' },
  { name: 'BTC/USD', baseAddress: '0xcf5a6076cfa32686c0df13abada2b40dec133f1d', pythId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', category: 'Crypto' },
  { name: 'ETH/USD', baseAddress: '0xb5a30b0fdc5ea94a52fdc42e3e9760cb8449fb37', pythId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', category: 'Crypto' },
  { name: 'EUR/USD', baseAddress: '0xa9226449042e36bf6865099eec57482aa55e3ad0', pythId: '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b', category: 'Forex' },
  { name: 'USD/JPY', baseAddress: '0x35b8bafff3570683af968b8d36b91b1a19465141', pythId: '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52', category: 'Forex' },
  { name: 'MON/USD', baseAddress: '0x3bd359c1119da7da1d913d1c4d2b7c461115433a', pythId: '0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1', category: 'Crypto' },
  { name: 'SOL/USD', baseAddress: '0x0a3ec4fc70eaf64faf6eeda4e9b2bd4742a78546', pythId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', category: 'Crypto' },
  { name: '500BTC/USD', baseAddress: '0x0000000000000000000000000000000000000003', pythId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', category: 'Crypto' },
  { name: '500ETH/USD', baseAddress: '0x0000000000000000000000000000000000000004', pythId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', category: 'Crypto' },
  { name: 'AAPL/USD', baseAddress: '0x3a54a9a690616fbc26cfc409bf11f89d51f1d57a', pythId: '0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688', category: 'Stocks' },
  { name: 'AMZN/USD', baseAddress: '0x6c755094f1cdd95e2e4170549dc12e7555151536', pythId: '0xb5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a', category: 'Stocks' },
  { name: 'TSLA/USD', baseAddress: '0x0a8f1f385fed9c77a2e0daa363ccc865e971bdbe', pythId: '0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1', category: 'Stocks' },
  { name: 'NVDA/USD', baseAddress: '0xe108948b9667048232851f26a1427d3a908b22da', pythId: '0xb1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593', category: 'Stocks' },
  { name: 'META/USD', baseAddress: '0x0057355892fab25ddc63a7482ec1696d6ada6703', pythId: '0x78a3e3b8e676a8f73c439f5d749737034b139bbbe899ba5775216fba596607fe', category: 'Stocks' },
  { name: 'XAU/USD', baseAddress: '0x7c687a3207cd9c05b4b11d8dd7ac337919c22001', pythId: '0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2', category: 'Commodities' },
  { name: 'XAG/USD', baseAddress: '0x5ccc5c04130d272bf07d6e066f4cae40cfc03136', pythId: '0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e', category: 'Commodities' },
  { name: 'MSFT/USD', baseAddress: '0xb2023082f01404dd0ce6937cab03c4f5d6db9ba8', pythId: '0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1', category: 'Stocks' },
  { name: 'GOOG/USD', baseAddress: '0x9a4f772de1a5f6df5913fa2c98dd7177eaa23dc2', pythId: '0xe65ff435be42630439c96396653a342829e877e2aafaeaf1a10d0ee5fd2cf3f2', category: 'Stocks' },
]
</script>

<PairTable :pairs="pairs" />

## High Leverage Pairs (Zero-Fee)

**500BTC/USD** and **500ETH/USD** are special high-leverage pairs designed for active trading. These pairs operate under LeverUp's **Zero-Fee Perpetuals** model.

-   **Zero Opening/Closing Fees**: You pay 0 fees if your PnL is negative.
-   **Profit Sharing**: A portion of profits is shared with the protocol only when the trade is profitable.

> **Principle**: "If PnL < 0 → You pay 0 fees".

For a detailed breakdown of the Zero-Fee mechanism, please refer to the [Zero-Fee Perpetuals Documentation](https://leverup.gitbook.io/docs/trading/fee-breakdown/zero-fee-perpetuals).

