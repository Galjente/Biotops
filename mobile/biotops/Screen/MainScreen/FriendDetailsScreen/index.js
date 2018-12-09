"use strict";
import React from 'react';
import {ScrollView, View} from 'react-native';
import COMMON_STYLE from "../../CommonStyles";
import PROFILE_SCREEN_STYLE from "../ProfileScreen/style";
import BadgeListView from "../../../Components/User/BadgeListView";
import HistoryListView from "../../../Components/User/HistoryListView";
import UserInfoView from "../../../Components/User/UserInfoView/index";


export default class FriendDetailsScreen extends React.Component {

    static CLASS_NAME = 'FriendDetailsScreen';

    static navigationOptions = {
        title: 'Drauga profils',
        header: null,
    };

    constructor(props) {
        super(props);

        const {state} = this.props.navigation;

        this.jwtToken = this.props.screenProps.jwtToken ? this.props.screenProps.jwtToken : null;
        this.onLogout = this.props.screenProps.onLogout;
        this.onError = this.props.screenProps.onError;
        this.userId = state.params.friendId;
    }

	componentDidMount() {
    	this.refs.userInfoView.reloadData();
	}

    render() {
        const {goBack} = this.props.navigation;
        return (
            <View style={COMMON_STYLE.container}>
                <ScrollView style={PROFILE_SCREEN_STYLE.scrollContainer}>
                    <UserInfoView ref="userInfoView"
                                  userId={this.userId}
                                  onLogout={this.onLogout}
                                  onError={this.onError}
                                  jwtToken={this.jwtToken}
                                  onGoBackPress={() => {goBack()}}/>
                    <BadgeListView ref="badgeView"
                                   disableModal={true}
                                   userId={this.userId}
                                   onLogout={this.onLogout}
                                   onError={this.onError}
                                   jwtToken={this.jwtToken}/>
                    <HistoryListView ref="historyListView"
                                     userId={this.userId}
                                     onLogout={this.props.onLogout}
                                     onError={this.props.onError}
                                     jwtToken={this.props.jwtToken}
                                     onPlaceOpenPress={this.props.onPlaceOpenPress}/>
                </ScrollView>
            </View>
        );
    }
}