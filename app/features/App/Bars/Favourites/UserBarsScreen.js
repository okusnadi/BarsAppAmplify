import React, { PureComponent } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Auth } from 'aws-amplify';

// Components
import UserBarsList from './containers/UserBarsList';

// Config
import * as COLORS from '../../../../config/colors';

export default class UserBarssScreen extends PureComponent {
  static navigationOptions = {
    header: null,
  };

  state = {
    userId: '',
    loading: false,
  };

  componentDidMount() {
    this.getUser();
  }

  getUser = async () => {
    try {
      this.setState({ loading: true });
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = await currentUser.signInUserSession.accessToken.payload.sub;
      this.setState({ userId, loading: false });
      console.log(userId);
    } catch (error) {
      this.setState({ loading: false });
      console.log(error);
    }
  };

  render() {
    const { userId, loading } = this.state;

    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.PRIMARY_TEXT_COLOR} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <UserBarsList userId={userId} barId="" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.TEXT_PRIMARY_COLOR,
  },
  loading: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});
