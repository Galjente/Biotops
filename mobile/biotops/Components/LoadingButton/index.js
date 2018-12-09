"use strict";
import React from 'react';
import {View, Text, Image, TouchableOpacity, ActivityIndicator} from 'react-native';

export default class LoadingButton extends React.PureComponent {

    constructor(props) {
        super(props);
        if (!this.props.buttonText && !this.props.buttonImage) {
            throw new Error('You should provide at lease text or image');
        }
    }

    render() {
        if (this.props.loading) {
            return (
                <View style={this.props.style}>
                    <ActivityIndicator style={this.props.buttonLoaderStyle} size="large" />
                </View>
            );
        }

        return (
            <View style={this.props.style}>
                <TouchableOpacity style={this.props.buttonStyle} onPress={this.props.onPress} disabled={this.props.disabled}>
                    <Image style={this.props.buttonImageStyle} source={this.props.buttonImage}/>
                    {this.props.buttonText && <Text style={this.props.buttonTextStyle}>{this.props.buttonText}</Text>}
                </TouchableOpacity>
            </View>
        );
    }
}