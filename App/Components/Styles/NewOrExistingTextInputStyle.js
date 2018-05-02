import { Platform, StyleSheet } from 'react-native'
import { ApplicationStyles, Metrics, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  ...Platform.select({
    ios: {
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
      },
    }
  }),
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
