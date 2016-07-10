module.exports = {
  ':^': function (message, audience, room, yuki) {
    yuki.chatMessage(room, ':^)')
  },

  'wow': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'omg')
  },

  ':': function (message, audience, room, yuki) {
    if (message[0] === ':' && message.slice(-1) === ':') {
      yuki.chatMessage(room, 'sick emote')
    }
  },

  '^': function (message, audience, room, yuki) {
    if (message.length === 1) {
      yuki.chatMessage(room, '^')
    }
  }
}
