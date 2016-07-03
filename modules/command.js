const fetch = require('node-fetch')

function steamAPI (api, method, steamid) {
  return `http://api.steampowered.com/${api}/${method}/v1/?key=${process.env.API_KEY}&steamid=${steamid}&format=json&include_appinfo=1`
}

module.exports = {
  compare: function (instructions, audience, room, yuki) {
    console.log(`Received compare request: compare ${instructions}`)

    let player1 = instructions.substring(0, instructions.indexOf(' to '))
    let player2 = instructions.substring(instructions.indexOf(' to ') + 4)

    if (!player1 || !player2) {
      yuki.chatMessage(room, 'To compare, say: !compare player to player')
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
        yuki.chatMessage(room, 'There\'s nobody by those names here right now.')
      } else {
        yuki.chatMessage(room, `I only know who ${players[0].name} is.`)
      }
    }

    fetch(steamAPI('IPlayerService', 'GetOwnedGames', players[0].id))
    .then((res) => { return res.json() })
    .then((json) => {
      if (json.response.games === undefined) {
        yuki.chatMessage(room, `No games found for ${players[0].name}`)
        return
      } else {
        players[0].games = json.response.games
        return fetch(steamAPI('IPlayerService', 'GetOwnedGames', players[1].id))
      }
    })
    .then(res => { return res.json() })
    .then(json => {
      if (json.response.games === undefined) {
        yuki.chatMessage(room, `No games found for ${players[1].name}`)
        return
      } else {
        players[1].games = json.response.games
        return
      }
    })
    .then(() => {
      console.log(players)
      yuki.chatMessage(room, compare())
    })

    function compare () {
      players.sort((a, b) => {
        return a.games.length - b.games.length
      })
      players.forEach((player) => {
        player.games.sort((a, b) => {
          return b.playtime_forever - a.playtime_forever
        })
      })

      let commonGames = []
      players[0].games.forEach((game) => {
        if (players[1].games.findIndex((match) => {
          return game.appid === match.appid
        }) > -1) {
          commonGames.push(game.name)
        }
      })
      commonGames = commonGames.slice(0, 5)
      if (commonGames.length === 0) {
        return 'These two players have no games in common!'
      } else {
        return `The top games that ${player1} and ${player2} have in common are ${commonGames.join(', ')}.`
      }
    }
  }
}
