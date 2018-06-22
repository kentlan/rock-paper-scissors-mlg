import React from 'react'
import {StyleSheet, View, Text, Button} from 'react-native'
import {signIn, auth} from './config/firebase'
import Search from './modules/search'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default class App extends React.Component {
  state = {
    homeScreen: true,
  }

  componentWillMount() {
    auth.onAuthStateChanged(user => (user ? this.setState({userId: user.uid}) : signIn()))
  }

  toggleHomeScreen = () => this.setState({homeScreen: !this.state.homeScreen})


  render() {
    const {homeScreen, authError} = this.state
    return (
      <View style={styles.container}>
        {authError && <Text>oops, auth error, moron</Text>}
        {homeScreen && <Button title="play" onPress={this.toggleHomeScreen} />}
        {!homeScreen && <Search userId={this.state.userId} toggleHomeScreen={this.toggleHomeScreen} />}
      </View>
    )
  }
}
