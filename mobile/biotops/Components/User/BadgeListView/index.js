"use strict";
import React from 'react';
import {Text, View, ActivityIndicator} from 'react-native';
import BadgeItem from "./BadgeItem";
import BadgeModal from "./BadgeModal";
import BADGE_VIEW_STYLE from "./style/index";
import DEFAULT_API_SERVICE from "../../../ApiService";
import COMMON_STYLE from "../../../Screen/CommonStyles/index";

export default class BadgeListView extends React.PureComponent {

    static CLASS_NAME = 'BadgeListView';

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            badges: [],
	        achievedCount: 0,
            modalVisible: true,
        };

        this.userId = this.props.userId ? this.props.userId : null;
        this.onError = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout : () => {};
    }

    componentWillMount() {
    	this.loadBadges();
	}

    render() {
        return (
            <View style={COMMON_STYLE.listView}>
                {!this.state.loading && this.state.badges.length > 0 && <Text style={COMMON_STYLE.listViewTitle}>{this.state.achievedCount} NO {this.state.badges.length} TITULIEM</Text>}
				{this.state.loading && <ActivityIndicator size="large"/>}
                <View style={BADGE_VIEW_STYLE.badgeContainer}>
                    {this.state.badges.map((badge, index) => (
                    	<BadgeItem key={index}
							   badge={badge}
							   onPress={this.handleShowModal.bind(this, badge)}/>
					))}
                </View>
                {!this.state.loading && this.state.badges.length == 0 && <Text style={COMMON_STYLE.listViewEmptyText}>Nav titulus</Text>}

                <View style={BADGE_VIEW_STYLE.badgeModal}>
					<BadgeModal ref="badgeModal"
                                onError={this.onError}/>
				</View>
            </View>
        );
    }

    handleShowModal(badge) {
    	if (!this.props.disableModal) {
		    this.refs.badgeModal.showModal(badge);
	    }
	}

    reloadData() {
    	if (!this.state.loading) {
            this.loadBadges();
        }
	}

	loadBadges() {
    	let self = this;
    	this.setState({
			loading: true,
		});

        DEFAULT_API_SERVICE.getBadgeds(this.userId, this.props.jwtToken, () => {self.onLogout();})
            .then(
                (json) => {
                    self.setState({
                        loading: false,
                        badges: json.badges,
                        achievedCount: json.achievedCount
                    });
                },
                (error) => {
                    self.setState({
                        loading: false,
                        badges: [],
                        achievedCount: 0,
                    });
                    self.onError(error, this.CLASS_NAME);
                }
            ).catch((error) => {
                self.setState({
                    loading: false,
                    badges: [],
                    achievedCount: 0,
                });
                self.onError(error, this.CLASS_NAME);
            });
	}
}
