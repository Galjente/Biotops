"use strict";
import React from 'react';
import {StyleSheet, Text, View, Button, PixelRatio, Platform, StatusBar, Image, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {StackNavigator, TabNavigator} from 'react-navigation';
import {Icon} from 'react-native-elements'
import PLACE_DETAILS_DISTANCE_BUTTON_STYLE from "./style/index";

export default class DistanceButtonView extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.distance || this.props.distance <= 50) {
            return (
                <View style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.distanceWrapper, this.props.style]}>
                    <Text style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.title, PLACE_DETAILS_DISTANCE_BUTTON_STYLE.mapTitle]}>Citas vietas tuvumā</Text>
                    <TouchableOpacity onPress={this.props.onBackToMapPress}>
                        <Text style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.buttonText, PLACE_DETAILS_DISTANCE_BUTTON_STYLE.mapButtonText]}>Karte</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        let distanceText = '';
        if (this.props.distance > 1000) {
            distanceText = (this.props.distance / 1000).toFixed(1) + ' km';
        } else {
            distanceText = this.props.distance + ' m'
        }

        return (
            <View style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.distanceWrapper, this.props.style]}>
                <Text style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.title, PLACE_DETAILS_DISTANCE_BUTTON_STYLE.navigationTitle]}>{distanceText}</Text>
                <View style={PLACE_DETAILS_DISTANCE_BUTTON_STYLE.navigationWrapper}>
                    <Icon name="navigation" color="#9b99a9" size={13}/>
                    <Text style={PLACE_DETAILS_DISTANCE_BUTTON_STYLE.title}>Away</Text>
                </View>
                <TouchableOpacity onPress={this.props.onNavigatePress}>
                    <Text style={[PLACE_DETAILS_DISTANCE_BUTTON_STYLE.buttonText, PLACE_DETAILS_DISTANCE_BUTTON_STYLE.navigateButtonText]}>Navigācija</Text>
                </TouchableOpacity>
            </View>
        );
    }
}