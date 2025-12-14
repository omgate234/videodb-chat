import { reactive, ref } from 'vue';

const mockSessions = reactive({});
const mockConversations = reactive({});

export function useUploadChatSimulator() {
  const createMockSessionId = () => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createMockConvId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createMockMsgId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatFileForDisplay = (file) => {
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
    };

    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    return {
      type: fileType,
      name: file.name,
      size: formatFileSize(file.size),
      status: 'pending',
      _rawFile: file,
    };
  };

  const startUploadSession = async ({
    text,
    images,
    videos,
    audios,
    files,
    agents,
    additionalInfo,
    uploadMedia,
    handleAddMessage,
    activeCollectionData,
    generateImageUrl,
    generateAudioUrl,
  }) => {
    const mockSessionId = createMockSessionId();
    const mockConvId = createMockConvId();

    mockSessions[mockSessionId] = {
      session_id: mockSessionId,
      name: 'Upload in progress',
      collection_id: activeCollectionData?.value?.id || activeCollectionData?.id || 'default',
      created_at: new Date().toISOString(),
      isUploading: true,
    };

    mockConversations[mockSessionId] = {};

    const inputMsgId = createMockMsgId();
    const outputMsgId = createMockMsgId();

    const inputContent = [];
    if (text) {
      inputContent.push({ type: 'text', text });
    }
    if (images?.length > 0) {
      for (const image of images) {
        inputContent.push({
          type: 'image',
          image: {
            image_id: image.image_id,
            url: image.url,
          },
        });
      }
    }
    if (videos?.length > 0) {
      for (const video of videos) {
        inputContent.push({
          type: 'video',
          video: {
            video_id: video.id,
          },
        });
      }
    }
    if (audios?.length > 0) {
      for (const audio of audios) {
        inputContent.push({
          type: 'audio',
          audio: {
            audio_id: audio.id,
          },
        });
      }
    }

    mockConversations[mockSessionId][mockConvId] = {
      [inputMsgId]: {
        msg_id: inputMsgId,
        conv_id: mockConvId,
        msg_type: 'input',
        content: inputContent,
        status: 'success',
      },
      [outputMsgId]: {
        msg_id: outputMsgId,
        conv_id: mockConvId,
        msg_type: 'output',
        content: [
          {
            type: 'upload',
            files: files.map(formatFileForDisplay),
          },
        ],
        status: 'progress',
        actions: [],
      },
    };

    const uploadResults = {
      videos: [...(videos || [])],
      audios: [...(audios || [])],
      images: [...(images || [])],
    };

    const filesArray = mockConversations[mockSessionId][mockConvId][outputMsgId].content[0].files;

    const uploadPromises = files.map(async (file, index) => {
      try {
        const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;

        const uploadData = {
          source: file,
          sourceType: 'file',
          collectionId: collectionId,
        };

        const response = await uploadMedia(uploadData);

        if (response?.ok || response?.status === 'READY') {
          const uploadResData = await response.json();

          let fileType = 'file';
          if (file.type.startsWith('image/')) {
            fileType = 'image';
          } else if (file.type.startsWith('video/')) {
            fileType = 'video';
          } else if (file.type.startsWith('audio/')) {
            fileType = 'audio';
          }

          if (fileType === 'image' && generateImageUrl) {
            try {
              const imageUrlData = await generateImageUrl(uploadResData.collection_id, uploadResData.id);
              uploadResults.images.push({
                image_id: uploadResData.id,
                url: imageUrlData.url,
              });
            } catch (e) {
              console.error('Failed to generate image URL:', e);
            }
          } else if (fileType === 'video') {
            uploadResults.videos.push({
              id: uploadResData.id,
              name: file.name,
            });
          } else if (fileType === 'audio') {
            uploadResults.audios.push({
              id: uploadResData.id,
              name: file.name,
            });
          }

          filesArray[index].status = 'success';
        } else {
          filesArray[index].status = 'failure';
          filesArray[index].errorMessage = 'Upload failed. Please try again.';
        }
      } catch (error) {
        filesArray[index].status = 'failure';
        filesArray[index].errorMessage = error.message || 'Network error. Please check your connection.';
      }
    });

    await Promise.all(uploadPromises);

    const allSuccess = filesArray.every(f => f.status === 'success');

    if (allSuccess && handleAddMessage) {
      mockSessions[mockSessionId].name = 'Upload complete';
      mockSessions[mockSessionId].isUploading = false;

      await handleAddMessage({
        text,
        images: uploadResults.images,
        videos: uploadResults.videos,
        audios: uploadResults.audios,
        agents,
        additionalInfo,
      });

      setTimeout(() => {
        delete mockSessions[mockSessionId];
        delete mockConversations[mockSessionId];
      }, 1000);
    } else {
      mockSessions[mockSessionId].name = 'Upload failed';
      mockSessions[mockSessionId].isUploading = false;
      mockConversations[mockSessionId][mockConvId][outputMsgId].status = 'error';
    }

    return mockSessionId;
  };

  const getMockSession = (sessionId) => {
    return mockSessions[sessionId] || null;
  };

  const getMockConversations = (sessionId) => {
    return mockConversations[sessionId] || {};
  };

  const getAllMockSessions = () => {
    return Object.values(mockSessions);
  };

  const isMockSession = (sessionId) => {
    return !!mockSessions[sessionId];
  };

  return {
    startUploadSession,
    getMockSession,
    getMockConversations,
    getAllMockSessions,
    isMockSession,
  };
}
