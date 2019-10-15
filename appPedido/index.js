/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Cliente from './src/screens/Cliente';
import Login from './src/screens/Login';
import {name as appName} from './app.json';
import Routes from './src/Routes';


AppRegistry.registerComponent(appName, () => /*Routes*/Cliente);
