module.exports = {
  ':^': function (message, audience, room, yuki) {
    yuki.chatMessage(room, ':^)')
    yuki.spammed()
  },

  'wow': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'omg')
    yuki.spammed()
  },

  '^': function (message, audience, room, yuki) {
    if (message.length === 1) {
      yuki.chatMessage(room, '^')
      yuki.spammed()
    }
  }
}
