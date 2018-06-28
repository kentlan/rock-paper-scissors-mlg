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
  }

  componentDidMount() {
    this.joinQueue()
  }

  componentWillUnmount() {
    queueRef.child(this.state.userQueueKey).remove()
    userListRef.off('value')
    queueRef.off('value')
  }

  joinQueue = () => {
    const userQueueKey = queueRef.push(this.props.userId).key
    this.setState({userQueueKey})
    this.monitorQueue(userQueueKey)

    queueRef.on(
      'value',
      queueSnapshot =>
        this.setState({opponentFound: Object.keys(queueSnapshot.val() || {}).length > 1}),
    )
    userListRef.on('value', this.checkForGame)
  }

  leaveQueue = (currentQueue) => {
    if (currentQueue) {
      const newQueue = currentQueue.filter(user => user !== this.props.userId)
      queueRef.set(newQueue)
    }
  }

  checkForGame = (userList) => {
    const userListValue = userList.val()
    const {userId} = this.props
    return userListValue && this.startGame(userListValue[userId])
  }

  monitorQueue = userQueueKey =>
    queueRef
      .child(userQueueKey)
      .onDisconnect()
      .remove()

  startGame = (gameId) => {
    queueRef.off('value')
    this.setState({gameId})
  }

  render() {
    const {toggleHomeScreen, userId} = this.props
    const {gameId, opponentFound} = this.state
    return (
      <View style={styles.container}>
        {gameId ? (
          <Game gameId={gameId} userId={userId} toggleHomeScreen={toggleHomeScreen} />
        ) : (
          <View>
            <Text>Searching for the opponents, mr {userId}</Text>
            {opponentFound ? <Text>Opponont Found! Waiting for server...</Text> : <Button title="cancel" onPress={toggleHomeScreen} />}
          </View>
        )}
      </View>
    )
  }
}
