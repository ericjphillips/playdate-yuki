require('dotenv').config()
const bunyan = require('bunyan')
const User = require('steam-user')
const commands = require('./modules/command.js')
// const responses = require('./modules/respond.js')
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

function matchingIdFound (collection, targetid) {
  return collection.indexOf(function (object) {
    object.id === targetid > -1
  })
}

function updatePlaymateInfo (room, user) {
  if (!user) {
    yuki.playmates = {}
    yuki.playmates[room] = []
    let members = yuki.chats[room].members
    let steamids = []
    for (let member in members) {
      steamids.push(member)
    }
    fetchPersonas(steamids, room)
  } else if (!matchingIdFound(yuki.playmates[room], user)) {
    fetchPersonas([user], room)
  } else {
    return
  }
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

function returnPlaymateIndex (room, user) {
  return yuki.playmates[room].indexOf(function (playmate) {
    return playmate.id === user
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
  updatePlaymateInfo(room, user)
})

yuki.on('chatUserLeft', function (room, user) {
  yuki.playmates[room].splice(returnPlaymateIndex(room, user), 1)
})

yuki.on('chatMessage', function (room, chatter, message) {
  let audience = yuki.playmates[room]
  if (message.indexOf('!') === 0) {
    let command = message.substring(1, message.indexOf(' '))
    if (command in commands) {
      let instructions = message.substring(message.indexOf(' ') + 1)
      commands[command](instructions, audience, room, yuki)
    }
  }
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
