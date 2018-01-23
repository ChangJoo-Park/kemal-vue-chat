new Vue({
  el: '#app',
  template: `
    <div v-if="connected">
      <h1 class="title">Kemal, Vue.js chat <small v-if="username"> - {{ username }}</small></h1>
      <div class="message-wrapper">
        <div class="message-box">
          <div class="message" v-for="message in messages">
            <strong class="message-username">{{ message.username }}</strong> : <span class="message-body">{{ message.body }}</span>
          </div>
        </div>
      </div>
      <div class="input-wrapper">
        <input class="message-input" type="text" @keyup.enter="onInputEnter" v-model="message" autofocus>
      </div>
    </div>
    <div v-else>
      <h1>Please refresh browser for join a room.</h1>
    </div>
  `,
  data: function () {
    return {
      connected: false,
      username: '',
      messages: [],
      message: '',
      server: null,
      sendable: true
    }
  },
  // Life Cycles
  mounted: function () {
    console.log('Hello Vue.js - Kemal Chat')
    this.username = window.prompt('What is your name ?')
    if (this.username.trim() === '') {
      window.alert('Please refresh tab for username')
      return
    }
    this.openWebSocket()
  },
  beforeDestroy: function () {
    this.closeWebSocket()
  },
  // Methods
  methods: {
    onInputEnter: function () {
      if (this.message.trim() === '') {
        return 
      }

      setTimeout(function () {
        this.sendable = true
      }.bind(this), 100);

      // Send Message
      if (this.sendable) {
        this.sendable = false
        this.sendMesssage(this.message)
        this.message = ''
      }
    },
    sendMesssage: function (message) {
      this.server.send(`${this.username}:${message}`)
    },
    openWebSocket: function () {
      const server = new WebSocket(`ws://${location.hostname}:${location.port}`)
      server.onmessage = (event) => {
        const serverSentMessages = JSON.parse(event.data)
        this.messages = serverSentMessages.map(m => {
          const splitted = m.split('\:')
          if (splitted.length < 2) {
            return { username: '', message: '' } // invalid message arrived
          }
          const username = splitted[0]
          return {
            username: username,
            body: m.replace(`${username}:`, '')
          }
        })

        this.$nextTick(this.scrollToBottom)
      }

      server.onopen = () => {
        this.connected = true
        this.sendMesssage(`has join this room ${new Date()} `)
      }

      this.server = server
    },
    scrollToBottom: function () {
      document.querySelector('.message-wrapper').scrollTo(0, document.querySelector(".message-box").scrollHeight)
    }
  }
})