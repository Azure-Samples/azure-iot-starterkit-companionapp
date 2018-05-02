import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import styles from './Styles/PasswordInputStyle'

export default class PasswordInput extends Component {
  static propTypes = {
    inputValue: PropTypes.string,
    onChangeText: PropTypes.func,
    disableShow: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = {
      secureEntry: true
    }
  }

  toggleSwitch = () => {
    const secureEntry = !this.state.secureEntry;
    this.setState({ ...this.state, secureEntry })
  }

  render() {
    return (
      <View>
        <TextInput underlineColorAndroid="transparent"
          secureTextEntry={this.state.secureEntry}
          style={styles.textInputContainer} value={this.props.inputValue}
          onChangeText={this.props.onChangeText} />
        {!this.props.disableShow && <View style={styles.switchContainer}>
          <TouchableOpacity onPress={this.toggleSwitch}>
            <View pointerEvents='none'>
              <Text style={styles.switchLink}>{this.state.secureEntry ? 'show password' : 'hide password'}</Text>
            </View>
          </TouchableOpacity>
        </View>}
      </View >
    )
  }
}
