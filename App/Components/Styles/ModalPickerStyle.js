import { StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  comboTextInputContainer: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.azureMedium
  },
  comboTextInputIcon: {
    color: Colors.silver,
    marginTop: 2
  },
  modalContainer: {
    flex: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.steel
  },
  modalDoneContainer: {
    padding: Metrics.baseMargin,
    backgroundColor: Colors.snow
  },
  modalDoneText: {
    color: Colors.azureDark
  }
})
