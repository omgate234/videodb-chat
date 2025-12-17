import io from "socket.io-client";
import { computed, onBeforeMount, reactive, ref, toRefs, watch } from "vue";

const fetchData = async (rootUrl, endpoint) => {
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

  const callApi = (endpoint, options = {}) =>
    apiRequest(httpUrl, endpoint, options);

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
  const sessionsSorted = computed(() => {
    return [...sessions.value].sort((a, b) => b.created_at - a.created_at);
  });
  const agents = ref([]);

  const conversations = reactive({});
  const activeCollectionData = ref(null);

  const activeCollectionVideos = ref(null);
  const activeVideoData = ref(null);

  const activeCollectionAudios = ref(null);
  const activeAudioData = ref(null);

  const activeCollectionImages = ref(null);
  const activeImageData = ref(null);

  const fetchSession = async (sessionId) =>
    fetchData(httpUrl, `/session/${sessionId}`);
  const fetchSessions = async () => fetchData(httpUrl, "/session");
  const fetchCollections = async () =>
    fetchData(httpUrl, "/videodb/collection");
  const fetchCollection = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}`);

  const fetchCollectionVideo = async (collectionId, videoId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/video/${videoId}`);
  const fetchCollectionVideos = async (collectionId) =>
    fetchData(httpUrl, `/videodb/collection/${collectionId}/video`);

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
  const fetchConfigStatus = async () => fetchData(httpUrl, "/config/check");

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
  const res = await fetch(url, { method: "HEAD" });
  const contentType = res.headers.get("content-type");

  if (!contentType) return "unknown";

  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";

  return "video";
};





const uploadMedia = async (uploadData) => {
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
      return uploadVideo(presignedUrl);
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
    const mediaType = providedMediaType || await getMediaTypeFromUrl(source.url);
    if (mediaType === "video") {
      return uploadVideo(source.url);
    }

    return fetch(`${httpUrl}/videodb/collection/${collectionId}/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: source.url,
        source_type: sourceType,
        media_type: mediaType,
      }),
    });
  }
};

  const uploadVideo = async (videoUrl) => {
    try {
      const ingestResponse = await fetch(`${httpUrl}/auto_indexer/ingest`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
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

      const result = await pollVideoUpload(requestId);
      return { ok: true, status: result.status, data: result };
    } catch (error) {
      if (debug) console.error("debug :videodb-chat error uploading video", error);
      throw error;
    }
  };

  const pollVideoUpload = async (requestId, maxAttempts = 450, pollInterval = 2000) => {
    let attempts = 0;
    let lastStatusData = null;

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
      fetchSessions().then((res) => {
        sessions.value = res.data;
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
      if (debug)
        console.log(
          "debug :videodb-chat conversations updated:",
          JSON.parse(JSON.stringify(val)),
        );
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
        // --- OPTIONAL FIX IN CATCH BLOCK ---
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

      await updateCollection();
      return res.data.collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw new Error(
        "An unexpected error occurred while creating the collection.",
      );
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

      await updateCollection();
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
            
          });
      }

      conversations[convId] = { [msgId]: _message };
      socket.emit("chat", _message);
      addClientLoadingMessage(convId);
    }
  };

  socket.on("connect", () => {
    if (debug) console.log("debug :videodb-chat socket emmited connect");
    session.isConnected = true;
  });

  socket.on("chat", (event) => {
    if (debug) console.log("debug :videodb-chat socket emmited chat", event);
    if (session.isConnected) {
      const { conv_id: convId, msg_id: msgId, session_id: sessionId } = event;
      if (session.sessionId !== sessionId) return;

      
      if (!conversations[convId]) {
        return;
      }
      conversations[convId][msgId] = { sender: "assistant", ...event };
      removeClientLoadingMessage(convId);
    }
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
  });

  return {
    ...toRefs(session),
    configStatus,
    collections,
    sessions: sessionsSorted,
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
    conversations,
    addMessage,
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
    renameSession,
    callApi,
    generateVideoStream,
    updateMessageReaction,
  };
}
