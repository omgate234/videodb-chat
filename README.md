[![NPM version][npm-shield]][npm-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Website][website-shield]][website-url]
[![Discord][discord-shield]][discord-url]

<br />

<p align="center">
  <a href="https://videodb.io/">
    <img src="https://codaio.imgix.net/docs/_s5lUnUCIU/blobs/bl-RgjcFrrJjj/d3cbc44f8584ecd42f2a97d981a144dce6a66d83ddd5864f723b7808c7d1dfbc25034f2f25e1b2188e78f78f37bcb79d3c34ca937cbb08ca8b3da1526c29da9a897ab38eb39d084fd715028b7cc60eb595c68ecfa6fa0bb125ec2b09da65664a4f172c2f" alt="Logo" width="300" height="">
  </a>

  <h3 align="center">VideoDB Chat</h3>

  <p align="center">
    Chat UI Components for <a href="https://github.com/video-db/video-agents">  Video Agents</a>
    <br />
    <a href="https://stackblitz.com/edit/vitejs-vite-zyq2no?file=src%2FApp.vue"><strong>View Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/video-db/videodb-chat/issues">Report Bug</a>
    ·
    <a href="https://github.com/video-db/videodb-chat/issues">Request Feature</a>
  </p>
</p> 

# 💬 VideoDB Chat

These are Chat UI components to use with [Video Agents](https://github.com/video-db/video-agents).


# 🚀 Quickstart

### Installation
```
npm install @videodb/chat-vue
```

### Usage

Import the necessary components and styles. ( Currently supports Vue.js only )

> If you are using default ChatHook, make sure your backend is running and the socket url is correct  
> Checkout [video-agents](https://github.com/video-db/video-agents) for more details of backend setup for default ChatHook.

> If you want to setup with your own backend, checkout [using custom chatHook](#using-custom-chatHook) section

```html
<script setup>
  import { ref } from "vue";
  import { ChatInterface } from "@videodb/chat-vue";
  import "@videodb/chat-vue/dist/style.css";

  const isChatOpened = ref(true);
  const sessionId = Date.now();
  const collectionId = "default";

  // Set videoId to Chat With Video
  const videoId = null;

  const backendUrl = "http://127.0.0.1:5000/chat";
</script>

<template>
  <ChatInterface
    v-if="isChatOpened"
    :chat-hook-config="{
      sessionId: sessionId,
      collectionId: collectionId,
      videoId: videoId,
      url: backendUrl,
      debug: true,
    }"
    @backBtnClick="isChatOpened = false"
  />
</template>
```

# 🧑‍💻 Advanced Usage


### Leveraging Custom Hooks

Custom hooks offer a versatile approach to enhancing chat functionality:

- Connect to your own backend, bypassing VideoDB's video agent integration
- Develop custom logic for agent interactions
- Control conversation state and manage side effects
- Seamlessly integrate with your existing application architecture

This flexibility enables you to customize the chat experience to meet your specific requirements while ensuring compatibility with the ChatInterface component.

[View Custom Hook Example on StackBlitz](https://stackblitz.com/edit/vitejs-vite-knrrbv?file=src%2FApp.vue)

### Implementing Custom Message Handlers

Custom message handlers allow you to process various message types from different agents:

- Render custom UI components for specific agent types
- Fine-grained control over message processing
- Extensibility to support new agent types or response formats
- Improved user experience through tailored message rendering

[View Custom Message Handler Example on StackBlitz](https://stackblitz.com/edit/vitejs-vite-qnka6j?file=src%2FApp.vue)

# 📡 Interface

## ChatInterface

### Props

The ChatInterface component accepts the following props:

- `userImage`: String or Component (default: ChatUser Component)
  Specifies the image or component to represent user messages in the chat.

- `assistantImage`: String or Component (default: AssistantIcon Component)
  Defines the image or component for assistant messages.

- `emptyContainerLogo`: String or Component (default: SpextLogoBlue Component)
  Sets the logo displayed when the chat is empty.

- `chatInputPlaceholder`: String (default: "Ask a question")
Customizes the placeholder text for the chat input field.

- `searchSuggestions`: Array (default: [])
  Provides a list of search suggestions. Each suggestion should be an object with the format `{ "text": "search suggestion" }`.

- `shareUrl`: String (default: "")
  Specifies the URL for sharing the chat.

- `customChatHook`: Function (default: videoDBChatHook)
  Allows for a custom hook to handle chat functionality.

- `chatHookConfig`: Object
Configures the chat hook. For the default videoDBChatHook, it includes:

  - `url`: String (default: `http://127.0.0.1:5000/chat`) - URL for the chat backend socket.
  - `sessionId`: String (default: generated UUID) - Unique identifier for the chat session.
  - `collectionId`: String (default: null) - ID of the collection.
  - `videoId`: String (default: null) - ID of the video.
  - `debug`: Boolean (default: false) - Enables debug mode.

- `size`: String (default: `full`)
  Determines the size of the chat interface. Options are `full` or `embedded`.
  Full takes up the entire width of the screen.
  Embedded takes up space of the parent container.

### Exposed Variables

- `conversations`: Object
  Contains the conversation data.

- `addMessage`: Function
  Adds a message to the conversation.


### Conversation

Conversation is a collection of messages between user and agent of a session. Each conversation contains a list of messages objects 

- `conversationId` : ID of the conversation.
  - `msgId` : ID of the message.
    - `agent_type` : Type of the agent that generated the message.
    - `content` : Text content of the message. (input/output)
    - `conv_id` : ID of the collection.
    - `data` : JSON data associated with the agent message.
    - `msg_id` : ID of the message.
    - `msg_type` : Type of the message. (input/output)
    - `session_id` : Unique identifier for the chat session.
    - `sender` : Sender of the message. (assistant/user)
    - `status` : Status of the message. (progress/success/error)

[npm-shield]: https://img.shields.io/npm/v/@videodb/chat-vue?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/@videodb/chat-vue
[discord-shield]: https://img.shields.io/badge/dynamic/json?style=for-the-badge&url=https://discord.com/api/invites/py9P639jGz?with_counts=true&query=$.approximate_member_count&logo=discord&logoColor=blue&color=green&label=discord
[discord-url]: https://discord.com/invite/py9P639jGz
[stars-shield]: https://img.shields.io/github/stars/video-db/videodb-chat.svg?style=for-the-badge
[stars-url]: https://github.com/video-db/videodb-chat/stargazers
[issues-shield]: https://img.shields.io/github/issues/video-db/videodb-chat.svg?style=for-the-badge
[issues-url]: https://github.com/video-db/videodb-chat/issues
[website-shield]: https://img.shields.io/website?url=https%3A%2F%2Fvideodb.io%2F&style=for-the-badge&label=videodb.io
[website-url]: https://videodb.io/
