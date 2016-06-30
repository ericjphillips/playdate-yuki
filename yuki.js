'use strict'
// Pull in modules and instantiate our Steam user
require('dotenv').config()
const User = require('steam-user')
let yuki = new User()

// Log on, set to Online, and join chat
yuki.logOn({
  'accountName': process.env.USERNAME,
  'password': process.env.PASSWORD
})

yuki.on('loggedOn', function (res) {
  console.log('Yuki is logged into Steam.')
  yuki.setPersona(User.EPersonaState.Online)
  console.log(res)
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
// Example chat message response
yuki.on('chatMessage', function (room, chatter, message) {
  if (message.indexOf(':^') > -1 && yuki.hasNotSpammedLately) {
    yuki.chatMessage(room, ':^)')
    yuki.spammed()
  }
})
