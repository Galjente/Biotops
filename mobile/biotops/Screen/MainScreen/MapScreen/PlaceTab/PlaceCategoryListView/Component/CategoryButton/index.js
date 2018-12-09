"use strict";
import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';
import {APP_SETTINGS} from "../../../../../../../settings";

const styles = StyleSheet.create({
    placeCategoryButton: {
        backgroundColor: 'transparent',
        marginLeft: 3,
        marginRight: 3,
    },
    placeCategoryButtonIcon: {
        width: 45,
        height: 45,
        margin: 5,
        resizeMode: 'contain',
    },
    buttonPressed: {
        backgroundColor: '#5f5d70',
    },
    buttonReleased: {
        backgroundColor: '#f6f6f9'
    }
});

export default class CategoryButton extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            pressed: false
        };
    }

    render() {
        let category = this.props.category;
        return (
            <TouchableOpacity
                    style={[styles.placeCategoryButton, this.state.pressed ? styles.buttonPressed : styles.buttonReleased]}
                    onPress={this.handleButtonPress.bind(this)}>
                <Image source={{uri: APP_SETTINGS.serverUrl + category.uri}} style={[styles.placeCategoryButtonIcon, this.state.pressed ? {tintColor: '#FFF'} : null]}/>
            </TouchableOpacity>
        );
    }

    handleButtonPress() {
        let category = this.props.category;
        this.setState({
            pressed: !this.state.pressed
        });
        if (this.props.onPress) {
            this.props.onPress(category.id, !this.state.pressed);
        }
    }

    isPresses() {
        return this.state.pressed;
    }
}