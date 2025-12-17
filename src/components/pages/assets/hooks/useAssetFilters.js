import { computed } from 'vue';

/**
 * Hook for filtering and sorting assets
 * @param {import('vue').Ref|import('vue').ComputedRef} assets - Reactive array of assets (can be search-filtered)
 * @param {import('vue').Ref} selectedCollection - Currently selected collection
 * @param {import('vue').Ref} activeTab - Currently active tab (Video, Audio, Images, Voices)
 * @param {import('vue').Ref} sortState - Current sort state
 * @param {import('vue').Reactive} filterState - Current filter state
 * @returns {Object} Filtered and sorted assets
 */
export function useAssetFilters(assets, selectedCollection, activeTab, sortState, filterState) {
  /**
   * Check if any filters are active
   */
  function hasFilters(state) {
    return Object.values(state).some((v) => v === true);
  }

  /**
   * Check if asset matches duration filters
   */
  function checkDuration(asset, state) {
    const hasDurFilter = Object.keys(state).some((k) => k.startsWith('dur_') && state[k]);
    if (!hasDurFilter) return true;

    const d = asset.length || asset.duration || 0;
    if (state.dur_less_1 && d < 60) return true;
    if (state.dur_1_15 && d >= 60 && d <= 900) return true;
    if (state.dur_15_30 && d > 900 && d <= 1800) return true;
    if (state.dur_more_30 && d > 1800) return true;
    return false;
  }

  /**
   * Sort assets based on sort state
   */
  function sortAssets(list, sortValue) {
    if (!sortValue) return list;
    
    const sorted = [...list];

    // Alphabetical sorting
    if (sortValue === 'az' || sortValue === 'za') {
      sorted.sort((a, b) => {
        const nA = (a.name || '').toLowerCase();
        const nB = (b.name || '').toLowerCase();
        return sortValue === 'az' ? nA.localeCompare(nB) : nB.localeCompare(nA);
      });
    }

    // Duration sorting
    if (sortValue === 'short_long' || sortValue === 'long_short') {
      sorted.sort((a, b) => {
        const durationA = a.length || a.duration || 0;
        const durationB = b.length || b.duration || 0;
        return sortValue === 'short_long' ? durationA - durationB : durationB - durationA;
      });
    }

    return sorted;
  }

  /**
   * Apply all filters and sorting to assets
   * Single-pass filtering for performance optimization
   */
  const filteredAssets = computed(() => {
    let result = assets.value;

    // Single Pass Filtering (Performance Optimization)
    if (selectedCollection.value || activeTab.value || hasFilters(filterState)) {
      result = result.filter((asset) => {
        // Collection Check
        if (selectedCollection.value && asset.collectionId !== selectedCollection.value.id) {
          return false;
        }

        // Type Check
        const typeMap = {
          Video: 'video',
          Audio: 'audio',
          Images: 'image',
          Voices: 'voices',
        };
        if (typeMap[activeTab.value] && asset.type !== typeMap[activeTab.value]) {
          return false;
        }

        // Duration Check (skip for voices and images)
        if (asset.type !== 'voices' && asset.type !== 'image' && !checkDuration(asset, filterState)) return false;

        return true;
      });
    }

    // Sorting (Must happen after filtering)
    return sortAssets(result, sortState.value);
  });

  return {
    filteredAssets,
  };
}
