import { StyleSheet } from 'react-native'
import { ApplicationStyles, Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  setPasswordContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  nextButton: {
    backgroundColor: Colors.azureLight
  }
})
