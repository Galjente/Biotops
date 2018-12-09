'use strict';
import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import ERROR_VIEW_STYLE from "../styles/index";

export default class ErrorMessageView extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={ERROR_VIEW_STYLE.errorMessageContainer}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <View style={ERROR_VIEW_STYLE.errorMessageButtonContainer}>
                        <Image source={require('../img/sadFace.png')} style={ERROR_VIEW_STYLE.errorMessageSadFace}/>
                        <View>
                            <Text style={ERROR_VIEW_STYLE.errorMessageText} numberOfLines={4}>{this.props.message}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
}