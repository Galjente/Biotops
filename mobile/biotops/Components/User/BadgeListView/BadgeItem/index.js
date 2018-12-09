"use strict";
import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {APP_SETTINGS} from "../../../../settings";

const styles = StyleSheet.create({
    badgeContainer: {
        width: 50,
        margin: 5,
    },

    badgeImage: {
        width: 50,
        height: 50,
    },

    badgeName: {
        fontSize: 10,
        textAlign: 'center',
    },
});

export default class BadgeItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let badge = this.props.badge;
        return (
            <View style={styles.badgeContainer}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <Image style={styles.badgeImage} source={{uri: APP_SETTINGS.serverUrl + badge.imageUrl}}/>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}