"use strict";
import React from 'react';
import MapView from 'react-native-maps';
import {View, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import {APP_SETTINGS} from "../../../../settings";
import MAP_STYLE from "../style/index";
import PlaceMarkerView from "./PlaceMarkerView/index";

export default class MapTab extends React.PureComponent {

    static CLASS_NAME = 'MapTab';

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            region: {
                latitude: 56.9715833,
                longitude: 23.9890813,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            currentPosition: null,
        };

        this.watchId = null;
        this.follow = true;
        this.onError = this.props.onError ? this.props.onError : (error) => {};
    }

	componentDidMount() {
		let self = this;
		this.watchId = navigator.geolocation.watchPosition(
			(position) => {
				let latitude = position.coords.latitude;
				let longitude = position.coords.longitude;
				self.updateLocation(latitude, longitude);
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

    render() {
        return (
            <View style={MAP_STYLE.mapContainer}>
                <MapView.Animated tabLabel="Map"
                         style={MAP_STYLE.map}
                         showsUserLocation={false}
                         followUserLocation={false}
                         showsMyLocationButton={false}
                         toolbarEnabled={false}
                         loadingEnabled={true}
                         region={this.state.region}
                         onPanDrag={this.handlePanDrag.bind(this)}>
                    {this.props.placesState.map((place, index) => (
                        <MapView.Marker key={`marker_${index}`}
                                        coordinate={{latitude: place.latitude, longitude: place.longitude}}
                                        image={require('./img/map_pin.png')}>

                            <PlaceMarkerView place={place}
                                             onPress={this.props.onPlaceOpenPress} />
                        </MapView.Marker>
                    ))}
                    {this.state.currentPosition &&
                        <MapView.Marker coordinate={this.state.currentPosition}
                                        image={require('./img/poiner_map.png')}>
                            {/*<Image source={require('./img/poiner_map.png')} style={{width: markerImageWidth, height: markerImageWidth}}/>*/}
                        </MapView.Marker>
                    }
                </MapView.Animated>
                <TouchableOpacity onPress={this.handleCurrentLocationPress.bind(this)} style={MAP_STYLE.mapCurrentPositionButton}>
                    <Image source={require('./img/current_position_map.png')} style={MAP_STYLE.mapCurrentPositionButtonImage}/>
                </TouchableOpacity>
            </View>
        );
    }

    handleCurrentLocationPress() {
        if (!this.follow && this.state.currentPosition) {
	        this.setState({
                region: {
                    latitude: this.state.currentPosition.latitude,
                    longitude: this.state.currentPosition.longitude,
                    latitudeDelta: this.state.region.latitudeDelta,
                    longitudeDelta: this.state.region.longitudeDelta,
                }
            });
            this.follow = true;
        }
    }

    reloadData() {}

    handlePanDrag() {
        if (this.follow) {
            this.follow = false;
        }
    }

    updateLocation(latitude, longitude) {
        this.setState({
            currentPosition: {
                latitude: latitude,
                longitude: longitude,
            }
        });


	    if (this.follow || !this.state.region.latitude || !this.state.region.longitude) {
            this.setState({
                region: {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: this.state.region.latitudeDelta,
                    longitudeDelta: this.state.region.longitudeDelta,
                }
            });
	    }

    }
}