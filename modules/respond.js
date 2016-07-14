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
  },

  'reee': function (message, audience, room, yuki) {
    let memes = [
      'GET OUT NORMIES',
      '150 GBP MINUS',
      'All I wanted was a Pepsi.'
    ]
    let meme = Math.floor(Math.random() * memes.length)
    yuki.chatMessage(room, memes[meme])
    yuki.spammed()
  },

  'how\'s it going': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'good, how are you?')
    yuki.spammed()
  },

  '9/11': function (message, audience, room, yuki) {
    let questions = [
      'How did insider traders know about the attacks before they happened?',
      'Why was air defense told to stand down?',
      'Why did witnesses report hearing explosions inside the towers?',
      'Jet fuel can\'t melt steal beams.',
      'How did the attackers passports survive the explosions?',
      'Light weight aluminum can\'t penetrate a steel structure.',
      'What really happened aboard Flight 93?'
    ]
    let query = Math.floor(Math.random() * questions.length)
    yuki.chatMessage(room, questions[query])
  },

  'here come dat bob': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'o shit HI!')
    yuki.spammed()
  }
}
