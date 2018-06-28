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

const MOVES = ['rock', 'paper', 'scissors']

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

    gamesRef.child(gameId).onDisconnect().set(null)
  }

  componentWillUnmount() {
    const {gameId} = this.props

    gamesRef.off('child_removed')
    gamesRef.child(gameId).off('value')
    gamesRef.child(gameId).off('value')
  }

  getScores = ({score}, newState = {}) => {
    const {userId} = this.props
    const opponentId = Object.keys(score).filter(id => id !== userId)[0]
    const userScore = score[userId]
    const opponentScore = score[opponentId]
    this.setState(Object.assign(newState, {
      userScore,
      opponentScore,
      opponentId,
    }))
    userListRef.child(userId).onDisconnect().set(null)
    userListRef.child(opponentId).onDisconnect().set(null)
  }

  play = (item) => {
    this.setState({
      activeItem: item,
    })

    gamesRef
      .child(this.props.gameId)
      .once('value')
      .then(gameStatsSnapShot => this.makeMove(gameStatsSnapShot.val(), item))
  }

  makeMove = (gameStats, item) => {
    const {gameId, userId} = this.props

    gamesRef.child(`${gameId}/moves`).update({[userId]: item})

    gamesRef
      .child(`${gameId}/moves`)
      .on(
        'value',
        movesSnapshot =>
          movesSnapshot.val() && Object.keys(movesSnapshot.val()).length > 1 && this.updateScore(movesSnapshot.val()),
      )
  }

  updateScore = (moves) => {
    const {gameId, userId} = this.props
    const {opponentId, userScore, opponentScore} = this.state

    const {winnerId, message} = calculateWinner(moves, userId, opponentId)

    gamesRef.child(`${gameId}/moves`).off('value')

    const opponentMove = moves[opponentId]

    const getWinner = () => {
      if (winnerId) {
        const modifiedScore = winnerId === userId ? userScore + 1 : opponentScore + 1
        const newScore = {
          [winnerId]: modifiedScore,
        }
        gamesRef.child(`${gameId}/score`).update(newScore)

        return gamesRef
          .child(gameId)
          .once('value')
          .then(gameStatsSnapShot => this.getScores(gameStatsSnapShot.val(), {message, opponentMove, activeItem: null}))
      }

      return this.setState({message, activeItem: null, opponentMove})
    }
    getWinner()

    gamesRef.child(`${gameId}/moves`).set(null)
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
    const {activeItem, moveItem} = styles

    return MOVES.map((title, index) => (
      <Text
        style={this.state.activeItem === index ? [activeItem, moveItem] : moveItem}
        key={title}
        onPress={() => this.play(index)}
      >
        {title}
      </Text>
    ))
  }

  render() {
    const {
      userScore, opponentScore, message, opponentMove,
    } = this.state
    return (
      <View style={styles.container}>
        <Button title="exit" onPress={this.exitGame} />
        <Text style={styles.result}>{message}</Text>
        {opponentMove !== null && <Text>btw, opponent played {MOVES[opponentMove]}</Text>}
        <Text>U: {userScore}</Text>
        <Text>EN3MY: {opponentScore}</Text>
        {this.renderMoves()}
      </View>
    )
  }
}
