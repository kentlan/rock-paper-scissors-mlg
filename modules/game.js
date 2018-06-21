import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, View, Button} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default class Game extends Component {
  play = (item) => {
    console.log(item)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>game itself lol</Text>
        <Button title="rock" onPress={this.play('rock')} />
        <Button title="paper" onPress={this.play('paper')} />
        <Button title="scissors" onPress={this.play('scissors')} />
      </View>
    )
  }
}
