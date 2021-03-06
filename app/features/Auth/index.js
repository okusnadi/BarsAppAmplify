import { createStackNavigator } from 'react-navigation';

import HomeScreen from './HomeScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

export default createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  'Sign In': {
    screen: SignInScreen,
  },
  'Sign Up': {
    screen: SignUpScreen,
  },
});
