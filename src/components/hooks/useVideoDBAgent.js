import io from "socket.io-client";
import { computed, onBeforeMount, reactive, ref, toRefs, watch } from "vue";

export const fetchData = async (rootUrl, endpoint) => {
  const res = {};
  try {
    const response = await fetch(`${rootUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    res.status = "success";
    res.data = data;
  } catch (error) {
    res.status = "error";
    res.error = error;
  }
  return res;
};

const apiRequest = async (rootUrl, endpoint, options = {}) => {
  const {
    method = "GET",
    payload = null,
    headers: customHeaders = {},
    responseType = "json",
  } = options;

  const res = {};
  try {
    const init = { method, headers: { ...customHeaders } };

    if (payload instanceof FormData) {
      init.body = payload;
      // Let the browser set the correct multipart/form-data headers
    } else if (payload !== null && payload !== undefined) {
      init.headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...customHeaders,
      };
      init.body = JSON.stringify(payload);
    }

    const response = await fetch(`${rootUrl}${endpoint}`, init);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    let data;
    if (responseType === "text") {
      data = await response.text();
    } else if (responseType === "blob") {
      data = await response.blob();
    } else {
      data = await response.json();
    }

    res.status = "success";
    res.data = data;
  } catch (error) {
    res.status = "error";
    res.error = error;
  }
  return res;
};

export function useVideoDBAgent(config) {
  const { debug = false, socketUrl, httpUrl, dbUrl, apiKey } = config;
  if (debug) console.log("debug :videodb-chat config", config);
  const socket = io(socketUrl);

  const session = reactive({
    isConnected: false,
    sessionId: null,
    videoId: null,
    collectionId: "default",
    isLoadingSession: false,
  });
  const configStatus = ref(null);

  const collections = ref(null);
  const sessions = ref([]);
  const sessionsPagination = ref({
    page: 0,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_more: true,
  });
  const isLoadingMoreSessions = ref(false);
  const sessionsSorted = computed(() => {
    return [...sessions.value].sort((a, b) => b.created_at - a.created_at);
  });
  const agents = ref([]);
  const liveSessions = ref([]);

  const defaultPrompts = ref(null);
  const userPrompts = ref(null);

  const conversations = reactive({});
  const messageQueues = reactive({});
  const activeCollectionData = ref(null);

  const activeCollectionVideos = ref(null);
  const activeVideoData = ref(null);

  const activeCollectionAudios = ref(null);
  const activeAudioData = ref(null);

  const activeCollectionImages = ref(null);
  const activeImageData = ref(null);

  const fetchSession = async (sessionId) =>
    fetchData(httpUrl, `/session/${sessionId}`);
  const fetchSessions = async (page = 1, perPage = 20) =>
    fetchData(httpUrl, `/session?page=${page}&per_page=${perPage}`);
  const fetchSessionContext = async (sessionId) =>
    fetchData(httpUrl, `/session/${sessionId}/context`);

  const fetchMoreSessions = async () => {
    if (isLoadingMoreSessions.value || !sessionsPagination.value.has_more) {
      return;
    }
    isLoadingMoreSessions.value = true;
    const nextPage = sessionsPagination.value.page + 1;
    try {
      const res = await fetchSessions(nextPage, sessionsPagination.value.per_page);
      if (res.status === "success" && res.data) {
        // Handle both new paginated format and legacy array format
        if (Array.isArray(res.data)) {
          // Legacy format - no more pages available
          const newSessions = res.data;
          sessions.value = [...sessions.value, ...newSessions];
          sessionsPagination.value = {
            ...sessionsPagination.value,
            page: nextPage,
            has_more: false,
          };
        } else {
          // New paginated format
          const newSessions = res.data.sessions || [];
          sessions.value = [...sessions.value, ...newSessions];
          sessionsPagination.value = res.data.pagination || sessionsPagination.value;
        }
      }
    } catch (error) {
      if (debug) console.error("debug :videodb-chat error fetching more sessions", error);
    } finally {
      isLoadingMoreSessions.value = false;
    }
  };

  const fetchCollections = async () =>
    fetchData(httpUrl, "/videodb/collection");
  const fetchCollection = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}`);

  const fetchCollectionVideo = async (collectionId, videoId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/video/${videoId}`);
  const fetchCollectionVideos = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/video`);

  const fetchCollectionAudio = async (collectionId, audioId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/audio/${audioId}`);
  const fetchCollectionAudios = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/audio`);

  const fetchCollectionImage = async (collectionId, imageId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/image/${imageId}`);
  const fetchCollectionImages = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/image`);

  const fetchAssets = async (params = {}) => {
    const {
      collection_id,
      asset_type,
      name_pattern,
      sort_by = 'created_at',
      sort_order = 'desc',
      min_duration,
      max_duration,
      min_size,
      max_size,
      page = 1,
      page_size = 50,
    } = params;

    const queryParams = new URLSearchParams();

    if (collection_id) queryParams.append('collection_id', collection_id);
    if (asset_type) queryParams.append('asset_type', asset_type);
    if (name_pattern) queryParams.append('name_pattern', name_pattern);
    if (sort_by) queryParams.append('sort_by', sort_by);
    if (sort_order) queryParams.append('sort_order', sort_order);
    if (min_duration !== undefined && min_duration !== null) queryParams.append('min_duration', min_duration);
    if (max_duration !== undefined && max_duration !== null) queryParams.append('max_duration', max_duration);
    if (min_size !== undefined && min_size !== null) queryParams.append('min_size', min_size);
    if (max_size !== undefined && max_size !== null) queryParams.append('max_size', max_size);
    if (page) queryParams.append('page', page);
    if (page_size) queryParams.append('page_size', page_size);

    return fetchData(httpUrl, `/videodb/assets?${queryParams.toString()}`);
  };

  const fetchAllAgents = async () => fetchData(httpUrl, "/agent");
  const fetchLiveSessions = async () => fetchData(httpUrl, "/live_session");
  const fetchConfigStatus = async () => fetchData(httpUrl, "/config/check");
  const fetchLLMModels = async () => fetchData(httpUrl, "/llm/models");

  const fetchPromptSchema = async () =>
    fetchData(httpUrl, "/prompt/schema");
  const fetchDefaultPrompts = async () =>
    fetchData(httpUrl, "/prompt/defaults");
  const fetchUserPrompts = async () =>
    fetchData(httpUrl, "/prompt/");
  const fetchSpecificPrompt = async (agent, promptName) =>
    fetchData(httpUrl, `/prompt/${agent}/${promptName}`);

  const fetchAllCostingsPerUser = async () =>
    fetchData(httpUrl, "/cost/");
  const fetchTotalCostPerProvider = async (providerName) =>
    fetchData(httpUrl, `/cost/provider/${providerName}`);

  const initializePrompts = async () => {
    try {
      const [defaultRes, userRes] = await Promise.all([
        fetchDefaultPrompts(),
        fetchUserPrompts()
      ]);

      if (defaultRes.status === 'success') {
        defaultPrompts.value = defaultRes.data?.data?.prompts || defaultRes.data?.prompts || {};
      }

      if (userRes.status === 'success') {
        userPrompts.value = userRes.data?.data?.prompts || userRes.data?.prompts || {};
      }
    } catch (error) {
      console.error('Error initializing prompts:', error);
    }
  };

  const refreshUserPrompts = async () => {
    try {
      const userRes = await fetchUserPrompts();
      if (userRes.status === 'success') {
        userPrompts.value = userRes.data?.data?.prompts || userRes.data?.prompts || {};
      }
    } catch (error) {
      console.error('Error refreshing user prompts:', error);
    }
  };

  const createOrUpdatePrompt = async (agent, promptName, prompt, modelName = null) => {
    const payload = {
      agent,
      prompt_name: promptName,
      prompt,
    };
    if (modelName !== null) {
      payload.model_name = modelName;
    }
    const result = await apiRequest(httpUrl, "/prompt/", {
      method: "POST",
      payload,
    });

    if (result.status === 'success') {
      await refreshUserPrompts();
    }

    return result;
  };

  const deletePrompt = async (agent, promptName) => {
    const result = await apiRequest(httpUrl, `/prompt/${agent}/${promptName}`, {
      method: "DELETE",
    });

    // Refresh user prompts after successful delete
    if (result.status === 'success') {
      await refreshUserPrompts();
    }

    return result;
  };

  const getVideoDownloadUrl = async (collectionId, videoId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/video/${videoId}/download`);

  const getDownloadUrlFromStream = async (streamUrl, name = null) => {
    const res = {};
    try {
      const payload = { stream_url: streamUrl };
      if (name) {
        payload.name = name;
      }

      const response = await fetch(`${httpUrl}/videodb/download`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      res.status = "success";
      res.data = data;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const getFileType = (file) => {
    if (!file || !file.type) {
      return null;
    }

    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith("image/")) {
      return "image";
    } else if (mimeType.startsWith("video/")) {
      return "video";
    } else if (mimeType.startsWith("audio/")) {
      return "audio";
    }

    return null;
  };

  const getMediaTypeFromUrl = async (url) => {
    if (url.includes("youtube.com")) return "video";

    try {
      const res = await fetch(url, { method: "HEAD" });
      const contentType = res.headers.get("content-type");
      if (!contentType) return "unknown";
      if (contentType.startsWith("image/")) return "image";
      if (contentType.startsWith("video/")) return "video";
      if (contentType.startsWith("audio/")) return "audio";
      return "video";
    } catch {
      return "video";
    }
  };

  const callApi = (endpoint, options = {}) =>
    apiRequest(httpUrl, endpoint, options);

  const getAudioFileExtension = (mimeType) => {
    if (!mimeType) return "webm";
    if (mimeType.startsWith("audio/mpeg") || mimeType.startsWith("audio/mp3")) return "mp3";
    if (mimeType.startsWith("audio/mp4")) return "m4a";
    if (mimeType.startsWith("audio/ogg")) return "ogg";
    return "webm";
  };

  const speechToText = async (audioBlob) => {
    const res = {};
    try {
      const extension = getAudioFileExtension(audioBlob.type);
      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${extension}`);

      const response = await fetch(`${httpUrl}/speech/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Transcription failed");
      }

      const data = await response.json();
      res.status = "success";
      res.text = data.text;
    } catch (error) {
      res.status = "error";
      res.error = error.message || error;
    }
    return res;
  };

  const uploadMedia = async (uploadData, onProgress = null) => {
    const { source, sourceType, collectionId, mediaType: providedMediaType } = uploadData;
    if (sourceType === "file") {
      const formData = new FormData();
      formData.append("file", source);

      const file = source;
      const mediaType = providedMediaType || file.type.split("/")[0];
      const name = file.name.split(".")[0];
      const res = await fetch(
        `${dbUrl}/collection/${collectionId}/upload_url/`,
        {
          method: "GET",
          headers: new Headers({
            "x-access-token": apiKey,
          }),
        }
      );
      const json = await res.json();
      const presignedUrl = json.data?.upload_url;
      if (!presignedUrl) throw new Error("Failed to get upload URL");

      await fetch(presignedUrl, {
        method: "POST",
        body: formData,
      });

      if (mediaType === "video") {
        return uploadVideo(presignedUrl, collectionId, name, onProgress);
      }

      return fetch(`${httpUrl}/videodb/collection/${collectionId}/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: presignedUrl,
          source_type: "url",
          media_type: mediaType,
          name: name,
        }),
      });
    } else if (sourceType === "url") {
      return uploadVideo(source.url, collectionId, null, onProgress);
    }
  };

  const uploadVideo = async (videoUrl, collectionId, name = null, onProgress = null) => {
    try {
      const ingestResponse = await fetch(`${httpUrl}/auto_indexer/ingest`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          collection_id: collectionId,
          name: name,
        }),
      });

      if (!ingestResponse.ok) {
        const errorData = await ingestResponse.json();
        throw new Error(errorData.message || "Failed to ingest video");
      }

      const ingestData = await ingestResponse.json();
      const requestId = ingestData.request_id;

      if (!requestId) {
        throw new Error("No request_id received from ingest endpoint");
      }

      const result = await pollVideoUpload(requestId, onProgress);
      return { ok: true, status: result.status, data: result };
    } catch (error) {
      if (debug) console.error("debug :videodb-chat error uploading video", error);
      throw error;
    }
  };

  const pollVideoUpload = async (requestId, onProgress = null, maxAttempts = 450, pollInterval = 2000) => {
    let attempts = 0;
    let lastStatusData = null;
    let hasNotifiedUploadComplete = false;

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(
          `${httpUrl}/auto_indexer/status?request_id=${requestId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!statusResponse.ok) {
          throw new Error("Failed to fetch upload status");
        }

        const statusData = await statusResponse.json();
        lastStatusData = statusData;

        if (statusData.media_id && !hasNotifiedUploadComplete && onProgress) {
          hasNotifiedUploadComplete = true;
          onProgress({ phase: 'indexing', media_id: statusData.media_id });
        }

        if (statusData.status === "READY") {
          return {
            status: "READY",
            request_id: requestId,
            video_id: statusData.media_id,
            audio_id: statusData.audio_id,
            tasks: statusData.tasks,
          };
        } else if (statusData.status === "FAILED" || statusData.status === "ERROR") {
          throw new Error(
            `Video upload failed: ${statusData.error || "Unknown error"}`
          );
        } else if (statusData.status === "PROCESSING") {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          continue;
        } else {
          throw new Error(`Unknown status: ${statusData.status}`);
        }
      } catch (error) {
        if (debug)
          console.error("debug :videodb-chat error polling upload status", error);
        throw error;
      }
    }

    if (lastStatusData?.media_id || lastStatusData?.audio_id) {
      return {
        status: "READY",
        request_id: requestId,
        video_id: lastStatusData.media_id,
        audio_id: lastStatusData.audio_id,
        tasks: lastStatusData.tasks,
      };
    }

    throw new Error("Video upload polling timeout - exceeded maximum attempts");
  };

  const generateAudioUrl = async (collectionId, audioId) => {
    const res = {};
    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/audio/${audioId}/generate_url`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const url = await response.text();
      res.status = "success";
      res.url = url;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const generateImageUrl = async (collectionId, imageId) => {
    const res = {};
    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/image/${imageId}/generate_url`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const url = await response.text();
      res.status = "success";
      res.url = url;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const generateVideoStream = async (
    collectionId,
    videoId,
    startTime,
    endTime,
  ) => {
    const res = {};
    try {
      const startSec = Math.floor(Number(startTime));
      const endSec = Math.floor(Number(endTime));
      const params = new URLSearchParams({
        start_time: String(startSec),
        end_time: String(endSec),
      });
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/video/${videoId}/generate_stream?${params.toString()}`,
      );
      const data = await response.json();
      if (!response.ok) {
        const message = data?.message || "Failed to generate video stream URL";
        throw new Error(message);
      }
      res.status = "success";
      res.data = data;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const saveMeetingContext = async (msgId, context) => {
    const res = {};
    try {
      const response = await fetch(
        `${httpUrl}/session/message/${msgId}/meeting_context`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(context),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      res.status = "success";
      res.data = data;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const fetchMeetingContext = async (uiId) => {
    const res = {};
    try {
      const response = await fetch(
        `${httpUrl}/session/meeting_context/${uiId}`,
      );
      if (response.status === 404) {
        res.status = "not_found";
        return res;
      }
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      res.status = "success";
      res.data = data;
    } catch (error) {
      res.status = "error";
      res.error = error;
    }
    return res;
  };

  const makeSessionPublic = async (sessionId, isPublic = true) => {
    const res = {};
    try {
      const response = await fetch(`${httpUrl}/session/${sessionId}/public`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_public: isPublic }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      res.status = "success";
      res.success = true;
      res.data = data;

      const idx = sessions.value.findIndex((s) => s.session_id === sessionId);
      if (idx !== -1) {
        sessions.value[idx] = {
          ...sessions.value[idx],
          is_public: isPublic,
        };
      }
    } catch (error) {
      res.status = "error";
      res.success = false;
      res.error = error.message;
    }
    return res;
  };

  const refetchCollectionVideos = async () => {
    fetchCollectionVideos(session.collectionId).then((res) => {
      activeCollectionVideos.value = res.data;
    });
  };

  const refetchCollectionAudios = async () => {
    fetchCollectionAudios(session.collectionId).then((res) => {
      activeCollectionAudios.value = res.data;
    });
  };

  const refetchCollectionImages = async () => {
    fetchCollectionImages(session.collectionId).then((res) => {
      activeCollectionImages.value = res.data;
    });
  };

  onBeforeMount(() => {
    fetchConfigStatus().then((res) => {
      if (debug) console.log("debug :videodb-chat config status", res);
      configStatus.value = res.data;
    });

    initializePrompts();
  });

  watch(configStatus, (val) => {
    if (
      typeof val === "object" &&
      val !== null &&
      Object.values(val).every((value) => value === true)
    ) {
      fetchCollections().then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const defaultCollection = res.data[0];
          activeCollectionData.value = defaultCollection;
          session.collectionId = defaultCollection.id;
          collections.value = [defaultCollection, ...res.data.slice(1)];
        } else {
          collections.value = [];
        }
      }).catch((error) => {
        if (debug) console.error("debug :videodb-chat error fetching collections", error);
        collections.value = [];
      });
      fetchSessions(1, 20).then((res) => {
        if (res.status === "success" && res.data) {
          // Handle both new paginated format and legacy array format
          if (Array.isArray(res.data)) {
            // Legacy format: API returns array directly
            sessions.value = res.data;
            sessionsPagination.value = {
              page: 1,
              per_page: res.data.length,
              total: res.data.length,
              total_pages: 1,
              has_more: false,
            };
          } else {
            // New paginated format: { sessions: [], pagination: {} }
            sessions.value = res.data.sessions || [];
            sessionsPagination.value = res.data.pagination || sessionsPagination.value;
          }
        }
      });
      fetchAllAgents().then((res) => {
        agents.value = res.data;
      });
    }
  });

  watch(
    () => session.isConnected,
    (val) => {
      if (debug) console.log("debug :videodb-chat session.isConnected :", val);
    },
  );

  watch(
    () => conversations,
    (val) => {
      if (debug) console.log("debug :videodb-chat conversations updated:", val);
    },
    { deep: true },
  );

  watch(
    () => session.collectionId,
    (val, oldVal) => {
      if (oldVal == "default") return;
      const fetchedForSession = session.sessionId;
      activeCollectionData.value = null;
      activeCollectionVideos.value = null;
      activeCollectionAudios.value = null;
      activeCollectionImages.value = null;

      if (val) {
        const collection = collections.value.find((c) => c.id === val);
        if (collection) {
          activeCollectionData.value = collection;
        } else {
          fetchCollection(val).then((res) => {
            if (session.sessionId !== fetchedForSession) return;
            activeCollectionData.value = res.data;
          });
        }

        fetchCollectionVideos(val).then((res) => {
          if (session.sessionId !== fetchedForSession) return;
          activeCollectionVideos.value = res.data;
        });

        fetchCollectionAudios(val).then((res) => {
          if (session.sessionId !== fetchedForSession) return;
          activeCollectionAudios.value = res.data;
        });

        fetchCollectionImages(val).then((res) => {
          if (session.sessionId !== fetchedForSession) return;
          activeCollectionImages.value = res.data;
        });
      }
    },
  );

  watch(
    () => session.videoId,
    (val) => {
      const fetchedForSession = session.sessionId;
      activeVideoData.value = null;
      if (val) {
        fetchCollectionVideo(session.collectionId, val).then((res) => {
          if (session.sessionId !== fetchedForSession) return;
          activeVideoData.value = res.data;
        });
      }
    },
  );

  const loadSession = (sessionId) => {
    let fetchPastMessages = true;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      fetchPastMessages = false;
    }
    if (debug) console.log("debug :videodb-chat session loading", sessionId);

    session.sessionId = sessionId;
    Object.keys(conversations).forEach((key) => delete conversations[key]);

    if (!fetchPastMessages) {
      session.isLoadingSession = false;
    } else {
      session.isLoadingSession = true;

      const fetchedForSessionId = sessionId;

      fetchSession(sessionId).then((res) => {
        if (session.sessionId !== fetchedForSessionId) {
          if (debug) console.log("debug :videodb-chat ignoring stale session response", fetchedForSessionId);
          return;
        }
        if (debug) console.log("debug :videodb-chat session loaded", res);
        if (res.status === "success") {
          session.videoId = res.data.video_id || null;
          session.collectionId =
            res.data.collection_id || session.collectionId || null;
          // Populate conversations with fetched data
          if (res.data.conversation) {
            res.data.conversation.forEach((message) => {
              const { conv_id, msg_id } = message;
              if (!conversations[conv_id]) {
                conversations[conv_id] = {};
              }
              conversations[String(conv_id)][String(msg_id)] = {
                sender: message.msg_type === "input" ? "user" : "assistant",
                ...message,
              };
            });
          }
        }
        session.isLoadingSession = false;
      }).catch((error) => {
        if (session.sessionId === fetchedForSessionId) {
          console.error("Error loading session:", error);
          session.isLoadingSession = false;
        }
      });
    }
  };

  const deleteSession = (sessionId) => {
    fetch(`${httpUrl}/session/${sessionId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((res) => {
        if (debug) console.log("debug :videodb-chat session deleted", res);
        sessions.value = sessions.value.filter(
          (s) => s.session_id !== sessionId,
        );
      })
      .catch((error) => {
        if (debug)
          console.error("debug :videodb-chat error deleting session", error);
      });
  };

  const renameSession = async (sessionId, name) => {
    const trimmed = (name || "").trim();
    if (trimmed.length === 0) {
      throw new Error("Session name cannot be empty.");
    }
    try {
      const response = await fetch(`${httpUrl}/session/${sessionId}/rename`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = (data && data.message) || "Failed to rename session.";
        throw new Error(message);
      }

      const index = sessions.value.findIndex((s) => s.session_id === sessionId);
      if (index !== -1) {
        sessions.value[index] = { ...sessions.value[index], name: trimmed };
      }

      return data || { success: true };
    } catch (error) {
      if (debug)
        console.error("debug :videodb-chat error renaming session", error);
      throw error;
    }
  };

  const updateMessageReaction = async (msgId, reaction) => {
    if (!session.sessionId) {
      throw new Error("No active session.");
    }
    if (!msgId) {
      throw new Error("Message ID is required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/session/${session.sessionId}/message/${msgId}/reaction`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reaction }),
        },
      );

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // Some servers may return empty body on success
      }

      if (!response.ok) {
        const message = (data && data.message) || "Failed to update reaction.";
        throw new Error(message);
      }

      return data || { success: true };
    } catch (error) {
      if (debug)
        console.error(
          "debug :videodb-chat error updating message reaction",
          error,
        );
      throw error;
    }
  };

  const createCollection = async (name, description) => {
    if (!name || name.trim() === "") {
      throw new Error("Collection name is required.");
    }

    try {
      const response = await fetch(`${httpUrl}/videodb/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      let res;
      try {
        res = await response.json();
      } catch (jsonError) {
        throw new Error("Failed to parse server response.");
      }

      if (Array.isArray(collections.value)) {
        collections.value.push(res.data.collection);
      }

      return res.data.collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw new Error(
        "An unexpected error occurred while creating the collection.",
      );
    }
  };

  const updateCollection = async () => {
    try {
      const res = await fetchCollections();
      if (res.status === "success") {
        const defaultCollection = res.data[0];
        collections.value = [defaultCollection, ...res.data.slice(1)];

        if (!collections.value.find((c) => c.id === session.collectionId)) {
          session.collectionId = defaultCollection.id;
        }
      }
    } catch (error) {
      console.error("Error updating collections:", error);
    }
  };

  const deleteCollection = async (collectionId) => {
    if (!collectionId) {
      throw new Error("Collection ID is required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete the collection.");
      }

      if (Array.isArray(collections.value)) {
        collections.value = collections.value.filter(
          (c) => c.id !== collectionId,
        );
      }

      if (session.collectionId === collectionId) {
        session.collectionId =
          collections.value.length > 0 ? collections.value[0].id : null;
      }

      return data;
    } catch (error) {
      if (
        error.message.includes("Invalid request: Your collection has non-zero")
      ) {
        throw error;
      }

      console.error("Unexpected error deleting collection:", error);
      throw error;
    }
  };

  const deleteVideo = async (collectionId, videoId) => {
    if (!collectionId || !videoId) {
      throw new Error("Collection ID and Video ID are required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/video/${videoId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete the video.");
      }
      const collection = collections.value.find(
        (col) => col.id === collectionId,
      );

      if (collection && Array.isArray(activeCollectionVideos.value)) {
        activeCollectionVideos.value = activeCollectionVideos.value.filter(
          (video) => video.id !== videoId,
        );
      }
      return data;
    } catch (error) {
      console.error(`Failed to delete video ${videoId}:`, error);
      throw error;
    }
  };

  const deleteAudio = async (collectionId, audioId) => {
    if (!collectionId || !audioId) {
      throw new Error("Collection ID and Audio ID are required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/audio/${audioId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete the audio.");
      }
      const collection = collections.value.find(
        (col) => col.id === collectionId,
      );

      if (collection && Array.isArray(activeCollectionAudios.value)) {
        activeCollectionAudios.value = activeCollectionAudios.value.filter(
          (audio) => audio.id !== audioId,
        );
      }

      return data;
    } catch (error) {
      console.error(`Failed to delete audio ${audioId}:`, error);
      throw error;
    }
  };

  const deleteImage = async (collectionId, imageId) => {
    if (!collectionId || !imageId) {
      throw new Error("Collection ID and Image ID are required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/image/${imageId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete the image.");
      }
      const collection = collections.value.find(
        (col) => col.id === collectionId,
      );

      if (collection && Array.isArray(activeCollectionImages.value)) {
        activeCollectionImages.value = activeCollectionImages.value.filter(
          (image) => image.id !== imageId,
        );
      }
      return data;
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      throw error;
    }
  };

  const deleteVoice = async (collectionId, voiceId) => {
    if (!collectionId || !voiceId) {
      throw new Error("Collection ID and Voice ID are required.");
    }

    try {
      const response = await fetch(
        `${httpUrl}/videodb/collection/${collectionId}/voice/${voiceId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete the voice.");
      }

      return data;
    } catch (error) {
      console.error(`Failed to delete voice ${voiceId}:`, error);
      throw error;
    }
  };

  const addClientLoadingMessage = (convId) => {
    const messages = Object.values(conversations[convId]);
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.clientLoading) {
      const loadingMsgId = Date.now() + 2;
      conversations[convId][loadingMsgId] = {
        conv_id: String(convId),
        msg_id: String(loadingMsgId),
        session_id: String(session.sessionId),
        msg_type: "output",
        sender: "assistant",
        clientLoading: true,
      };
    }
  };

  const removeClientLoadingMessage = (convId) => {
    const clientLoadingMessage = Object.values(conversations[convId]).find(
      (msg) => msg.clientLoading,
    );
    if (clientLoadingMessage) {
      delete conversations[convId][clientLoadingMessage.msg_id];
    }
  };

  const addMessage = (message) => {
    if (debug) console.log("debug :videodb-chat addMessage", message);
    if (session.isConnected) {
      const convId = Date.now();
      const msgId = convId + 1;
      const _message = {
        agents: [],
        msg_type: "input",
        sender: "user",
        conv_id: String(convId),
        msg_id: String(msgId),
        session_id: String(session.sessionId),
        collection_id: session.collectionId
          ? String(session.collectionId)
          : null,
        video_id: session.videoId ? String(session.videoId) : null,
        ...message,
      };

      if (!sessions.value.some((s) => s.session_id === session.sessionId)) {
        const sessionData = {
          session_id: session.sessionId,
          message: _message,
          created_at: Date.now(new Date()),
        };
        fetch(`${httpUrl}/session/${session.sessionId}`, {
          method: "POST",
          body: JSON.stringify(sessionData),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            sessions.value.push({
              session_id: data.session_id,
              created_at: data.created_at,
              name: data.name,
            });

            sessions.value = sessions.value.sort(
              (a, b) => b.created_at - a.created_at,
            );

            if (session.sessionId === null) {
              session.sessionId = data.session_id;
              session.isLoadingSession = false;
            }
          });
      }

      conversations[convId] = { [msgId]: _message };
      socket.emit("chat", _message);
      addClientLoadingMessage(convId);
    }
  };

  const stopMessage = (msgId) => {
    if (debug) console.log("debug :videodb-chat stopMessage", msgId);
    if (session.isConnected && msgId) {
      socket.emit("stop_message", { msg_id: String(msgId) });
    }
  };

  const isSessionBusy = (sid) => {
    if (!sid) return false;
    return Object.values(conversations).some(conv =>
      Object.values(conv).some(msg =>
        msg.session_id === String(sid) &&
        (msg.status === 'progress' || msg.clientLoading || msg.is_mock)
      )
    );
  };

  const findPendingMessageId = (sid) => {
    for (const conv of Object.values(conversations)) {
      for (const msg of Object.values(conv)) {
        if (msg.session_id === String(sid) && (msg.status === 'progress' || msg.clientLoading)) {
          return msg.msg_id;
        }
      }
    }
    return null;
  };

  const releaseQueue = (sid) => {
    const sessionKey = String(sid);
    if (!sessionKey || !messageQueues[sessionKey]?.length) return;

    const items = [...messageQueues[sessionKey]];
    messageQueues[sessionKey] = [];

    const primaryMessage = items[0];

    if (items.length > 1) {
      const combinedText = items.map(i => i.text).filter(t => !!t).join('\n\n');

      const content = [];
      if (combinedText) {
        content.push({ type: 'text', text: combinedText });
      }

      const messageToEmit = {
        ...primaryMessage,
        text: combinedText,
        content: content
      };

      if (debug) console.log("debug :videodb-chat releaseQueue - emitting merged message", {
        sessionId: sessionKey,
        queueLength: items.length,
        mergedTexts: items.map(i => i.text),
        finalMessage: messageToEmit
      });
      addMessage(messageToEmit);
    } else {
      const content = [];
      if (primaryMessage.text) {
        content.push({ type: 'text', text: primaryMessage.text });
      }

      const messageToEmit = {
        ...primaryMessage,
        content: content
      };

      if (debug) console.log("debug :videodb-chat releaseQueue - emitting single message", {
        sessionId: sessionKey,
        message: messageToEmit
      });
      addMessage(messageToEmit);
    }
  };

  const enqueueMessage = (sid, messageData) => {
    const targetSid = String(sid || session.sessionId);
    if (!targetSid) return;

    if (!messageQueues[targetSid]) messageQueues[targetSid] = [];
    messageQueues[targetSid].push({ ...messageData, id: Date.now(), session_id: targetSid });
  };

  socket.on("connect", () => {
    if (debug) console.log("debug :videodb-chat socket emmited connect");
    session.isConnected = true;
  });

  socket.on("chat", (event) => {
    if (debug) console.log("debug :videodb-chat socket emmited chat", event);
    if (session.isConnected) {
      const { conv_id: convId, msg_id: msgId, session_id: sessionId } = event;

      if (event.status && event.status !== 'progress') {
        releaseQueue(event.session_id);
      }

      if (session.sessionId !== sessionId) return;

      if (!conversations[convId]) {
        return;
      }
      conversations[convId][msgId] = { sender: "assistant", ...event };
      removeClientLoadingMessage(convId);
    }
  });

  socket.on("error", (error) => {
    if (debug) console.error("debug :videodb-chat socket error", error);
  });

  socket.on("disconnect", () => {
    if (debug) console.log("debug :videodb-chat socket disconnected");
    console.log("trying to reconnect");
  });

  socket.on("event", (event) => {
    if (debug) console.log("debug :videodb-chat socket emmited event", event);
    if (event.event_type === "update_data") {
      if (
        event.update === "videos" &&
        event.collection_id === session.collectionId
      ) {
        const fetchedForCollection = event.collection_id;
        fetchCollectionVideos(event.collection_id).then((res) => {
          if (session.collectionId !== fetchedForCollection) return;
          activeCollectionVideos.value = res.data;
        });
      }
      if (event.update === "collections") {
        updateCollection();
      }
    }
    if (event.event_type === 'message_stopped') {
      releaseQueue(event.session_id);
    }
  });

  return {
    ...toRefs(session),
    configStatus,
    collections,
    sessions: sessionsSorted,
    sessionsPagination,
    isLoadingMoreSessions,
    fetchMoreSessions,
    agents,
    activeCollectionData,
    activeCollectionVideos,
    activeVideoData,
    fetchCollectionVideos,
    refetchCollectionVideos,
    activeCollectionAudios,
    activeAudioData,
    fetchCollectionAudios,
    refetchCollectionAudios,
    activeCollectionImages,
    activeImageData,
    fetchCollectionImages,
    refetchCollectionImages,
    fetchAssets,
    fetchLLMModels,
    fetchSessionContext,
    fetchPromptSchema,
    fetchDefaultPrompts,
    fetchUserPrompts,
    fetchSpecificPrompt,
    createOrUpdatePrompt,
    deletePrompt,
    defaultPrompts,
    userPrompts,
    initializePrompts,
    refreshUserPrompts,
    fetchAllCostingsPerUser,
    fetchTotalCostPerProvider,
    conversations,
    messageQueues,
    enqueueMessage,
    isSessionBusy,
    addMessage,
    stopMessage,
    loadSession,
    deleteSession,
    renameSession,
    updateCollection,
    createCollection,
    deleteCollection,
    deleteVideo,
    deleteAudio,
    deleteImage,
    deleteVoice,
    getVideoDownloadUrl,
    getDownloadUrlFromStream,
    uploadMedia,
    uploadVideo,
    pollVideoUpload,
    getFileType,
    generateImageUrl,
    generateAudioUrl,
    makeSessionPublic,
    callApi,
    speechToText,
    generateVideoStream,
    updateMessageReaction,
    saveMeetingContext,
    fetchMeetingContext,
  };
}
