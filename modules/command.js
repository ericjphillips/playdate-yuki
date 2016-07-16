'use strict'
const fetch = require('node-fetch')
const bunyan = require('bunyan')
var log = bunyan.createLogger({
  name: 'command',
  streams: [
    {
      level: 'debug',
      path: './logs/debug.json'
    }
  ]
})

function steamUserInfo (api, method, steamid) {
  return `http://api.steampowered.com/${api}/${method}/v1/?key=${process.env.API_KEY}&steamid=${steamid}&format=json&include_appinfo=1&include_played_free_games=1`
}

function steamAppInfo (api, method) {
  return `http://api.steampowered.com/${api}/${method}/v2/?key=${process.env.API_KEY}&format=json`
}

function chooseRandomFrom (array) {
  return array[Math.floor(Math.random() * array.length)]
}

module.exports = {
  'compare': function (instructions, audience, room, yuki) {
    log.info(`Received a request to compare ${instructions}`)
    let player1 = instructions.substring(0, instructions.indexOf(' to '))
    let player2 = instructions.substring(instructions.indexOf(' to ') + 4)

    if (!player1 || !player2) {
      yuki.chatMessage(room, 'To compare, say: !compare player to player')
      return
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
      return
    }

    fetch(steamUserInfo('IPlayerService', 'GetOwnedGames', players[0].id))
    .then((res) => { return res.json() })
    .then((json) => {
      if (json.response.games === undefined) {
        yuki.chatMessage(room, `No games found for ${players[0].name}`)
        return
      } else {
        players[0].data = json.response
        return fetch(steamUserInfo('IPlayerService', 'GetOwnedGames', players[1].id))
      }
    })
    .then(res => { return res.json() })
    .then(json => {
      if (json.response.games === undefined) {
        yuki.chatMessage(room, `No games found for ${players[1].name}`)
        return
      } else {
        players[1].data = json.response
        return
      }
    })
    .then(() => {
      yuki.chatMessage(room, compare())
    })

    function compare () {
      players.sort((a, b) => {
        return a.data.games.length - b.data.games.length
      })

      let commonGames = []

      let playerOneGames = players[1].data.games

      playerOneGames.sort((a, b) => {
        return b.playtime_forever - a.playtime_forever
      })

      let playerZedGames = players[0].data.games

      playerZedGames.sort((a, b) => {
        return b.playtime_forever - a.playtime_forever
      })

      let continueSearch = true

      // Search for common games at an increasing depth
      for (let depth = 10; continueSearch === true && depth < playerOneGames.length + 9; depth = depth + 10) {
        // Go through player 1's games up to that depth
        for (let p1 = 0; continueSearch && p1 < depth && p1 < playerOneGames.length; p1 = p1 + 1) {
          // Avoid duplicate comparisons (ex: repeatedly comparing player1[0] with player2[0])
          if (depth > 10 && p1 < depth - 10) {
            // Go through players 2's games up to the depth (only include new games within this depth level)
            for (let p2 = depth - 10; p2 < depth && p2 < playerZedGames.length; p2 = p2 + 1) {
              // If they are common, push to the commonGames list
              if (playerOneGames[p1].name === playerZedGames[p2].name) {
                commonGames.push(playerOneGames[p1].name)
                // Only get up to 5 common games
                if (commonGames.length === 5) {
                  continueSearch = false
                }
              }
            }
          } else {
            // Go through players 2's games up to the depth (only include new games within this depth level)
            for (let p2 = 0; p2 < depth && p2 < playerZedGames.length; p2 = p2 + 1) {
              // If they are common, push to the commonGames list
              if (playerOneGames[p1].name === playerZedGames[p2].name) {
                commonGames.push(playerOneGames[p1].name)
                // Only get up to 5 common games
                if (commonGames.length === 5) {
                  continueSearch = false
                }
              }
            }
          }
        }
      }

      if (commonGames.length === 0) {
        return 'These two players have no games in common!'
      } else {
        return `The most played games that ${player1} and ${player2} have in common are: ${commonGames.join(', ')}.`
      }
    }
  },

  'lookup': function (instructions, audience, room, yuki) {
    log.info(`Received a request to lookup ${instructions}`)
    let title = instructions
    let appid = 0

    fetch(steamAppInfo('ISteamApps', 'GetAppList'))
    .then((res) => { return res.json() })
    .then((json) => {
      let gameIndex = json.applist.apps.findIndex((match) => {
        return title.toLowerCase() === match.name.toLowerCase()
      })
      if (gameIndex < 0) {
        yuki.chatMessage(room, `I don't know a game called ${title}`)
      } else {
        log.info(`Now polling audience for ${title}`)
        appid = json.applist.apps[gameIndex].appid
        return Promise.all(audience.map(function (player) {
          if (player.data) {
            return player
          } else {
            return fetch((steamUserInfo('IPlayerService', 'GetOwnedGames', player.id))).then((data) => { return data.json() })
            .then((json) => {
              player.data = json.response
              return player
            })
          }
        })
      ) }
    })
    .then((results) => {
      log.info(`Completed async requests on audience.`, {results: results})
      let titleOwners = []
      let playmates = results.filter((player) => {
        if (player.data.games) {
          return true
        } else {
          return false
        }
      })
      playmates.forEach((player) => {
        for (let game of player.data.games) {
          if (game.appid === appid) {
            titleOwners.push(player.name)
            return
          }
        }
      })
      if (titleOwners.length === 0) {
        yuki.chatMessage(room, `There is nobody here who plays ${title}.`)
      } else {
        yuki.chatMessage(room, `Playmates who own ${title}: ${titleOwners.join(', ')}`)
      }
    })
  },

  'yuki': function (instructions, audience, room, yuki) {
    if (instructions.slice(-1) !== '?') {
      yuki.chatMessage(room, 'Is that a question?')
    } else {
      instructions = instructions.slice(0, -1)
      let options = instructions.split(' or ')
      yuki.chatMessage(room, chooseRandomFrom(options))
    }
  }
}
