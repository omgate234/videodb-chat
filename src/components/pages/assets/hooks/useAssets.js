import { ref } from 'vue';

export function useAssets(context) {
  const assets = ref([]);
  const totalAssets = ref(0);
  const isLoadingAssets = ref(false);

  const fetchAssetsApi = context?.fetchAssets;
  const generateImageUrl = context?.generateImageUrl;
  const generateAudioUrl = context?.generateAudioUrl;
  const deleteVideo = context?.deleteVideo;
  const deleteAudio = context?.deleteAudio;
  const deleteImage = context?.deleteImage;
  const deleteVoice = context?.deleteVoice;

  let currentRequestId = 0;

  const loadAssets = async (params = {}) => {
    if (!fetchAssetsApi) return;

    const requestId = ++currentRequestId;
    isLoadingAssets.value = true;

    try {
      const response = await fetchAssetsApi({
        asset_type: params.asset_type,
        collection_id: params.collection_id,
        name_pattern: params.name_pattern,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
        min_duration: params.min_duration,
        max_duration: params.max_duration,
        page: params.page || 1,
        page_size: params.page_size || 50,
      });

      if (requestId !== currentRequestId) return;

      if (response.status === 'success') {
        const rawAssets = response.data?.data?.assets || [];
        assets.value = rawAssets.map((asset) => ({
          ...asset,
          type: asset.asset_type || params.asset_type,
          collectionId: asset.collection_id,
        }));
        totalAssets.value =
          response.data?.data?.pagination?.total_count ||
          response.data?.data?.total_count ||
          assets.value.length;
      } else {
        assets.value = [];
        totalAssets.value = 0;
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      if (requestId === currentRequestId) {
        assets.value = [];
        totalAssets.value = 0;
      }
    } finally {
      if (requestId === currentRequestId) {
        isLoadingAssets.value = false;
      }
    }
  };

  const getImageUrl = async (collectionId, imageId) => {
    if (!generateImageUrl) return null;
    const result = await generateImageUrl(collectionId, imageId);
    return result?.url || null;
  };

  const getAudioUrl = async (collectionId, audioId) => {
    if (!generateAudioUrl) return null;
    const result = await generateAudioUrl(collectionId, audioId);
    return result?.url || null;
  };

  const handleDeleteVideo = async (video, currentParams) => {
    if (!deleteVideo || !video.collectionId || !video.id) return;
    try {
      await deleteVideo(video.collectionId, video.id);
      if (currentParams) await loadAssets(currentParams);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const handleDeleteAudio = async (audio, currentParams) => {
    if (!deleteAudio || !audio.collectionId || !audio.id) return;
    try {
      await deleteAudio(audio.collectionId, audio.id);
      if (currentParams) await loadAssets(currentParams);
    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  };

  const handleDeleteImage = async (image, currentParams) => {
    if (!deleteImage || !image.collectionId || !image.id) return;
    try {
      await deleteImage(image.collectionId, image.id);
      if (currentParams) await loadAssets(currentParams);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  const handleDeleteVoice = async (voice, currentParams) => {
    if (!deleteVoice || !voice.collectionId || !voice.id) return;
    try {
      await deleteVoice(voice.collectionId, voice.id);
      if (currentParams) await loadAssets(currentParams);
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  };

  return {
    assets,
    totalAssets,
    isLoadingAssets,
    loadAssets,
    getImageUrl,
    getAudioUrl,
    handleDeleteVideo,
    handleDeleteAudio,
    handleDeleteImage,
    handleDeleteVoice,
  };
}
