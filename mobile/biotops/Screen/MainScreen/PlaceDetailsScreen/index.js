"use strict";
import React from 'react';
import {ActivityIndicator, ScrollView, Text, View, TouchableOpacity, Platform, Linking, Image} from 'react-native';
import {Icon} from 'react-native-elements'
import ImageSlider from 'react-native-image-slider';
import Swiper from 'react-native-swiper';
import geolib from 'geolib';
import ButtonView from "./ButtonView";
import {APP_SETTINGS} from "../../../settings";
import PLACE_DETAILS_SCREEN_STYLE from "./style/index";
import DEFAULT_API_SERVICE from "../../../ApiService";

export default class PlaceDetailsScreen extends React.Component {

	static CLASS_NAME = 'PlaceDetailsScreen';

	static navigationOptions = {
		title: 'Vieta',
		header: null,
	};

	constructor(props) {
		super(props);
		this.watchId = null;
		this.state = {
            loading: true,
            place: null,
            latitude: null,
            longitude: null,
        };
		this.jwtToken = this.props.screenProps.jwtToken ? this.props.screenProps.jwtToken : null;
		this.onLogout = this.props.screenProps.onLogout ? this.props.screenProps.onLogout : ()=>{};
		this.onError = this.props.screenProps.onError ? this.props.screenProps.onError : (error) => {};
	}

	componentDidMount() {
        const {state} = this.props.navigation;
        let place = this.state.place;
        let placeId = state.params.placeId;
		this.setState({
			loading: true,
		});
        if (!place || place.id != placeId) {
			this.loadData(placeId);
		}

        navigator.geolocation.getCurrentPosition(
            (position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;

                this.setState({
                    latitude: latitude,
                    longitude: longitude
                });
            },
            (error) => {
                this.onError(error, this.CLASS_NAME);
            }
        );

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                this.setState({
                    latitude: latitude,
                    longitude: longitude
				});
            },
            (error) => {
                this.onError(error, this.CLASS_NAME);
            },
            APP_SETTINGS.locationSettings
        );
	}

    componentWillUnmount() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }
    }

	render() {
		const {goBack} = this.props.navigation;

        let place = this.state.place;

		if (place) {
            let distance = parseInt(place.distance);
            let placeImages = [];

            if (place.images && place.images.length) {
                for (let i = 0; i < place.images.length; i++) {
                    placeImages.push(APP_SETTINGS.serverUrl + place.images[i].uri);
                }
            } else {
                placeImages.push(require('./img/temp.png'));
            }

            if (this.state.latitude && this.state.longitude) {
                try {
                    distance = geolib.getDistance(
                        {
                            latitude: this.state.latitude,
                            longitude: this.state.longitude
                        },
                        {
                            latitude: place.latitude,
                            longitude: place.longitude
                        }
                    );
                } catch (e) {
                    this.onError('Failed recalculate distance', this.CLASS_NAME);
                }
            }

            return (
				<View>
					<ScrollView pagingEnabled={false}>
						<Swiper style={PLACE_DETAILS_SCREEN_STYLE.slider} showsButtons={false}>
							{placeImages.map((imageUri, index) => {
								return (
									<View key={`v_${index}`}>
										<Image key={`i_${index}`} source={{uri: imageUri}} style={PLACE_DETAILS_SCREEN_STYLE.sliderImage} />
									</View>
								);
							})}
						</Swiper>
						<TouchableOpacity onPress={() => goBack()} style={PLACE_DETAILS_SCREEN_STYLE.backButton}>
							<Icon name="arrow-back" size={40} />
						</TouchableOpacity>
						<ButtonView placeId={place.id}
									visited={place.visited}
									placeName={place.name}
									placeImage={placeImages[0]}
									distance={distance}
									jwtToken={this.jwtToken}
									onError={this.onError}
									onBackToMapPress={this.handleBackToMapPress.bind(this)}
									onNavigatePress={this.handleNavigatePress.bind(this)}/>
						<View style={PLACE_DETAILS_SCREEN_STYLE.placeDescriptionContainer}>
							<Text style={PLACE_DETAILS_SCREEN_STYLE.placeName}>{place.name}</Text>
							<Text style={PLACE_DETAILS_SCREEN_STYLE.placeDescription}>{place.shortDescription}</Text>
							<Text style={PLACE_DETAILS_SCREEN_STYLE.placeDescription}>{place.description}</Text>
						</View>
					</ScrollView>
				</View>
            );
		} else {
            return (
				<View style={{flex:1, justifyContent: 'center', alignItems: 'center',}}>
					<ActivityIndicator size="large"/>
					<TouchableOpacity onPress={() => goBack()} style={PLACE_DETAILS_SCREEN_STYLE.backButton}>
						<Icon name="arrow-back" size={40} />
					</TouchableOpacity>
				</View>
            );
		}
	}

	loadData(placeId) {
		let self = this;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let latitude = position.coords.latitude;
				let longitude = position.coords.longitude;

				self.loadPlaceByIdAndCoordinates(placeId, latitude, longitude);
			},
			(error) => {
				self.loadPlaceByIdAndCoordinates(placeId, null, null);
				self.onError(error, self.CLASS_NAME);
			}
		);
	}

	loadPlaceByIdAndCoordinates(placeId, latitude, longitude) {
		let self = this;
        DEFAULT_API_SERVICE.getPlaceByIdAndCoordinates(self.jwtToken, () => {self.onLogout();}, placeId, latitude, longitude)
			.then(
				(json) => {
                    self.setState({
                        loading: false,
                        place: json,
                    });
				},
                (error) => {
                    self.setState({
                        loading: false,
                        place: null,
                    });
                    self.onError(error, self.CLASS_NAME);
                }
			).catch((error) => {
				self.setState({
					loading: false,
					place: null,
				});
				self.onError(error, self.CLASS_NAME);
			});
	}

    handleBackToMapPress() {
        const {navigate} = this.props.navigation;
        navigate('Home', {
        	tabName: 'Map'
		});
	}

    handleNavigatePress() {
        let place = this.state.place;
		let navigationUrl = `http://maps.apple.com/?daddr=${place.latitude},${place.longitude}`;
		if (Platform.OS === 'android') {
            navigationUrl = `google.navigation:q=${place.address}`;
		}

        Linking.openURL(navigationUrl)
			.then(
				() => {},
                (error) => {
					this.onError(error, this.CLASS_NAME);
                }
			)
			.catch(
				(error) => {
					this.onError(error, this.CLASS_NAME);
				}
			);
	}
}