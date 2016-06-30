'use strict'
require('dotenv').config()
const User = require('steam-user')
let yuki = new User()

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
  setTimeout(function () { yuki.hasNotSpammedLately = true }, 300000)
}

yuki.obey = function (msg, room) {
  if (msg.indexOf('compare') === 1) {
    yuki.chatMessage(room, 'IDK how yet :^)')
  }
}

yuki.on('chatMessage', function (room, chatter, message) {
  if (message.indexOf(':^') > -1 && yuki.hasNotSpammedLately) {
    yuki.chatMessage(room, ':^)')
    yuki.spammed()
  } else if (message.substring(0) === '!') {
    yuki.obey(message, room)
  }
})
