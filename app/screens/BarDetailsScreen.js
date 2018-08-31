import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View, StyleSheet, ActivityIndicator,
} from 'react-native';
import gql from 'graphql-tag';
import { compose } from 'react-apollo';
import { graphqlMutation } from 'aws-appsync-react';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import Config from 'react-native-config';
import BarDetails from '../components/BarDetails';
import MapLinks from '../components/MapLinks';
import ListBars from '../graphql/queries/ListBars';
import CreateBar from '../graphql/mutations/CreateBar';
import UpdateBar from '../graphql/mutations/UpdateBar';
import Button from '../components/Button';
import * as COLORS from '../config/colors';

class BarDetailsScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('bar').name,
    headerStyle: {
      backgroundColor: COLORS.DEFAULT_PRIMARY_COLOR,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTintColor: COLORS.TEXT_PRIMARY_COLOR,
  });

  state = {
    details: {},
    userId: '',
    isVisible: false,
    loading: false,
  };

  componentDidMount() {
    this.getBarDetails();
    this.getUser();
  }

  getBarDetails = async () => {
    try {
      this.setState({ loading: true });
      const { navigation } = this.props;
      const placeId = navigation.getParam('bar').place_id;

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=name,opening_hours/weekday_text,formatted_phone_number,vicinity,website,url,photo,type&key=${
          Config.GOOGLE_PLACES_API_KEY
        }`,
      );

      this.setState({ details: response.data.result, loading: false });
      console.log(response);
    } catch (error) {
      this.setState({ loading: false });
      console.log(error);
    }
  };

  getUser = async () => {
    try {
      this.setState({ loading: true });
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.signInUserSession.accessToken.payload.sub;
      this.setState({ userId, loading: false });
      console.log(userId);
    } catch (error) {
      this.setState({ loading: false });
      console.log(error);
    }
  };

  toggleMapLinks = () => {
    this.setState(prevState => ({ isVisible: !prevState.isVisible }));
  };

  render() {
    const { navigation } = this.props;
    const id = navigation.getParam('bar').place_id;
    const { lat, lng } = navigation.getParam('bar').geometry.location;
    const {
      details,
      userId,
      isVisible,
      loading,
    } = this.state;
    const { name } = details;

    if (loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.PRIMARY_TEXT_COLOR} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <BarDetails
          id={id}
          lat={lat}
          lng={lng}
          details={details}
          userId={userId}
        />
        <MapLinks
          isVisible={isVisible}
          onCancelPressed={this.toggleMapLinks}
          onAppPressed={this.toggleMapLinks}
          onBackButtonPressed={this.toggleMapLinks}
          name={name}
          lat={lat}
          lng={lng}
          id={id}
        />
        <Button
          title="Open in Maps"
          onPress={this.toggleMapLinks}
          style={{ backgroundColor: COLORS.ACCENT_COLOR, marginBottom: 10 }}
          textStyle={{ color: COLORS.TEXT_PRIMARY_COLOR }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loading: {
    paddingTop: 20,
  },
});

BarDetailsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    getParam: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  // graphql(gql(GetBar), {
  //   options: {
  //     fetchPolicy: 'cache-and-network',
  //   },
  //   variables: {
  //     id: ownProps.id,
  //   },
  //   props: ({ data }) => ({
  //     bar: data.getBar ? data.getBar : [],
  //   }),
  // }),
  graphqlMutation(gql(UpdateBar), { query: ListBars }, 'Bar'),
  graphqlMutation(gql(CreateBar), { query: ListBars }, 'Bar'),
)(BarDetailsScreen);
