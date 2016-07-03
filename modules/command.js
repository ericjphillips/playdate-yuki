const fetch = require('node-fetch')

function steamAPI (api, method, steamid) {
  return `http://api.steampowered.com/${api}/${method}/v0001/?key=${process.env.API_KEY}&steamid=${steamid}&format=json`
}

module.exports = {
  compare: function (message, audience) {
    console.log(`Received compare request: compare ${message}`)
    let player1 = message.substring(0, message.indexOf(' to '))
    let player2 = message.substring(message.indexOf(' to ') + 4)
    if (!player1 || !player2) {
      return 'To compare, say: !compare player to player'
    }
    let players = audience.filter((player) => {
      if (player.name === player1 || player.name === player2) {
        return true
      } else {
        return false
      }
    })
    if (players.length < 2) {
      if (players.length < 1) {
        return 'There\'s nobody by those names here right now.'
      } else {
        return `I only know who ${players[0].name} is.`
      }
    }
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
    if (!players[0].games || !players[1].games) {
      if (!players[0].games && !players[1].games) {
        return `I couldn't lookup games for either ${players[0].name} or ${players[1].name}.`
      } else if (!players[0].games) {
        return `I couldn't lookup games for ${players[0].name}.`
      } else {
        return `I couldn't lookup games for ${players[1].name}`
      }
    }
    return `I'll compare ${message} a little bit later.`
  }
}
