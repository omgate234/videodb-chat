import { computed, ref } from 'vue';

/**
 * Hook for managing asset search functionality
 * @param {import('vue').Ref} assets - Reactive array of assets to search through
 * @returns {Object} Search state and filtered results
 */
export function useAssetSearch(assets) {
  const searchQuery = ref('');

  /**
   * Filter assets by search query
   */
  const searchFilteredAssets = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) {
      return assets.value;
    }

    return assets.value.filter((asset) => {
      const name = (asset.name || '').toLowerCase();
      return name.includes(query);
    });
  });

  /**
   * Handle item selection from search
   */
  const handleSelectItem = (item) => {
    console.log('Selected item:', item);
    searchQuery.value = item.name || '';
  };

  return {
    searchQuery,
    searchFilteredAssets,
    handleSelectItem,
  };
}
