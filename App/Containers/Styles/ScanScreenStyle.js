import { StyleSheet } from 'react-native'
import { ApplicationStyles, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  scannerContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  switchLink: {
    fontSize: 14,
    color: 'rgba(255,  255, 255, 0.8)',
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
})
