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
  }

  componentDidMount() {
    queueRef.once('value').then(queue => (queue.val() ? this.joinQueue(queue.val()) : this.createQueue()))
  }

  componentWillUnmount() {
    queueRef.once('value').then(queue => this.leaveQueue(queue.val()))
  }

  createQueue = () => queueRef.set([this.props.userId])

  joinQueue = currentQueue => queueRef.set(currentQueue.concat(this.props.userId))

  leaveQueue = (currentQueue = []) => {
    const newQueue = currentQueue.filter(user => user !== this.props.userId)
    queueRef.set(newQueue)
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
