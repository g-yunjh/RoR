<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from './stores/chat'

const store = useChatStore()
const inputMsg = ref('')
const messageContainer = ref(null) 

// 테스트용 내 이름 (실제 앱에선 로그인 정보)
const myName = ref('나') 

onMounted(async () => {
  await store.fetchRooms()
  // 방이 있으면 첫 번째 방 자동 입장
  if (store.rooms.length > 0) {
    store.joinRoom(store.rooms[0].id)
  }
})

// 메시지가 오면 스크롤을 맨 아래로 내림
watch(() => store.messages.length, () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
})

const send = async () => {
  if (!inputMsg.value.trim()) return
  await store.sendMessage(inputMsg.value, myName.value)
  inputMsg.value = ''
}
</script>

<template>
  <div class="app-container">
    
    <aside class="sidebar">
      <div class="sidebar-header">SimChat 💬</div>
      <ul class="room-list">
        <li v-for="room in store.rooms" :key="room.id">
          <button 
            @click="store.joinRoom(room.id)"
            :class="{ active: store.currentRoom === room.id }"
          >
            # {{ room.name }}
          </button>
        </li>
      </ul>
      <div class="my-profile">
        접속자: {{ myName }}
      </div>
    </aside>

    <main class="chat-area">
      
      <header class="chat-header">
        <h2>{{ store.rooms.find(r => r.id === store.currentRoom)?.name || '채팅방 선택' }}</h2>
      </header>

      <div class="messages-container" ref="messageContainer">
        <div v-if="store.messages.length === 0" class="empty-state">
          대화 내용이 없습니다. 첫 메시지를 보내보세요!
        </div>

        <div 
          v-for="msg in store.messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'my-message': msg.username === myName, 'other-message': msg.username !== myName }"
        >
          <span class="sender-name" v-if="msg.username !== myName">{{ msg.username }}</span>
          <div class="bubble">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <div class="input-area">
        <input 
          v-model="inputMsg" 
          @keyup.enter="send" 
          type="text" 
          placeholder="메시지를 입력하세요..." 
        />
        <button @click="send" :disabled="!inputMsg.trim()">전송</button>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* 전체 레이아웃 (Flexbox 사용) */
.app-container {
  display: flex;
  height: 100vh; /* 화면 꽉 차게 */
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  color: #333;
}

/* --- 왼쪽 사이드바 --- */
.sidebar {
  width: 240px;
  background-color: #2c3e50; /* 짙은 남색 */
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #1a252f;
}

.room-list {
  flex: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.room-list button {
  width: 100%;
  text-align: left;
  padding: 15px 20px;
  background: none;
  border: none;
  color: #bdc3c7;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1rem;
}

.room-list button:hover {
  background-color: #34495e;
  color: white;
}

.room-list button.active {
  background-color: #3498db; /* 활성 상태 파란색 */
  color: white;
  font-weight: bold;
}

.my-profile {
  padding: 15px;
  background-color: #1a252f;
  font-size: 0.9rem;
  color: #95a5a6;
}

/* --- 오른쪽 채팅 영역 --- */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5; /* 연한 회색 배경 */
}

.chat-header {
  padding: 15px 20px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.messages-container {
  flex: 1;
  overflow-y: auto; /* 스크롤 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  text-align: center;
  color: #888;
  margin-top: 50px;
}

/* 메시지 말풍선 공통 */
.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%; /* 말풍선 최대 너비 */
}

.bubble {
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-all;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.sender-name {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  margin-left: 5px;
}

/* 내 메시지 (오른쪽, 파란색) */
.my-message {
  align-self: flex-end; /* 오른쪽 정렬 */
}

.my-message .bubble {
  background-color: #3498db;
  color: white;
  border-bottom-right-radius: 0; /* 말풍선 꼬리 효과 */
}

/* 남의 메시지 (왼쪽, 흰색) */
.other-message {
  align-self: flex-start; /* 왼쪽 정렬 */
}

.other-message .bubble {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-bottom-left-radius: 0; /* 말풍선 꼬리 효과 */
}

/* 하단 입력창 */
.input-area {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 1rem;
}

.input-area input:focus {
  border-color: #3498db;
}

.input-area button {
  padding: 0 25px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.input-area button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>