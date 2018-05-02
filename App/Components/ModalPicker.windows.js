import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Picker, View, Text } from 'react-native'
import styles from './Styles/ModalPickerStyle'

export default class ModalPicker extends Component {

  static propTypes = {
    label: PropTypes.string,
    inputValue: PropTypes.string,
    items: PropTypes.array,
    onValueChange: PropTypes.func
  }

  render() {
    return (
      <View style={styles.textInputGroup}>
        <Text style={styles.textInputLabel}>{this.props.label}</Text>
        <View style={styles.pickerContainer}>
          <Picker style={styles.picker} selectedValue={this.props.inputValue}
            onValueChange={this.props.onValueChange}>
            {this.props.items.map(item => <Picker.Item key={item.key} label={item.label} value={item.value} />)}
          </Picker>
        </View>
      </View >
    )
  }
}
