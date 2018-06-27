import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, View, Button} from 'react-native'
import {queueRef, userListRef} from '../config/firebase'
import Game from './game'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default class Search extends Component {
  static propTypes = {
    toggleHomeScreen: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  }

  state = {
    gameId: false,
    queue: [],
  }

  componentDidMount() {
    queueRef
      .once('value')
      .then(currentQueue => (currentQueue.val() ? this.joinQueue(currentQueue.val()) : this.createQueue()))
  }

  componentWillUnmount() {
    queueRef.once('value').then(queue => this.leaveQueue(queue.val()))
    queueRef.off('value', this.monitorQueue)
  }

  createQueue = () => {
    this.setState({queue: [this.props.userId]})
    queueRef.set([this.props.userId])
    queueRef.on('value', this.monitorQueue)
  }

  joinQueue = (currentQueue) => {
    const {userId} = this.props
    const clearedQueue = currentQueue.filter(user => user !== this.props.userId)
    const queue = clearedQueue.concat(userId)
    queueRef.set(queue)
    queueRef.on('value', this.monitorQueue)
  }

  leaveQueue = (currentQueue) => {
    if (currentQueue) {
      const newQueue = currentQueue.filter(user => user !== this.props.userId)
      queueRef.set(newQueue)
    }
  }

  checkForGame = userList => userList[this.props.userId] && this.startGame(userList[this.props.userId])

  monitorQueue = () => {
    queueRef
      .once('value')
      .then(queue =>
        this.setState(
          {queue: queue.val()},
          () =>
            this.state.queue &&
            queueRef.onDisconnect().set(this.state.queue.filter(user => user !== this.props.userId)),
        ))
    userListRef.once('value').then(userList => userList.val() && this.checkForGame(userList.val()))
  }
  startGame = gameId => this.setState({gameId})

  render() {
    const {toggleHomeScreen, userId} = this.props
    const {gameId} = this.state
    return (
      <View style={styles.container}>
        {gameId ? (
          <Game gameId={gameId} userId={userId} toggleHomeScreen={toggleHomeScreen} />
        ) : (
          <View>
            <Text>Searching for the opponents, mr {userId}</Text>
            <Button title="cancel" onPress={toggleHomeScreen} />
          </View>
        )}
      </View>
    )
  }
}
