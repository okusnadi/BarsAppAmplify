import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  View, FlatList, Linking, StyleSheet, SegmentedControlIOS, Alert,
} from 'react-native';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import _ from 'lodash';

// GraphQL
import GetUserBars from '../../../../../graphql/queries/GetUserBars';
import GetBarMember from '../../../../../graphql/queries/GetBarMember';
import DeleteBarMember from '../../../../../graphql/mutations/DeleteBarMember';

// Components
import UserBarsListItem from '../components/UserBarsListItem';

// Util
import orderData from '../../../../../util/orderData';

// Config
import * as COLORS from '../../../../../config/colors';

class UserBarsList extends PureComponent {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    bars: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    refetch: PropTypes.func.isRequired,
    networkStatus: PropTypes.number.isRequired,
    deleteBarMember: PropTypes.func.isRequired,
  };

  static navigationOptions = {
    header: null,
  };

  state = {
    isVisible: false,
    deleting: false,
    options: ['Name', 'Created At'],
    selectedIndex: 0,
    property: 'name',
    direction: 'asc',
  };

  openWebsiteLink = (website) => {
    try {
      const supported = Linking.canOpenURL(website);
      if (supported) {
        Linking.openURL(website);
        console.log(website);
      } else {
        console.log('Website url not valid.');
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  openPhone = (phone) => {
    try {
      Linking.openURL(`tel://${phone}`);
      console.log(phone);
    } catch (error) {
      console.log(error);
    }
  };

  toggleMapLinks = () => {
    this.setState(prevState => ({ isVisible: !prevState.isVisible }));
  };

  toggleBarSortOrder = (event) => {
    const { options } = this.state;
    this.setState({ property: _.camelCase(options[event.nativeEvent.selectedSegmentIndex]) });
    console.log(event.nativeEvent);
  };

  deleteFavourite = async (barId) => {
    try {
      this.setState({ deleting: true });

      const {
        userId,
        refetchBarMember,
        deleteBarMember,
        bars,
      } = this.props;

      console.log(`userId: ${userId}, barId: ${barId}`);

      const barMemberAdded = await refetchBarMember({ userId, barId });
      console.log(barMemberAdded);
      console.log(`id: ${barMemberAdded.data.getBarMember.id}`);

      if (barMemberAdded.data.getBarMember !== null && bars.length > 1) {
        await deleteBarMember(barMemberAdded.data.getBarMember.id);
        console.log('Deleted!');
      }
      this.setState({ deleting: false });
    } catch (error) {
      this.setState({ deleting: false });
      Alert.alert('Error', 'There was an error, please try again.', [{ text: 'OK' }], {
        cancelable: false,
      });
    }
  };

  renderItem = ({ item }) => {
    const { isVisible, deleting } = this.state;

    return (
      <UserBarsListItem
        item={item}
        deleteFavourite={this.deleteFavourite}
        openWebsiteLink={this.openWebsiteLink}
        toggleMapLinks={this.toggleMapLinks}
        openPhone={this.openPhone}
        isVisible={isVisible}
        deleting={deleting}
      />
    );
  };

  renderSeparator = () => (
    <View
      style={{
        backgroundColor: COLORS.DIVIDER_COLOR,
        height: StyleSheet.hairlineWidth,
      }}
    />
  );

  keyExtractor = item => item.id;

  refreshData = () => {
    const { refetch } = this.props;
    refetch();
  }

  render() {
    const { networkStatus, bars } = this.props;
    const {
      property, direction, options, selectedIndex,
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.flatListWrapper}>
          <FlatList
            data={orderData(bars, property, direction)}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            onRefresh={this.refreshData}
            refreshing={networkStatus === 4}
            ItemSeparatorComponent={this.renderSeparator}
            // initialNumToRender={20}
            // windowSize={3}
          />
        </View>
        <View style={styles.segmentedControlWrapper}>
          <SegmentedControlIOS
            values={options}
            tintColor={COLORS.DEFAULT_PRIMARY_COLOR}
            selectedIndex={selectedIndex}
            onChange={event => this.toggleBarSortOrder(event)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  details: {
    width: '90%',
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
  },
  phone: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
    color: COLORS.SECONDARY_TEXT_COLOR,
  },
  iconWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flatListWrapper: {
    flex: 1,
    marginBottom: 30,
  },
  segmentedControlWrapper: {
    backgroundColor: COLORS.TEXT_PRIMARY_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default compose(
  graphql(gql(GetUserBars), {
    options: ownProps => ({
      variables: {
        id: ownProps.userId,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }),
    props: ({ data }) => ({
      loading: data.loading,
      bars: data.getUser ? data.getUser.bars.items : [],
      refetch: data.refetch,
      networkStatus: data.networkStatus,
    }),
  }),
  graphql(gql(GetBarMember), {
    options: ownProps => ({
      variables: {
        userId: ownProps.userId,
        barId: ownProps.barId,
      },
      fetchPolicy: 'cache-and-network',
    }),
    props: ({ data }) => ({
      loading: data.loading,
      refetchBarMember: data.refetch,
      getBarMember: data.getBarMember ? data.getBarMember : null,
    }),
  }),
  graphql(gql(DeleteBarMember), {
    options: ownProps => ({
      refetchQueries: [
        {
          query: gql(GetUserBars),
          variables: {
            id: ownProps.userId,
          },
        },
      ],
      fetchPolicy: 'cache-and-network',
    }),
    props: ({ mutate }) => ({
      deleteBarMember: memberId => mutate({ variables: { id: memberId } }),
    }),
  }),
)(UserBarsList);
