'use strict';

import React from 'react';
import {StyleSheet, View, Text, Image, Platform, Linking, TouchableOpacity, WebView} from 'react-native';
import {Icon} from 'react-native-elements';
import {APP_SETTINGS} from "../../settings";

export default class WebViewScreen extends React.Component {

    render() {
        const {state, goBack} = this.props.navigation;
        if (!state.params.url) {
            goBack();
        }
        return (
            <WebView source={{uri: state.params.url}}
                     onError={this.props.onError}/>
        );
    }
}