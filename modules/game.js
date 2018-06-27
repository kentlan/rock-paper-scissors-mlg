import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, View, Button} from 'react-native'
import {gamesRef, userListRef} from '../config/firebase'
import calculateWinner from '../utils/calculate-winner'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveItem: {
    fontSize: 20,
  },
  activeItem: {
    color: 'green',
  },
  result: {
    fontSize: 50,
  },
})

export default class Game extends Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    gameId: PropTypes.string.isRequired,
    toggleHomeScreen: PropTypes.func.isRequired,
  }

  state = {
    message: '',
  }

  componentDidMount() {
    const {gameId} = this.props
    gamesRef
      .child(gameId)
      .once('value')
      .then(gameStats => this.getScores(gameStats.val()))

    gamesRef.on('child_removed', this.exitGame)
  }

  componentWillUnmount() {
    const {gameId} = this.props

    gamesRef.off('child_removed')
    gamesRef.child(gameId).off('value')
    gamesRef.child(gameId).off('value')
  }

  getScores = ({score}, message = this.state.message) => {
    const {userId} = this.props
    const opponentId = Object.keys(score).filter(id => id !== userId)[0]
    const userScore = score[userId]
    const opponentScore = score[opponentId]
    this.setState({
      userScore,
      opponentScore,
      message,
      opponentId,
    })
  }

  play = (item) => {
    this.setState({
      activeItem: item,
    })
    gamesRef
      .child(this.props.gameId)
      .once('value')
      .then(games => this.makeAMove(games.val(), item))
  }

  makeAMove = (gameStats, item) => {
    const {gameId, userId} = this.props
    const newMoves = Object.assign(gameStats.moves || {}, {
      [userId]: item,
    })
    const newGameStats = Object.assign(gameStats, {
      moves: newMoves,
    })
    gamesRef.child(gameId).set(newGameStats)

    gamesRef
      .child(gameId)
      .on(
        'value',
        updatedGameStats =>
          Object.keys(updatedGameStats.val().moves).length > 1 && this.updateScore(updatedGameStats.val()),
      )
  }

  updateScore = (gameStats) => {
    const {gameId, userId} = this.props
    const {opponentId} = this.state
    const {winnerId, message} = calculateWinner(gameStats.moves, userId, opponentId)

    gamesRef.child(gameId).off('value')

    const getWinner = () => {
      if (winnerId) {
        const newScore = Object.assign(gameStats.score, {
          [winnerId]: gameStats.score[winnerId] + 1,
        })
        const newGameStats = Object.assign(gameStats, {
          score: newScore,
        })
        gamesRef
          .child(gameId)
          .once('value')
          .then(gs => this.getScores(gs.val(), message))

        return gamesRef.child(gameId).set(newGameStats)
      }

      return this.setState({message})
    }
    getWinner()

    gamesRef
      .child(gameId)
      .child('moves')
      .set(null)
  }

  exitGame = () => {
    const {toggleHomeScreen, gameId, userId} = this.props
    const {opponentId} = this.state
    gamesRef.child(gameId).off('value')
    gamesRef.child(gameId).set(null)
    userListRef.child(userId).set(null)
    userListRef.child(opponentId).set(null)
    toggleHomeScreen()
  }

  renderMoves = () => {
    const moves = ['rock', 'paper', 'scissors']
    const {activeItem, moveItem} = styles

    return moves.map((title, index) => (
      <Text
        style={
          this.state.activeItem === index
            ? [activeItem, moveItem]
            : moveItem
          }
        key={title}
        onPress={() => this.play(index)}
      >
        {title}
      </Text>
    ))
  }

  render() {
    const {userScore, opponentScore, message} = this.state
    return (
      <View style={styles.container}>
        <Button title="exit" onPress={this.exitGame} />
        <Text style={styles.result}>{message}</Text>
        <Text>U: {userScore}</Text>
        <Text>EN3MY: {opponentScore}</Text>
        {this.renderMoves()}
      </View>
    )
  }
}
