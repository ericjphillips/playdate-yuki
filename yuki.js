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
  yuki.joinChat(process.env.CHATID, function (EResult) {
    console.log(`Yuki is attempting to join chat... ${User.EResult[EResult]}`)
  })
})

yuki.hasNotSpammedLately = true
yuki.spammed = function () {
  yuki.hasNotSpammedLately = false
  setTimeout(function () { yuki.hasNotSpammedLately = true }, 300000)
}

yuki.obey = function (msg, room) {
  switch (msg) {
    case msg.indexOf('compare') === 1:
      yuki.chatMessage(room, 'idk how to do that just yet..')
      break
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
