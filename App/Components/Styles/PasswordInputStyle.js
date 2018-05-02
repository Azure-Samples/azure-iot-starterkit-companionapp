import { StyleSheet } from 'react-native'
import { ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  switchContainer: {
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginTop: 5
  },
  switchText: {
    fontSize: 14,
    color: 'rgba(255,  255, 255, 0.8)',
    marginRight: 5
  },
  switchLink: {
    fontSize: 14,
    color: 'rgba(255,  255, 255, 0.8)',
    fontWeight: 'bold',
    textDecorationLine: 'underline'
  }
})
