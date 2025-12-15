import { defineStore } from 'pinia'
import axios from 'axios'
import { createConsumer } from '@rails/actioncable'

const api = axios.create({ baseURL: 'http://localhost:3000' })
const cable = createConsumer('ws://localhost:3000/cable') // 웹소켓 주소

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    currentRoom: null,
    messages: [],
    subscription: null // 소켓 구독 정보 저장
  }),
  actions: {
    async fetchRooms() {
      const res = await api.get('/rooms')
      this.rooms = res.data
    },
    async joinRoom(roomId) {
      // 1. 기존 방 구독 취소
      if (this.subscription) this.subscription.unsubscribe()

      // 2. 메시지 목록 불러오기 (CRUD - Read)
      // (Rails routes설정에 따라 주소는 다를 수 있음, 보통 /messages?room_id=1 형태)
      this.currentRoom = roomId
      const res = await api.get(`/messages?room_id=${roomId}`) // Rails Controller 수정 필요할 수 있음
      this.messages = res.data

      // 3. 실시간 구독 시작 (ActionCable)
      this.subscription = cable.subscriptions.create(
        { channel: 'ChatChannel', room_id: roomId },
        {
          received: (newMessage) => {
            // 소켓으로 데이터가 오면 배열에 추가!
            this.messages.push(newMessage)
          }
        }
      )
    },
    async sendMessage(content, username) {
      // 메시지 전송은 HTTP POST로 (CRUD - Create)
      await api.post('/messages', {
        room_id: this.currentRoom,
        content,
        username
      })
      // 여기서 this.messages.push 하지 않음! (소켓이 받아서 처리할 것이므로)
    }
  }
})