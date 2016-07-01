require('dotenv').config()
const User = require('steam-user')
const Id = require('steamid')
const commands = require('./modules/command.js')
const responses = require('./modules/respond.js')
var yuki = new User()

yuki.logOn({
  'accountName': process.env.USERNAME,
  'password': process.env.PASSWORD
})

yuki.on('loggedOn', function (res) {
  console.log('Yuki is logged into Steam.')
  yuki.setPersona(User.EPersonaState.Online)
})

yuki.on('webSession', function (id, cookies) {
  console.log('Yuki got a web session.')
})

yuki.on('chatInvite', function (inviter, id) {
  yuki.joinChat(id)
})

yuki.hasNotSpammedLately = true
yuki.spammed = function () {
  yuki.hasNotSpammedLately = false
  setTimeout(function () { yuki.hasNotSpammedLately = true },
  60000 + 60000 * Math.floor(Math.random() * 4))
}

yuki.on('chatMessage', function (room, chatter, message) {
  if (message.indexOf('!') === 0) {
    let command = message.substring(1, message.indexOf(' '))
    if (command in commands) {
      let instructions = message.substring(message.indexOf(' ') + 1)
      yuki.chatMessage(room, commands[command](instructions))
    }
  } else {
    for (let response in responses) {
      if (message.indexOf(response) > -1 && yuki.hasNotSpammedLately) {
        yuki.chatMessage(room, responses[response]())
        yuki.spammed()
      }
    }
  }
})

yuki.playmates = {}
yuki.on('chatEnter', function (id) {
  yuki.playmates[id] = []
  let members = yuki.chats[id].members
  let steamids = []
  for (let member in members) {
    steamids.push(member)
  }
  yuki.getPersonas(steamids, function (personas) {
    for (let person in personas) {
      console.log(personas[person])
      let playmate = {}
      playmate.id = new Id(person)
      playmate.name = personas[person].player_name
      yuki.playmates[id].push(playmate)
    }
    console.log(yuki.playmates)
  })
})
