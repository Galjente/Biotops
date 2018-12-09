"use strict";
import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import {Avatar} from 'react-native-elements';
import COMMON_STYLE from "../../Screen/CommonStyles/index";
import {APP_SETTINGS} from "../../settings";

export default class PlaceListItemView extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		let place = this.props.place;
		let imageVisible = !this.props.position && this.props.visited && place.previewImage;
		let distance = this.getDistance(parseInt(place.distance));
		return (
			<TouchableOpacity onPress={this.handlePlacePress.bind(this)}>
				<View style={COMMON_STYLE.listViewItemContainer}>
					{this.props.position && <Avatar medium rounded style={COMMON_STYLE.listViewItemImage} width={50} height={50} title={this.props.position} />}
					{imageVisible && <Avatar medium rounded containerStyle={COMMON_STYLE.listViewItemImage} source={{uri: APP_SETTINGS.serverUrl + place.previewImage}} />}
					<View style={COMMON_STYLE.listViewItemInfoContainer}>
						<View style={COMMON_STYLE.listViewItemInfoTextWrapper}>
							<Text style={COMMON_STYLE.listViewItemInfoText}>{place.name}</Text>
						</View>
						<Text style={COMMON_STYLE.listViewItemInfoSubText}>{place.region}</Text>
					</View>
					<View style={COMMON_STYLE.listViewItemIconContainer}>
						{!this.props.visited && <Image style={COMMON_STYLE.listViewItemIcon} source={require('./img/marker_icon_gray.png')}/>}
						{this.props.visited && <Image style={COMMON_STYLE.listViewItemIcon} source={require('./img/marker_icon_green.png')}/>}
						<Text>{distance}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

    handlePlacePress() {
        let place = this.props.place;
        if (this.props.onPress && place) {
            this.props.onPress(place.id);
        }
    }

    getDistance(distance) {
		if (isNaN(distance)) {
			return '';
		}
		if (distance < 100) {
			return distance + ' m';
		}

		return (distance / 1000).toFixed(1) + ' km';
    }
}
