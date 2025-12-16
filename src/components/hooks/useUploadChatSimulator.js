import { reactive, ref } from 'vue';

const mockSessions = reactive({});
const mockConversations = reactive({});

export function useUploadChatSimulator() {
  const createMockSessionId = () => {
    return crypto.randomUUID();
  };

  const createMockConvId = () => {
    return String(Date.now());
  };

  const createMockMsgId = () => {
    return String(Date.now() + Math.floor(Math.random() * 1000));
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
    navigateToSession,
    currentSessionId = null,
    existingConversations = null,
  }) => {
    const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id || 'default';
    
    const useExistingSession = !!currentSessionId;
    const sessionId = useExistingSession ? currentSessionId : createMockSessionId();
    const mockConvId = createMockConvId();

    if (!useExistingSession) {
      // Create mock session only if no active session exists
      mockSessions[sessionId] = {
        session_id: sessionId,
        name: 'Upload in progress',
        collection_id: collectionId,
        created_at: Math.floor(Date.now() / 1000),
        isUploading: true,
      };

      mockConversations[sessionId] = {};
    } else {
      // Mark existing session as uploading
      mockSessions[sessionId] = {
        session_id: sessionId,
        isUploading: true,
        isExistingSession: true,
      };
    }

    const inputMsgId = createMockMsgId();
    const outputMsgId = createMockMsgId();

    const inputContent = [];
    if (text) {
      inputContent.push({ 
        type: 'text', 
        text,
        status: 'success',
      });
    }
    if (images?.length > 0) {
      for (const image of images) {
        inputContent.push({
          type: 'image',
          image: {
            image_id: image.image_id,
            url: image.url,
          },
          status: 'success',
        });
      }
    }


    if (inputContent.length === 0) {
      inputContent.push({
        type: 'text',
        text: '',
        status: 'success',
        agent_name: 'user',
      });
    }

    // Store mock conversation for this session
    if (!mockConversations[sessionId]) {
      mockConversations[sessionId] = {};
    }

    mockConversations[sessionId][mockConvId] = {
      [inputMsgId]: {
        msg_id: inputMsgId,
        conv_id: mockConvId,
        session_id: sessionId,
        msg_type: 'input',
        content: inputContent,
        status: 'success',
        agents: agents || [],
        actions: [],
      },
      [outputMsgId]: {
        msg_id: outputMsgId,
        conv_id: mockConvId,
        session_id: sessionId,
        msg_type: 'output',
        content: [
          {
            type: 'upload',
            files: files.map(formatFileForDisplay),
            status: 'progress',
            agent_name: 'assistant',
          },
        ],
        status: 'progress',
        actions: [],
        is_mock: true,
        agents: ['assistant'],
      },
    };

    if (useExistingSession) {
      console.log('[UploadSimulator] Using existing session:', sessionId);
      console.log('[UploadSimulator] Mock upload conversation added to existing session with', files.length, 'files');
      // No navigation needed - stay in current session
    } else {
      // Navigate to the mock session immediately after creating it
      console.log('[UploadSimulator] Mock session created:', sessionId);
      console.log('[UploadSimulator] Mock conversation created with', files.length, 'files');
      
      if (navigateToSession) {
        console.log('[UploadSimulator] Triggering navigation to mock session');
        navigateToSession(sessionId);
      }
    }

    const uploadResults = {
      videos: [...(videos || [])],
      audios: [...(audios || [])],
      images: [...(images || [])],
    };

    const filesArray = mockConversations[sessionId][mockConvId][outputMsgId].content[0].files;

    const uploadPromises = files.map(async (file, index) => {
      try {
        const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;

        const uploadData = {
          source: file,
          sourceType: 'file',
          collectionId: collectionId,
        };

        let response;
        try {
          response = await uploadMedia(uploadData);
        } catch (uploadError) {
          console.error('Upload media error for file:', file.name, uploadError);
          filesArray[index].status = 'failure';
          filesArray[index].errorMessage = uploadError?.message || 'Upload failed. Please try again.';
          return;
        }

        if (response?.ok || response?.status === 'READY') {
          let uploadResData;
          try {
            if (response.json) {
              uploadResData = await response.json();
            } else {
              uploadResData = response.data || response;
            }
          } catch (jsonError) {
            console.error('JSON parse error for file:', file.name, jsonError);
            filesArray[index].status = 'failure';
            filesArray[index].errorMessage = 'Failed to process upload response.';
            return;
          }

          let fileType = 'file';
          if (file.type.startsWith('image/')) {
            fileType = 'image';
          } else if (file.type.startsWith('video/')) {
            fileType = 'video';
          } else if (file.type.startsWith('audio/')) {
            fileType = 'audio';
          }

          const uploadedId = uploadResData.id || uploadResData.video_id || uploadResData.audio_id;

          if (fileType === 'image' && generateImageUrl) {
            try {
              const imageUrlData = await generateImageUrl(uploadResData.collection_id || collectionId, uploadedId);
              uploadResults.images.push({
                image_id: uploadedId,
                url: imageUrlData.url,
              });
            } catch (e) {
              console.error('Failed to generate image URL:', e);
              uploadResults.images.push({
                image_id: uploadedId,
                url: null,
              });
            }
          } else if (fileType === 'video') {
            uploadResults.videos.push({
              id: uploadedId,
              name: file.name,
            });
          } else if (fileType === 'audio') {
            uploadResults.audios.push({
              id: uploadedId,
              name: file.name,
            });
          }

          filesArray[index].status = 'success';
        } else {
          filesArray[index].status = 'failure';
          filesArray[index].errorMessage = 'Upload failed. Please try again.';
        }
      } catch (error) {
        console.error('Unexpected upload error for file:', file.name, error);
        filesArray[index].status = 'failure';
        filesArray[index].errorMessage = error?.message || 'Network error. Please check your connection.';
      }
    });

    try {
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in upload promises:', error);
    }

    const allSuccess = filesArray.every(f => f.status === 'success');

    if (useExistingSession) {
      // For existing sessions, just update the upload status
      if (allSuccess) {
        mockConversations[sessionId][mockConvId][outputMsgId].status = 'success';
        mockConversations[sessionId][mockConvId][outputMsgId].content[0].status = 'success';
      } else {
        mockConversations[sessionId][mockConvId][outputMsgId].status = 'error';
        mockConversations[sessionId][mockConvId][outputMsgId].content[0].status = 'error';
      }

      mockSessions[sessionId].isUploading = false;

      if (handleAddMessage) {
        // Add message to the SAME session (no reset)
        await handleAddMessage({
          text,
          images: uploadResults.images,
          videos: uploadResults.videos,
          audios: uploadResults.audios,
          agents,
          additionalInfo,
          reset_session: false, // Keep existing session
          scroll_to_message: true, // Flag to trigger scroll after message is added
        });

        // Clean up mock conversation after a delay
        setTimeout(() => {
          delete mockSessions[sessionId];
          delete mockConversations[sessionId];
        }, 3000);
      }
    } else {
      // For new mock sessions, follow original behavior
      if (allSuccess) {
        mockSessions[sessionId].name = 'Upload complete';
        mockSessions[sessionId].uploadComplete = true;
      } else {
        mockSessions[sessionId].name = 'Upload failed';
        mockConversations[sessionId][mockConvId][outputMsgId].status = 'error';
        mockConversations[sessionId][mockConvId][outputMsgId].content[0].status = 'error';
      }

      mockSessions[sessionId].isUploading = false;

      if (handleAddMessage) {
        await handleAddMessage({
          text,
          images: uploadResults.images,
          videos: uploadResults.videos,
          audios: uploadResults.audios,
          agents,
          additionalInfo,
          reset_session: true,
        });

        setTimeout(() => {
          delete mockSessions[sessionId];
          delete mockConversations[sessionId];
        }, 6000);
      }
    }

    return sessionId;
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
