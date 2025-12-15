<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from './stores/chat'

const store = useChatStore()
const inputMsg = ref('')
const myName = ref('User' + Math.floor(Math.random() * 100)) // 임의 유저명

onMounted(() => {
  store.fetchRooms()
})

const send = () => {
  if (!inputMsg.value) return
  store.sendMessage(inputMsg.value, myName.value)
  inputMsg.value = ''
}
</script>

<template>
  <div style="display: flex; gap: 20px;">
    <div style="width: 200px; border-right: 1px solid #ccc;">
      <h3>채팅방 목록</h3>
      <ul>
        <li v-for="room in store.rooms" :key="room.id">
          <button @click="store.joinRoom(room.id)">{{ room.name }} 입장</button>
        </li>
      </ul>
      </div>

    <div v-if="store.currentRoom" style="flex: 1;">
      <h3>방 번호: {{ store.currentRoom }}</h3>
      <div style="height: 300px; overflow-y: scroll; border: 1px solid #ddd; padding: 10px;">
        <div v-for="msg in store.messages" :key="msg.id">
          <strong>{{ msg.username }}:</strong> {{ msg.content }}
        </div>
      </div>
      <input v-model="inputMsg" @keyup.enter="send" placeholder="메시지 입력..." />
      <button @click="send">전송</button>
    </div>
    <div v-else>
      방을 선택해주세요.
    </div>
  </div>
</template>