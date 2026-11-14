import {Platform} from 'react-native';
import Reactotron from 'reactotron-react-native';

const host = Platform.select({
  ios: '192.168.50.17',
  android: '192.168.50.206', //ip ur computer
});

if (__DEV__) {
  Reactotron.configure({ host }).useReactNative().connect();
}
