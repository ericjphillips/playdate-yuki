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
})

yuki.on('chatInvite', function (inviter, id) {
  log.info(`Yuki was invited to join a chat`, {inviter: inviter, room: id})
  yuki.joinChat(id)
})

yuki.hasNotSpammedLately = true
yuki.spammed = function () {
  yuki.hasNotSpammedLately = false
  setTimeout(function () { yuki.hasNotSpammedLately = true },
  180000 + 60000 * Math.floor(Math.random() * 3))
  return
}

yuki.on('chatMessage', function (room, chatter, message) {
  if (message.indexOf('!') === 0) {
    let command = message.substring(1, message.indexOf(' '))
    if (command in commands) {
      let instructions = message.substring(message.indexOf(' ') + 1)
      let audience = yuki.playmates[room]
      commands[command](instructions, audience, room, yuki)
      return
    }
  } else {
    for (let response in responses) {
      if (message.indexOf(response) > -1 && yuki.hasNotSpammedLately) {
        yuki.chatMessage(room, responses[response]())
        yuki.spammed()
        return
      }
    }
  }
  return
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
      let playmate = {}
      playmate.id = person
      playmate.name = personas[person].player_name
      yuki.playmates[id].push(playmate)
    }
    log.info('Yuki entered chat with the following playmates.', {playmates: yuki.playmates[id]})
    return
  })
  return
})

/*
yuki.on('chatUserJoined', function (room, user) {
  log.info(`A new user joined chat ${room}`, {user: user})
  for (let playmate of yuki.playmates[room]) {
    if (playmate.id === user) {
      return
    } else {
      yuki.getPersonas([user], function (personas) {
        for (let person in personas) {
          let playmate = {}
          playmate.id = person
          playmate.name = personas[person].player_name
          yuki.playmates[room].push(playmate)
        }
      })
    }
  }
})
*/

yuki.on('error', function (error) {
  log.warn({error: error})
  return
})

yuki.on('disconnected', function (eresult, msg) {
  log.warn(`Yuki disconnected.`, {
    eresult: User.EResult[eresult],
    message: msg
  })
  return
})
