import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, View, Button} from 'react-native'
import {database} from '../config/firebase'
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

  render() {
    database
      .ref('rock-paper-scissor')
      .once('value')
      .then((snapshot) => {
        console.log(snapshot.val())
        // ...
      })
    const {toggleHomeScreen, userId} = this.props
    const {gameFound} = this.state
    return (
      <View style={styles.container}>
        {gameFound ? (
          <Game />
        ) : (
          <View>
            <Text onPress={() => this.setState({gameFound: true})}>Searching for the opponents, mr {userId}</Text>
            <Button title="cancel" onPress={toggleHomeScreen} />
          </View>
        )}
      </View>
    )
  }
}
