import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Picker, View, Text, TextInput, TouchableOpacity } from 'react-native'
import styles from './Styles/NewOrExistingTextInputStyle'

export default class NewOrExistingTextInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    inputValue: PropTypes.string,
    existingItems: PropTypes.array,
    onValueChange: PropTypes.func,
    onModeChange: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      showExisting: false
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.state.showExisting) {
      if (!nextProps.existingItems || nextProps.existingItems.length === 0) {
        this.setState({ ...this.state, showExisting: false })
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.showExisting !== nextState.showExisting) {
      if (this.props.onModeChange) {
        this.props.onModeChange(nextState.showExisting)
      }
    }
  }

  toggleSwitch = () => {
    const existingShown = !this.state.showExisting;
    this.setState({ ...this.state, showExisting: existingShown })
  }

  render() {
    const hasExistingItems = this.props.existingItems && this.props.existingItems.length > 0;
    return (
      <View style={styles.textInputGroup}>
        <Text style={styles.textInputLabel}>{this.props.label}</Text>
        {!this.state.showExisting && <TextInput underlineColorAndroid="transparent"
          style={styles.textInputContainer} value={this.props.inputValue}
          onChangeText={this.props.onValueChange} />}
        {this.state.showExisting && <View style={styles.pickerContainer}>
          <Picker style={styles.picker} selectedValue={this.props.inputValue}
            onValueChange={this.props.onValueChange}>
            {this.props.existingItems.map(item => <Picker.Item key={item.key} label={item.label} value={item.value} />)}
          </Picker>
        </View>}
        {hasExistingItems && <View style={styles.switchContainer}>
          <Text style={styles.switchText}>or</Text>
          <TouchableOpacity onPress={this.toggleSwitch}>
            <View pointerEvents='none'>
              <Text style={styles.switchLink}>{this.state.showExisting ? 'create new' : 'choose from existing'}</Text>
            </View>
          </TouchableOpacity>
        </View>}
      </View >
    )
  }
}
