import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import LoginActions from '../Redux/LoginRedux'
import SimpleButton from '../Components/SimpleButton'
import { logoutFromAzure } from '../Services/AzureRestApi'

// Styles
import styles from './Styles/NavBarStyle'

class NavBar extends Component {
  logout = () => {
    logoutFromAzure().then(() => {
      this.props.logout()
      this.props.navigation.navigate('LaunchScreen')
    }).catch(error => console.log(error))
  }

  goHome = () => {
    this.props.navigation.navigate('LaunchScreen')
  }

  goBack = () => {
    this.props.navigation.goBack()
  }

  render() {
    const isHome = this.props.navigation.state.routeName === 'LaunchScreen';
    const containerStyles = [styles.navBarContainer]
    if (isHome) {
      containerStyles.push({ justifyContent: 'flex-end' })
    }

    return (
      <View style={containerStyles}>
        {!isHome && <TouchableOpacity style={styles.linkButton} onPress={this.goBack}>
          <Text style={styles.linkButtonText}>Back</Text>
        </TouchableOpacity>}
        {!isHome && <TouchableOpacity style={styles.linkButton} onPress={this.goHome}>
          <Text style={styles.linkButtonText}>Home</Text>
        </TouchableOpacity>}
        {this.props.loggedIn && <TouchableOpacity style={styles.linkButton} onPress={this.logout}>
          <Text style={styles.linkButtonText}>Logout</Text>
        </TouchableOpacity>}
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.login.loggedIn
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(LoginActions.logout())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
