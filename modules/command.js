const fetch = require('node-fetch')

function steamAPI (api, method, steamid) {
  return `http://api.steampowered.com/${api}/${method}/v0001/?key=${process.env.API_KEY}&steamid=${steamid}&format=json`
}

module.exports = {
  compare: function (message, audience) {
    console.log(`Received compare request: compare ${message}`)
    let player1 = message.substring(0, message.indexOf(' to '))
    let player2 = message.substring(message.indexOf(' to ') + 4)
    let players = audience.filter((player) => {
      if (player.name === player1 || player.name === player2) {
        return true
      } else {
        return false
      }
    })
    players.forEach((player) => {
      fetch(steamAPI('IPlayerService', 'GetOwnedGames', player.id))
      .then(res => { return res.json() })
      .then(json => {
        if (json.response.game_count < 1) {
          player.games = null
          return false
        } else {
          player.games = json.response.games
          return true
        }
      })
    })
    return `I'll compare ${message} a little bit later.`
  }
}
