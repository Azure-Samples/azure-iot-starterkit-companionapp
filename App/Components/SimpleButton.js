import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Text, TouchableOpacity } from 'react-native'
import styles from './Styles/SimpleButtonStyle'

export default class SimpleButton extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    text: PropTypes.string,
    children: PropTypes.string,
    navigator: PropTypes.object,
    style: PropTypes.any
  }

  getText() {
    return this.props.text || this.props.children || ''
  }

  render() {
    return (
      <TouchableOpacity style={[styles.button, this.props.style]} onPress={this.props.onPress}>
        <Text style={styles.buttonText}>{this.getText()}</Text>
      </TouchableOpacity>
    )
  }
}
