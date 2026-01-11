import DefaultTheme from 'vitepress/theme'
import PairTable from './components/PairTable.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('PairTable', PairTable)
  }
}
