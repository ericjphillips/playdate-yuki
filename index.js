const Discord = require('discord.js')

const yuki = new Discord.Client()

yuki.on('ready', () => { console.log(`Logged in as ${yuki.user.username}!`)})

yuki.on('message', msg => {
  if (msg.content === 'deez') { msg.reply('nuts!') }
})

yuki.login(process.env.TOKEN)
