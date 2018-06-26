import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, View, Button} from 'react-native'
import {queueRef} from '../config/firebase'
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
    gameFound: false,
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
    console.log('GNIDA', currentQueue)
    // this.setState({queue})
    const {userId} = this.props
    const clearedQueue = currentQueue.filter(user => user !== this.props.userId)
    const queue = clearedQueue.concat(userId)
    queueRef.set(queue)
    queueRef.on('value', this.monitorQueue)
  }

  leaveQueue = (currentQueue = []) => {
    const newQueue = currentQueue.filter(user => user !== this.props.userId)
    queueRef.set(newQueue)
  }

  monitorQueue = () =>
    queueRef
      .once('value')
      .then(queue =>
        this.setState({queue: queue.val()}, () =>
          queueRef.onDisconnect().set(this.state.queue.filter(user => user !== this.props.userId))))

  startGame = () => {
    // get gameId
    this.setState({gameFound: true})
  }

  render() {
    const {toggleHomeScreen, userId} = this.props
    const {gameFound} = this.state
    return (
      <View style={styles.container}>
        {gameFound ? (
          <Game />
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
