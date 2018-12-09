"use strict";
import React from 'react';
import {Text, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import {APP_SETTINGS} from "../../../settings";
import HOME_SCREEN_STYLE from "./style";
import COMMON_STYLE from "../../CommonStyles";
import DEFAULT_API_SERVICE from "../../../ApiService";

const ENABLED_BUTTON_IMAGE = require('./img/enabled_checkIn.png');
const DISABLED_BUTTON_IMAGE = require('./img/disabled_checkIn.png');
const NOT_ALLOW_REGISTRATION = '\u004c\u0061\u0069 \u0072\u0065\u0067\u0327\u0069\u0073\u0074\u0072\u0065\u0304\u0074\u006f\u0073 \u006a\u0061\u0304\u0061\u0074\u0072\u006f\u0064\u0061\u0073 \u0064\u0061\u0062\u0061\u0073 \u006f\u0062\u006a\u0065\u006b\u0074\u0061 \u0074\u0075\u0076\u0075\u006d\u0061\u0304';
const ALLOW_REGISTRATION = '\u0052\u0065\u0067\u0327\u0069\u0073\u0074\u0072\u0065\u0304\u0074\u0069\u0065\u0073';
const ALREDY_REGISTRATED = '\u0052\u0065\u0067\u0327\u0069\u0073\u0074\u0072\u0065\u0304\u0074\u0069\u0065\u0073';

export default class HomeScreen extends React.Component {

	static CLASS_NAME = 'HomeScreen';

    constructor(props) {
        super(props);
        this.watchId = null;
        this.state = {
            checkInButtonStyle: {},
            descriptionStatus: HOME_SCREEN_STYLE.buttonCheckInDescriptionTextInactive,
            locationText: null,
            buttonImage: null,
            place: null,
        };

        this.onError = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout : () => {};
    }

    render() {
    	let locationText = this.state.locationText;
        return (
			<View style={COMMON_STYLE.container}>
				<View style={HOME_SCREEN_STYLE.headerContainer} onLayout={(event) => {this.setCheckInButtonPosition(event.nativeEvent.layout)}}>
					<Image source={require('./img/shutterstock163726139.png')} style={HOME_SCREEN_STYLE.headerBackgroundImage}>
						<View style={HOME_SCREEN_STYLE.headerLogoContainer}>
							<Image source={require('../../img/logo.png')} style={HOME_SCREEN_STYLE.headerLogo}/>
						</View>
					</Image>
				</View>
				<View style={HOME_SCREEN_STYLE.mainContainer}>
					<ScrollView style={HOME_SCREEN_STYLE.buttonContainer}>
						<Image source={require('./img/whiteSquareShdw.png')} style={HOME_SCREEN_STYLE.buttonContainerShadow}>
                            {locationText && <Text style={[HOME_SCREEN_STYLE.buttonCheckInDescriptionText, this.state.descriptionStatus]}>{locationText}</Text>}
						</Image>
						<TouchableOpacity style={HOME_SCREEN_STYLE.button} onPress={this.props.onPlacePress}>
							<Text style={HOME_SCREEN_STYLE.buttonText}>VIETAS</Text>
						</TouchableOpacity>
						<TouchableOpacity style={HOME_SCREEN_STYLE.button} onPress={this.props.onTopPress}>
							<Text style={HOME_SCREEN_STYLE.buttonText}>TOPS</Text>
						</TouchableOpacity>
						<TouchableOpacity style={HOME_SCREEN_STYLE.button} onPress={this.props.onProfilePress}>
							<Text style={HOME_SCREEN_STYLE.buttonText}>PROFILS</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
				<TouchableOpacity ref="checkInButton"
								  disabled={locationText !== ALLOW_REGISTRATION}
								  style={[HOME_SCREEN_STYLE.buttonCheckIn, this.state.checkInButtonStyle]}
								  onPress={this.onCheckInButtonPress.bind(this)}>
                    {this.state.buttonImage && <Image style={HOME_SCREEN_STYLE.buttonCheckInImage} source={this.state.buttonImage}/>}
				</TouchableOpacity>
			</View>
        );
    }

    componentDidMount() {
        let self = this;
        this.reloadData();
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                self.getPlaceByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                self.onError(error, self.CLASS_NAME);
            },
            APP_SETTINGS.locationSettings
        );
    }

    componentWillUnmount() {
    	if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }

    onCheckInButtonPress() {
    	if (this.state.place) {
            this.props.onPlaceOpenPress(this.state.place.id);
		}
    }

    setCheckInButtonPosition(event) {
        this.setState({
            checkInButtonStyle: {
                top: event.height - 110,
                left: event.width / 2 - 65,
            },
	        descriptionStatus: HOME_SCREEN_STYLE.buttonCheckInDescriptionTextInactive,
	        locationText: NOT_ALLOW_REGISTRATION,
	        buttonImage: DISABLED_BUTTON_IMAGE,
        });
    }

    reloadData() {
        let self = this;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                self.getPlaceByCoordinates(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                self.onError(error, self.CLASS_NAME);
            },
            APP_SETTINGS.locationSettings
        );
    }

    getPlaceByCoordinates(latitude, longitude) {
        let self = this;

        DEFAULT_API_SERVICE.getPlaceByCoordinates(this.props.jwtToken, () => {self.onLogout();}, latitude, longitude)
			.then(
				(json) => {
                    if (json.visited) {
                        self.setCheckInButtonVisited();
                    } else {
                        self.setCheckInButtonActive(json);
                    }
				},
                (error) => {
                    self.onError(error, self.CLASS_NAME);
                    self.setCheckInButtonInactive();
                }
			).catch((error) => {
                self.onError(error, self.CLASS_NAME);
                self.setCheckInButtonInactive();
            });
    }

    setCheckInButtonActive(place) {
	    this.setState({
		    buttonImage: ENABLED_BUTTON_IMAGE,
		    locationText: ALLOW_REGISTRATION,
		    place: place,
		    descriptionStatus: HOME_SCREEN_STYLE.buttonCheckInDescriptionTextActive,
	    });
    }

	setCheckInButtonVisited() {
		this.setState({
			buttonImage: DISABLED_BUTTON_IMAGE,
			locationText: ALREDY_REGISTRATED,
			place: null,
			descriptionStatus: HOME_SCREEN_STYLE.buttonCheckInDescriptionTextInactive,
		});
	}

	setCheckInButtonInactive() {
		this.setState({
			buttonImage: DISABLED_BUTTON_IMAGE,
			locationText: NOT_ALLOW_REGISTRATION,
			place: null,
			descriptionStatus: HOME_SCREEN_STYLE.buttonCheckInDescriptionTextInactive,
		});
	}
}