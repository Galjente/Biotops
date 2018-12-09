"use strict";
import React from 'react';
import {ScrollView, View} from 'react-native';
import COMMON_STYLE from "../../CommonStyles";
import PROFILE_SCREEN_STYLE from "./style";
import FriendsListView from "./FriendsListView";
import BadgeListView from "../../../Components/User/BadgeListView";
import HistoryListView from "../../../Components/User/HistoryListView";
import UserInfoView from "../../../Components/User/UserInfoView";

export default class ProfileScreen extends React.PureComponent {

	constructor(props) {
		super(props);
		this.state = {
			loadingTopPlace: true,
			topPlace: 0
		};
	}

	render() {
		return (
			<View style={COMMON_STYLE.container}>
				<ScrollView style={PROFILE_SCREEN_STYLE.scrollContainer}>
					<UserInfoView ref="userInfoView"
					              onLogout={this.props.onLogout}
								  onError={this.props.onError}
								  jwtToken={this.props.jwtToken}
								  onGoBackPress={this.props.onGoBackPress}/>
					<BadgeListView ref="badgeView"
							   onLogout={this.props.onLogout}
							   onError={this.props.onError}
							   jwtToken={this.props.jwtToken}/>
					<HistoryListView ref="historyListView"
								 onLogout={this.props.onLogout}
								 onError={this.props.onError}
								 jwtToken={this.props.jwtToken}
								 onPlaceOpenPress={this.props.onPlaceOpenPress}/>
					<FriendsListView ref="friendsListView"
									 onFriendPress={this.props.onFriendPress}
									 onLogout={this.props.onLogout}
									 onError={this.props.onError}
									 jwtToken={this.props.jwtToken}/>
				</ScrollView>
			</View>
		);
	}

	reloadData() {
        this.refs.userInfoView.reloadData();
        this.refs.badgeView.reloadData();
        this.refs.historyListView.reloadData();
        this.refs.friendsListView.reloadData();
	}

}
