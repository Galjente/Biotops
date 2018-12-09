"use strict";
import React from 'react';
import {View, Image} from 'react-native';
import { ShareDialog } from 'react-native-fbsdk';
import {APP_SETTINGS} from "../../../../settings";
import DistanceButtonView from "../DistanceButtonView";
import LoadingButton from "../../../../Components/LoadingButton/index";
import PLACE_DETAILS_BUTTON_STYLE from "./style/index";

export default class ButtonView extends React.PureComponent {

	static CLASS_NAME = 'ButtonView';

	constructor(props) {
		super(props);
		this.state = {
			loadingRegistration: false,
			loadingSharing: false,
			visited: this.props.visited,
		};
	}

	render() {
	    let registrationButtonInactive = this.state.visited || this.props.distance > 50;
		return (
			<Image source={require('./img/whiteSquareShdw.png')} style={PLACE_DETAILS_BUTTON_STYLE.buttonContainerImage}>
				<View style={PLACE_DETAILS_BUTTON_STYLE.buttonContainer}>
					<View style={PLACE_DETAILS_BUTTON_STYLE.buttonLeftContainer}>
						<LoadingButton onPress={this.onCheckInPress.bind(this)}
									   disabled={registrationButtonInactive}
									   buttonText="Reģistrēties"
									   buttonImage={registrationButtonInactive ? require('./img/disabled_checkin_icon.png') : require('./img/checkin_icon.png')}
									   buttonLoaderStyle={PLACE_DETAILS_BUTTON_STYLE.button}
									   buttonStyle={PLACE_DETAILS_BUTTON_STYLE.button}
									   buttonImageStyle={PLACE_DETAILS_BUTTON_STYLE.buttonImage}
									   loading={this.state.loadingRegistration}/>

						<LoadingButton onPress={this.onFacebookSharePress.bind(this)}
									   buttonText="Dalies"
									   buttonImage={require('./img/facebook_icon.png')}
									   buttonLoaderStyle={PLACE_DETAILS_BUTTON_STYLE.button}
									   buttonStyle={PLACE_DETAILS_BUTTON_STYLE.button}
									   buttonImageStyle={PLACE_DETAILS_BUTTON_STYLE.buttonImage}
									   loading={this.state.loadingSharing}/>
					</View>
					<View style={PLACE_DETAILS_BUTTON_STYLE.buttonRightContainer}>
						<DistanceButtonView style={PLACE_DETAILS_BUTTON_STYLE.distanceButton}
											distance={this.props.distance}
											onBackToMapPress={this.props.onBackToMapPress}
											onNavigatePress={this.props.onNavigatePress}/>
					</View>
				</View>
			</Image>
		);
	}

    onFacebookSharePress() {
	    let shareContent = {
            contentType: 'photo',
            photos: [
                {
                    userGenerated: false,
                    imageUrl: this.props.placeImage
                }
            ]
        };
        ShareDialog.canShow(shareContent).then(
            (canShow) => {
                if (canShow) {
                    return ShareDialog.show(shareContent);
                }
            }
        ).then(
            (result) => {
                if (result.isCancelled) {
                    this.onError('Dališana atcelta', this.CLASS_NAME);
                }
            },
            (error) => {
                this.onError('Dališana atcelta: ' + error, this.CLASS_NAME);
            }
        );
    }

    onCheckInPress() {
        if (this.state.visited) {
            return;
        }

        let self = this;
        this.setState({
            loadingRegistration: true
        });

        function processSuccessResponse(response) {
            response.json().then(
                (responseJson) => {
                	console.log(responseJson);
                    self.setState({
                        loadingRegistration: false,
                        visited: true,
                    });
                },
                (error) => {
                    self.onError(error);
                }
            )
                .catch((error) => {
                    self.onError(error);
                });
        }

        navigator.geolocation.getCurrentPosition((position) => {
            fetch(`${APP_SETTINGS.serverUrl}/api/place/checkin`, {
                method: 'POST',
                headers: APP_SETTINGS.headers(this.props.jwtToken),
                body: JSON.stringify({
                    placeId: self.props.placeId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            }).then((response) => {
                if (response.status === 200) {
                    processSuccessResponse(response);
                } else if (response.status === 401) {
                    self.onLogout();
                } else if (response.status === 404) {
	                self.setState({
		                loadingRegistration: false,
	                });
	                self.onError('Vieta parak talu');
                } else {
                    self.setState({
                        loadingRegistration: false,
                    });
                }
            }).catch((error) => {
                self.onError(error);
            });
        }, (error) => {
        	self.onError(error);
        });
    }

    onError(error) {
		console.log(error);
		if (this.props.onError) {
            this.props.onError(error, this.CLASS_NAME);
        }
        this.setState({
            loadingRegistration: false,
        });
	}

    onLogout() {
		if (this.props.onLogout) {
            this.props.onLogout();
		}
        this.setState({
            loadingRegistration: false,
        });
	}
}