import { ref, computed, watch } from 'vue';

/**
 * Hook for managing asset loading and API calls
 * @param {Object} context - The videodb-chat context
 * @returns {Object} Asset management functions and state
 */
export function useAssets(context) {
  const assets = ref([]);
  const isLoadingAssets = ref(true);

  const collections = computed(() => context?.collections?.value || []);
  const isSetupComplete = computed(() => context?.isSetupComplete?.value ?? false);

  const fetchCollectionVideos = context?.fetchCollectionVideos;
  const fetchCollectionAudios = context?.fetchCollectionAudios;
  const fetchCollectionImages = context?.fetchCollectionImages;
  const generateImageUrl = context?.generateImageUrl;
  const generateAudioUrl = context?.generateAudioUrl;
  const deleteVideo = context?.deleteVideo;
  const deleteAudio = context?.deleteAudio;
  const deleteImage = context?.deleteImage;

  // Track the current request to avoid race conditions
  let currentRequestId = 0;

  /**
   * Load all assets from all collections
   * Loads videos, images, and audio files from all available collections
   */
  const loadAllAssets = async () => {
    const requestId = ++currentRequestId;
    isLoadingAssets.value = true;

    try {
      // Check which fetch functions are available
      const hasVideos = typeof fetchCollectionVideos === 'function';
      const hasAudios = typeof fetchCollectionAudios === 'function';
      const hasImages = typeof fetchCollectionImages === 'function';

      // At least one fetch function must be available
      if (!hasVideos && !hasAudios && !hasImages) {
        console.warn('No asset fetch functions are available', {
          fetchCollectionVideos: typeof fetchCollectionVideos,
          fetchCollectionAudios: typeof fetchCollectionAudios,
          fetchCollectionImages: typeof fetchCollectionImages,
        });
        assets.value = [];
        return;
      }

      if (!collections.value.length) {
        assets.value = [];
        return;
      }

      const collectionPromises = collections.value.map(async (collection) => {
        // Build array of fetch promises only for available functions
        const fetchPromises = [];

        if (hasVideos) {
          fetchPromises.push(
            fetchCollectionVideos(collection.id)
              .then((r) => ({ type: 'video', data: r.data || [] }))
              .catch((err) => {
                console.error(`Error fetching videos for collection ${collection.id}:`, err);
                return { type: 'video', data: [] };
              })
          );
        }

        if (hasAudios) {
          fetchPromises.push(
            fetchCollectionAudios(collection.id)
              .then((r) => ({ type: 'audio', data: r.data || [] }))
              .catch((err) => {
                console.error(`Error fetching audios for collection ${collection.id}:`, err);
                return { type: 'audio', data: [] };
              })
          );
        }

        if (hasImages) {
          fetchPromises.push(
            fetchCollectionImages(collection.id)
              .then((r) => ({ type: 'image', data: r.data || [] }))
              .catch((err) => {
                console.error(`Error fetching images for collection ${collection.id}:`, err);
                return { type: 'image', data: [] };
              })
          );
        }

        // Fetch all available types in parallel
        const results = await Promise.all(fetchPromises);

        // Process results and attach metadata
        const attachMeta = (items, type) =>
          items.map((i) => ({
            ...i,
            type,
            collectionId: collection.id,
            collectionName: collection.name,
          }));

        // Combine all fetched asset types
        const allAssets = [];
        results.forEach((result) => {
          allAssets.push(...attachMeta(result.data, result.type));
        });

        return allAssets;
      });

      const results = await Promise.all(collectionPromises);

      // Only update state if this is still the latest request
      if (requestId === currentRequestId) {
        assets.value = results.flat();
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      if (requestId === currentRequestId) {
        assets.value = [];
      }
    } finally {
      if (requestId === currentRequestId) {
        isLoadingAssets.value = false;
      }
    }
  };

  /**
   * Get image URL for a given collection and image ID
   */
  const getImageUrl = async (collectionId, imageId) => {
    if (!generateImageUrl) return null;
    const result = await generateImageUrl(collectionId, imageId);
    console.log('>>> result', result);
    return result?.url || null;
  };

  /**
   * Get audio URL for a given collection and audio ID
   */
  const getAudioUrl = async (collectionId, audioId) => {
    if (!generateAudioUrl) return null;
    const result = await generateAudioUrl(collectionId, audioId);
    return result?.url || null;
  };

  /**
   * Delete a video asset
   */
  const handleDeleteVideo = async (video) => {
    if (deleteVideo && video.collectionId && video.id) {
      try {
        await deleteVideo(video.collectionId, video.id);
        await loadAllAssets();
      } catch (error) {
        console.error('Error deleting video:', error);
        throw error;
      }
    }
  };

  /**
   * Delete an audio asset
   */
  const handleDeleteAudio = async (audio) => {
    if (deleteAudio && audio.collectionId && audio.id) {
      try {
        await deleteAudio(audio.collectionId, audio.id);
        await loadAllAssets();
      } catch (error) {
        console.error('Error deleting audio:', error);
        throw error;
      }
    }
  };

  /**
   * Delete an image asset
   */
  const handleDeleteImage = async (image) => {
    if (deleteImage && image.collectionId && image.id) {
      try {
        await deleteImage(image.collectionId, image.id);
        await loadAllAssets();
      } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
    }
  };

  // Watch dependency changes internally so the component doesn't have to
  watch(
    [collections, isSetupComplete],
    ([newCollections, newSetup]) => {
      if (newSetup && newCollections.length > 0) {
        loadAllAssets();
      }
    },
    { deep: true, immediate: true }
  );

  return {
    assets,
    isLoadingAssets,
    loadAllAssets,
    getImageUrl,
    getAudioUrl,
    handleDeleteVideo,
    handleDeleteAudio,
    handleDeleteImage,
  };
}
