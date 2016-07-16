function chooseRandomFrom (array) {
  return array[Math.floor(Math.random() * array.length)]
}

module.exports = {
  ':^': function (message, audience, room, yuki) {
    yuki.chatMessage(room, ':^)')
  },

  'wow': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'omg')
  },

  '^': function (message, audience, room, yuki) {
    if (message.length === 1) {
      yuki.chatMessage(room, '^')
    }
  },

  'reee': function (message, audience, room, yuki) {
    let memes = [
      'GET OUT NORMIES',
      '150 GBP MINUS',
      'All I wanted was a Pepsi.',
      'beta uprising when?'
    ]
    yuki.chatMessage(room, chooseRandomFrom(memes))
  },

  'how\'s it going': function (message, audience, room, yuki) {
    let answers = [
      'great!',
      'good and you?',
      'I\'m well thanks how are you?'
    ]
    yuki.chatMessage(room, chooseRandomFrom(answers))
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
    yuki.chatMessage(room, chooseRandomFrom(questions))
  },

  'here come dat bob': function (message, audience, room, yuki) {
    yuki.chatMessage(room, 'o shit HI!')
  }
}
