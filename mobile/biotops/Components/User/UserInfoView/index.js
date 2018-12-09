"use strict";
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';
import USER_INFO_VIEW_STYLE from "./style";
import COMMON_STYLE from "../../../Screen/CommonStyles/index";
import DEFAULT_API_SERVICE from "../../../ApiService";
import PLACE_DETAILS_SCREEN_STYLE from "../../../Screen/MainScreen/PlaceDetailsScreen/style/index";

export default class UserInfoView extends React.PureComponent {

	static CLASS_NAME = 'UserInfoView';

	constructor(props) {
		super(props);
		this.state = {
			loadingPlaceInTop: false,
			profileLoading: false,
			loading: true,
			place: '...',
            name: '',
            surname: '',
            imageUrl: null,
            imageTitle: '',
		};

		this.userId = this.props.userId ? this.props.userId : null;
		this.onError = this.props.onError;
        this.onLogout = this.props.onLogout;
	}

	componentDidMount() {
		this.loadUserProfile();
	}

	render() {
		let title = this.userId ? 'Drauga profils' : 'PROFILS';
		return (
			<View style={this.userId ? USER_INFO_VIEW_STYLE.friendContainer : null}>
				{!this.userId && <Image style={COMMON_STYLE.backgroundImage} source={require('./img/profile_bg_image.png')}/>}
				<Text style={[COMMON_STYLE.containerHeaderTitle, USER_INFO_VIEW_STYLE.containerHeaderTitle]}>{title}</Text>
				<View style={USER_INFO_VIEW_STYLE.infoContainer}>
					{this.state.imageUrl && <Avatar
						style={[USER_INFO_VIEW_STYLE.avatar, this.userId ? {marginTop: 30} : null]} large rounded
						source={{uri: this.state.imageUrl}}
						title={this.state.imageTitle}/>}
					<View style={[USER_INFO_VIEW_STYLE.contactInformation, this.userId ? {marginTop: 20} : null]}>
                        {!this.userId && <View style={USER_INFO_VIEW_STYLE.logoutButtonWrapper}>
							<TouchableOpacity style={USER_INFO_VIEW_STYLE.logoutButton} onPress={this.props.onLogout}>
								<Text style={USER_INFO_VIEW_STYLE.logoutButtonText}>Iziet</Text>
							</TouchableOpacity>
						</View>}
						<View style={USER_INFO_VIEW_STYLE.textWrapContainer}>
							<Text style={USER_INFO_VIEW_STYLE.nameSurname}>{this.state.name}</Text>
						</View>
						<View style={USER_INFO_VIEW_STYLE.textWrapContainer}>
							<Text style={USER_INFO_VIEW_STYLE.nameSurname}>{this.state.surname}</Text>
						</View>
						<View style={USER_INFO_VIEW_STYLE.textWrapContainer}>
							<Text style={USER_INFO_VIEW_STYLE.top}>DABAS TOPS vieta - {this.state.place}</Text>
						</View>
					</View>
				</View>
                {this.props.onGoBackPress && <TouchableOpacity onPress={this.props.onGoBackPress} style={PLACE_DETAILS_SCREEN_STYLE.backButton}>
					<Icon name="arrow-back" size={40} iconStyle={{color: 'white'}} />
				</TouchableOpacity>}
			</View>
		);
	}

    reloadData() {
		this.loadPlaceInTop();
	}

	loadUserProfile() {
		let self = this;
        if (this.state.profileLoading) {
            return;
        }
        this.setState({
            profileLoading: true,
        });
        DEFAULT_API_SERVICE.getUserProfile(this.userId, this.props.jwtToken, () => {self.onLogout()})
			.then(
				(json) => {
                    let imageTitle = '...';
                    if (json.name && json.surname) {
                        json.name[0] + json.surname[0];
                    }
                    self.setState({
                        profileLoading: false,
                        name: json.name,
                        surname: json.surname,
                        imageUrl: json.imageUrl,
                        imageTitle: imageTitle,
                    });
				},
                (error) => {
                    self.setState({
                        profileLoading: false,
                        name: '',
                        surname: '',
                        imageUrl: null,
                        imageTitle: '',
                    });
                    self.onError(error, self.CLASS_NAME);
                }
			)
			.catch((error) => {
                self.setState({
                    profileLoading: false,
                    name: '',
					surname: '',
                    imageUrl: null,
					imageTitle: '',
                });
                self.onError(error, self.CLASS_NAME);
            });
	}

	loadPlaceInTop() {
		let self = this;
		if (this.state.loadingPlaceInTop) {
			return;
		}
		this.setState({
            loadingPlaceInTop: true,
		});
        DEFAULT_API_SERVICE.getTopPosition(this.userId, this.props.jwtToken, () => {self.onLogout()})
			.then(
				(json) => {
                    self.setState({
                        loadingPlaceInTop: false,
                        place: json.position,
                    });
				},
                (error) => {
                    self.setState({
                        loadingPlaceInTop: false,
                        place: '...'
                    });
                    self.onError(error, self.CLASS_NAME);
                }
			)
			.catch((error) => {
                self.setState({
                    loadingPlaceInTop: false,
                    place: '...'
                });
                self.onError(error, self.CLASS_NAME);
            });
	}
}