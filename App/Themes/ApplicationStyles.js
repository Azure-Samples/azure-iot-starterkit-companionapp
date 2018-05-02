import { Platform } from 'react-native'
import Fonts from './Fonts'
import Metrics from './Metrics'
import Colors from './Colors'

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

const ApplicationStyles = {
  screen: {
    ...Platform.select({
      ios: {
        navigationButton: {
          flex: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          backgroundColor: Colors.azureDark,
          marginBottom: 12
        },
        textInputContainer: {
          backgroundColor: Colors.azureMedium,
          padding: 8,
          color: Colors.silver,
          fontSize: 16
        }
      },
      android: {
        navigationButton: {
          flex: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          backgroundColor: Colors.azureDark
        },
        pickerContainer: {
          backgroundColor: Colors.azureMedium
        },
        picker: {
          color: Colors.snow
        },
        textInputContainer: {
          backgroundColor: Colors.azureMedium,
          padding: 8,
          color: Colors.silver,
          fontSize: 16
        }
      },
      windows: {
        navigationButton: {
          flex: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          backgroundColor: Colors.azureDark
        },
        pickerContainer: {
          backgroundColor: Colors.azureMedium
        },
        picker: {
          color: Colors.snow,
          borderWidth: 0
        },
        textInputContainer: {
          backgroundColor: Colors.azureMedium,
          paddingBottom: 0,
          paddingTop: 8,
          color: Colors.silver,
          borderWidth: 0,
          marginVertical: 0
        }
      }
    }),
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.azure
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    },
    container: {
      flex: 1,
      paddingTop: Metrics.baseMargin,
      backgroundColor: Colors.transparent
    },
    section: {
      margin: Metrics.section,
      padding: Metrics.baseMargin
    },
    sectionText: {
      ...Fonts.style.normal,
      paddingVertical: Metrics.doubleBaseMargin,
      color: Colors.snow,
      marginVertical: Metrics.smallMargin,
      textAlign: 'center'
    },
    subtitle: {
      color: Colors.snow,
      padding: Metrics.smallMargin,
      marginBottom: Metrics.smallMargin,
      marginHorizontal: Metrics.smallMargin
    },
    titleText: {
      ...Fonts.style.h2,
      fontSize: 14,
      color: Colors.text
    },
    highlight: {
      fontWeight: 'bold',
      textDecorationLine: 'underline'
    },
    bold: {
      fontWeight: 'bold',
    },
    instructionText: {
      fontFamily: Fonts.type.base,
      fontSize: 18,
      color: Colors.snow,
      textAlign: 'center',
      marginHorizontal: Metrics.section,
      marginVertical: Metrics.baseMargin
    },
    textInputGroup: {
      marginHorizontal: Metrics.doubleBaseMargin,
      marginVertical: Metrics.baseMargin
    },
    textInputLabel: {
      fontFamily: Fonts.type.base,
      color: Colors.snow,
      fontSize: 16,
      marginBottom: 5
    },
    navigationContainer: {
      flex: 0,
      flexDirection: 'row'
    },
    navigationButtonContainer: {
      flexGrow: 1
    },
    navigationButtonText: {
      color: Colors.silver,
      fontWeight: 'bold',
      fontSize: Fonts.size.medium
    }
  },
  darkLabelContainer: {
    padding: Metrics.smallMargin,
    paddingBottom: Metrics.doubleBaseMargin,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginBottom: Metrics.baseMargin
  },
  darkLabel: {
    fontFamily: Fonts.type.bold,
    color: Colors.snow
  },
  groupContainer: {
    margin: Metrics.smallMargin,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  sectionTitle: {
    ...Fonts.style.h4,
    color: Colors.coal,
    backgroundColor: Colors.ricePaper,
    padding: Metrics.smallMargin,
    marginTop: Metrics.smallMargin,
    marginHorizontal: Metrics.baseMargin,
    borderWidth: 1,
    borderColor: Colors.ember,
    alignItems: 'center',
    textAlign: 'center'
  }
}

export default ApplicationStyles
