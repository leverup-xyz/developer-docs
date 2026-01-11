<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  pairs: {
    type: Array,
    required: true
  }
})

const searchQuery = ref('')

const filteredPairs = computed(() => {
  if (!searchQuery.value) return props.pairs
  const query = searchQuery.value.toLowerCase()
  return props.pairs.filter(pair => 
    pair.name.toLowerCase().includes(query) ||
    pair.baseAddress.toLowerCase().includes(query) ||
    pair.pythId.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="pair-search">
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by Pair Name, Address, or ID..."
        class="search-input"
      />
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Pair</th>
            <th>Pair Base Address</th>
            <th>Pyth ID</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pair in filteredPairs" :key="pair.name">
            <td><strong>{{ pair.name }}</strong></td>
            <td><code>{{ pair.baseAddress }}</code></td>
            <td><code>{{ pair.pythId }}</code></td>
            <td>{{ pair.category }}</td>
          </tr>
          <tr v-if="filteredPairs.length === 0">
            <td colspan="4" class="no-results">No pairs found matching "{{ searchQuery }}"</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.pair-search {
  margin: 20px 0;
}

.search-container {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.search-input:focus {
  border-color: var(--vp-c-brand);
  outline: none;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  text-align: left;
}

th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

.no-results {
  text-align: center;
  color: var(--vp-c-text-2);
  padding: 24px;
}
</style>
