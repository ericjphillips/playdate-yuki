const Discord = require('discord.js')
const yuki = new Discord.Client()

const MongoClient = require('mongodb').MongoClient
let db

MongoClient.connect(process.env.DB_URL, (err, database) => {
  if (err) { return console.log(err) }
  else {
    db = database
    console.log(`MongoDB successfully set up.`)
  }
})

yuki.on('ready', () => { console.log(`Logged in as ${yuki.user.username}.`)})

yuki.on('message', msg => {
  if (msg.content === 'deez') { msg.reply('nuts!') }
})

yuki.login(process.env.TOKEN)
