import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Modal, Picker, View, Text, TextInput, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './Styles/ModalPickerStyle'

export default class ModalPicker extends Component {

  static propTypes = {
    label: PropTypes.string,
    inputValue: PropTypes.string,
    items: PropTypes.array,
    onValueChange: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items.length > 0) {
      const match = nextProps.items.find(item => item.value === nextProps.inputValue)
      if (!match) {
        this.props.onValueChange(nextProps.items[0].value)
      }
    }
  }

  toggleModal = () => {
    this.setState({ ...this.state, modalOpen: !this.state.modalOpen })
  }

  render() {
    const textValue = this.props.items.find(item => item.value === this.props.inputValue);

    return (
      <View style={styles.textInputGroup}>
        <Text style={styles.textInputLabel}>{this.props.label}</Text>
        <TouchableOpacity onPress={this.toggleModal}>
          <View pointerEvents='none' style={styles.comboTextInputContainer}>
            <TextInput style={[styles.textInputContainer, { flexGrow: 1 }]}
              value={textValue && textValue.label} editable={false} />
            <Icon name="keyboard-arrow-down" size={30} style={styles.comboTextInputIcon} />
          </View>
        </TouchableOpacity>
        <Modal animationType="slide"
          transparent={true}
          visible={this.state.modalOpen}>
          <View style={styles.modalContainer}>
            <View style={styles.modalDoneContainer}>
              <Text style={styles.modalDoneText} onPress={this.toggleModal}>Done</Text>
            </View>
            <View>
              <Picker selectedValue={this.props.inputValue}
                onValueChange={this.props.onValueChange}>
                {this.props.items.map(item => <Picker.Item key={item.key} label={item.label} value={item.value} />)}
              </Picker>
            </View>
          </View>
        </Modal>
      </View >
    )
  }
}
