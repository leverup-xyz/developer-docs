import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "LeverUp Developer Docs",
  description: "Documentation for LeverUp Protocol Integration",
  themeConfig: {
    // logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Contract Addresses', link: '/guide/contracts' },
          { text: 'Supported Pairs', link: '/guide/supported-pairs' },
          { text: 'Pair Slippage Config', link: '/guide/pair-slippage-config' },
          { text: 'LVToken Parameter Guide', link: '/guide/lv-token' }
        ]
      },
      {
        text: 'Trading Operations',
        items: [
          { text: 'Market Orders', link: '/guide/market-orders' },
          { text: 'Closing Positions', link: '/guide/closing-positions' },
          { text: 'Reading Positions', link: '/guide/reading-positions' },
          { text: 'Limit Orders', link: '/guide/limit-orders' },
          { text: 'Reading Orders', link: '/guide/reading-orders' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Supported Pairs', link: '/guide/supported-pairs' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'One-Click Trading', link: '/guide/oneclick-trading' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/leverup-xyz' }
    ],

    search: {
      provider: 'local'
    }
  }
})

