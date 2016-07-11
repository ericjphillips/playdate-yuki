require('dotenv').config()
const bunyan = require('bunyan')
const User = require('steam-user')
const commands = require('./modules/command.js')
const responses = require('./modules/respond.js')
var yuki = new User()
var log = bunyan.createLogger({
  name: 'yuki',
  streams: [
    {
      level: 'debug',
      path: './logs/debug.json'
    }
  ]
})

yuki.playmates = {}

function refreshWebSession () {
  yuki.webLogOn()
}

setInterval(refreshWebSession, 60000 * 60 * 8)

yuki.hasNotSpammedLately = true
yuki.spammed = function () {
  yuki.hasNotSpammedLately = false
  setTimeout(function () { yuki.hasNotSpammedLately = true },
  180000 + 60000 * Math.floor(Math.random() * 3))
}

function updatePlaymateInfo (room) {
  yuki.playmates[room] = []
  let members = yuki.chats[room].members
  let steamids = []
  for (let member in members) {
    steamids.push(member)
  }
  fetchPersonas(steamids, room)
}

function fetchPersonas (steamids, room) {
  yuki.getPersonas(steamids, function (personas) {
    for (let person in personas) {
      let playmate = {}
      playmate.id = person
      playmate.name = personas[person].player_name
      yuki.playmates[room].push(playmate)
    }
  })
}

yuki.logOn({
  'accountName': process.env.USERNAME,
  'password': process.env.PASSWORD
})

yuki.on('loggedOn', function (res) {
  log.info(`Yuki signed in.`)
  yuki.setPersona(User.EPersonaState.Online)
})

yuki.on('webSession', function (id, cookies) {
  log.info(`Yuki got a new web session.`)
  yuki.joinChat('103582791432297280')
})

yuki.on('chatEnter', function (room) {
  updatePlaymateInfo(room)
})

yuki.on('chatUserJoined', function (room, user) {
  updatePlaymateInfo(room)
})

yuki.on('chatUserLeft', function (room, user) {
  updatePlaymateInfo(room)
})

yuki.on('chatMessage', function (room, chatter, message) {
  let audience = yuki.playmates[room]
  if (message.indexOf('!') === 0) {
    let command = message.substring(1, message.indexOf(' '))
    if (command in commands) {
      let instructions = message.substring(message.indexOf(' ') + 1)
      commands[command](instructions, audience, room, yuki)
    }
  } else {
    for (let response in responses) {
      if (message.toLowerCase().indexOf(response) > -1 && yuki.hasNotSpammedLately) {
        responses[response](message, audience, room, yuki)
        yuki.spammed()
      }
    }
  }
})

yuki.on('chatInvite#103582791432297280', function (user, room) {
  yuki.joinChat(room)
})

yuki.on('error', function (error) {
  log.warn({error: error})
})

yuki.on('disconnected', function (eresult, msg) {
  log.warn(`Yuki disconnected.`, {
    eresult: User.EResult[eresult],
    message: msg
  })
})
