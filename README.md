#  Azure IoT Starter Kit Companion

The **Azure IoT Starter Kit Companion** is a sample React Native application that helps you get your IoT device connected to an IoT Hub on iOS, Android and Windows.

- It will connect your IoT device to a wireless network with Internet access.
- It will provision resources such as an IoT Hub and IoT Device in Azure.
- It will install and configure the IoT Edge Runtime on your IoT device.

## HockeyApp

For Android devices and Windows, if you have a work or school account, the quickest way to get the sample application is through [HockeyApp](https://hockeyapp.net). You can download and install the application for Android [here](https://rink.hockeyapp.net/apps/3f3aff53951843b5889db768287c531a).

### Windows
- Enable "Developer mode" in Settings -> Update & Security -> For Developers
- Download the zip file from [here](https://rink.hockeyapp.net/apps/9d049d0ef27c462aba7a3db3afc5d797)
- Unpack the zip file
- Run the PowerShell script: `./Add-AppDevPackage.ps`

## Getting Started

#### Install tools for your OS
- Install Git: https://git-scm.com
- Install Node.js: https://nodejs.org/en/download
- Install Yarn: `npm install -g yarn`
- Install the React Native CLI: `npm install -g react-native-cli`

### Register your application with Active Directory
- Follow the instructions here: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-integrating-applications
  - Select "Native" for the "Application type"
  - For the initial redirect URI, enter `x-msauth-AzureIoTDevKitCompanion://com.microsoft.AzureIoTDevKitCompanion`
  - You will need to add an additional redirect URI for the Windows version
  - In Settings > API ACCESS > Required Permissions, add "Windows Azure Service Management API" with all delegated permissions and save
- Set the client ID in the code: `App > Services > AzureRestApi.js` and `App > Services > AzureRestApi.windows.js`

### Clone the react-native-sshclient repository
- Clone the "react-native-sshclient" repository [https://github.com/Azure/react-native-sshclient](https://github.com/Azure/react-native-sshclient)
- This "react-native-sshclient" repository folder should be at the same directory level as this repository:
```
- Workspace Parent Folder
  - azure-iot-starterkit-companionapp
  - react-native-sshclient
```

A video of the setup steps is available [here](https://iotcompanionapp.blob.core.windows.net/videos/checkout.mov).

### iOS

#### Pre-requisites
- Install the latest version of Xcode
- Sign up for an Apple Developer account

#### Running the App
- Install the dependencies: `yarn install`
- Open `ios/AzureIoTDevKitCompanion.xcworkspace` with Xcode
- In the Project Navigator panel, select the "AzureIoTDevKitCompanion" project
- In General, select a Team. You will need an Apple Developer Account
- In the Project Navigator panel, select "Libraries/RNSSH.xcodeproj"
- Under `Build Settings > Search Paths`, add `$(SRCROOT)/../../../ios/Pods/Headers/Public` to `Header Search Paths` and set as `recursive`
- Clean and build
- Once the build is successful, select a simulator or your mobile device and click the "Run" button. This will launch the app on the simulator or mobile device and the Javascript bundler

A video of the steps is available [here](https://iotcompanionapp.blob.core.windows.net/videos/run_ios.mp4).

### Android

#### Pre-requisites:
- Install Android Studio: https://developer.android.com/studio/index.html - when installing, make sure to select "Custom Install" to install the AVD Manager
- Install any virtual devices you'd like to test

#### Running the App
- Install the dependencies: `yarn install`.
- In the terminal, run `yarn start` in the `azure-iot-starterkit-companionapp` folder.
- Click `Run > Run 'app'`
- In the "Select Deployment Target" screen, select a virtual or connected device and click "OK"

A video of the steps is available [here](https://iotcompanionapp.blob.core.windows.net/videos/run_android.mp4).

### Windows

#### Prerequisites:
- Install Visual Studio 2017

#### Running the App
- Install the dependencies modules: `yarn install`
- Open the Windows solution (`windows\mobileiot.sln`) in Visual Studio
- Install any missing SDKs or packages when prompted by Visual Studio
- In the Solution Explorer, if you see "ChakraBridge (unavailable)", right-click on that project and click "Install Missing Feature(s)"
- In the Solution Explorer, edit `ReactNative.Shared > Modules > Network > NetworkingModule.cs`
  - Find the "ApplyHeaders" method and replace `request.Headers.Add(key, header[1]);` with `request.Headers.TryAppendWithoutValidation(key, header[1]);`
- Clean and build for x64
- Run `react-native start` from Command Prompt
- Run the application from Visual Studio: `Debug > Start Without Debugging`

A video of the steps is available [here](https://iotcompanionapp.blob.core.windows.net/videos/run_windows.mp4).


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
