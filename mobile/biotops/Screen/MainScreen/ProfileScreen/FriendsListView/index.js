'use strict';
import React from 'react';
import {ScrollView, View, Text, ActivityIndicator} from 'react-native';
import COMMON_STYLE from "../../../CommonStyles/index";
import FriendListItem from "./FriendListItem";
import {APP_SETTINGS} from "../../../../settings";
import {AccessToken} from 'react-native-fbsdk';

export default class FriendsListView extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            friends: [],
        };
        this.onError = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout : () => {};
    }

    componentDidMount() {
        this.loadFriends();
    }

    render() {
        return (
            <View >
                <Text style={COMMON_STYLE.listViewTitle}>TAVI DRAUGI</Text>
                {this.state.loading && <ActivityIndicator size="large"/>}
                {this.state.friends.map((friend, index) => <FriendListItem key={index} friend={friend} onPress={this.props.onFriendPress}/>)}
            </View>
        );
    }

    reloadData() {
        this.loadFriends();
    }

    loadFriends() {
        if (this.state.loading) {
            return;
        }
        let self = this;
        this.setState({
            loading: true,
        });
        function processSuccessResponse(response) {
            response.json().then(
                (responseJson) => {
                    self.setState({
                        loading: false,
                        friends: responseJson,
                    });
                },
                (error) => {
                    self.setState({
                        loading: false,
                        friends: [],
                    });
                    self.onError(error);
                }
            ).catch((error) => {
                self.setState({
                    loading: false,
                    friends: [],
                });
                self.onError(error);
            });
        }

        AccessToken.getCurrentAccessToken()
            .then(
                (data) => {
                    fetch(`${APP_SETTINGS.serverUrl}/api/user/friends?token=${data.accessToken}`, {
                        method: 'GET',
                        headers: APP_SETTINGS.headers(this.props.jwtToken),
                        timeout: APP_SETTINGS.timeout,
                    }).then(
                        (response) => {
                            if (response.status === 200) {
                                processSuccessResponse(response);
                            } else if (response.status === 401) {
                                self.setState({
                                    loading: false,
                                    friends: [],
                                });
                                self.onLogout();
                            } else {
                                self.setState({
                                    loading: false,
                                    friends: [],
                                });
                            }
                        },
                        (error) => {
                            self.setState({
                                loading: false,
                                friends: [],
                            });
                            self.onError(error);
                        }
                    ).catch((error) => {
                        self.setState({
                            loading: false,
                            friends: [],
                        });
                        self.onError(error);
                    });
                },
                (error) => {
                    self.setState({
                        loading: false,
                        friends: [],
                    });
                    self.onError(error);
                }
            )
            .catch((error) => {
                self.setState({
                    loading: false,
                    friends: [],
                });
                self.onError(error);
            });
    }
}