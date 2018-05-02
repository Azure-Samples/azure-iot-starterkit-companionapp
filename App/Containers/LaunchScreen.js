import React, { Component } from 'react'
import { Image, Platform, Text, View } from 'react-native'
import { StackNavigator } from 'react-navigation'
import { connect } from 'react-redux'
import SimpleButton from '../Components/SimpleButton'
import DeviceVersionScreen from '../Containers/DeviceVersionScreen'
import SetupScreen from '../Containers/SetupScreen'
import ScanScreen from '../Containers/ScanScreen'
import LoginActions from '../Redux/LoginRedux'
import ResourcesActions from '../Redux/ResourcesRedux'
import { interactiveLoginToAzure } from '../Services/AzureRestApi'
import Images from '../Themes/Images'
import NavBar from './NavBar'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  login = () => {
    interactiveLoginToAzure().then(authDetails => {
      this.props.login(authDetails.userInfo.givenName)
    }).catch(error => console.log(error))
  }

  openDeviceVersionScreen = () => {
    if (Platform.OS === 'windows') {
      this.props.navigation.navigate('MetadataEntryScreen')
    } else {
      this.props.navigation.navigate('ScanScreen')
    }
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <NavBar navigation={this.props.navigation} style={{ zIndex: 10 }} />
        <View style={styles.launchContent}>
          {!this.props.loggedIn && <View style={styles.logoContainer}>
            <Image source={Images.azureLogo} />
            <Text style={[styles.launchTitleText, { marginBottom: 20 }]}>
              Azure IoT Starter Kit Companion
            </Text>
          </View>}
          {this.props.loggedIn && <View>
            <Text style={styles.instructionText}>
              Hello there, {this.props.loggedInUser}.
            </Text>
            <SimpleButton text='Get Started' onPress={this.openDeviceVersionScreen} />
          </View>}
          {!this.props.loggedIn && <SimpleButton text='LOGIN' onPress={this.login} />}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.login.loggedIn,
    loggedInUser: state.login.loggedInUser
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    login: (username) => {
      dispatch(LoginActions.login(username))
      dispatch(ResourcesActions.clearAll())
    },
    logout: () => {
      dispatch(LoginActions.logout())
      dispatch(ResourcesActions.clearAll())
    }
  }
}

const launchScreen = connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)

export default StackNavigator({
  LaunchScreen: { screen: launchScreen },
  ScanScreen: { screen: ScanScreen },
  DeviceVersionScreen: { screen: DeviceVersionScreen },
  SetupScreen: { screen: SetupScreen }
}, {
    initialRouteName: 'LaunchScreen',
    headerMode: 'none',
    navigationOptions: {}
  })
