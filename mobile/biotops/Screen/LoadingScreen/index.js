"use strict";
import React from 'react';
import {Image, StyleSheet, Text, View, ActivityIndicator} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },

    footerContainer: {
        position: 'absolute',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        height: 100,
        bottom: 0,
        left: 0,
        right: 0,
    },

    backgroundImage: {
        width: '100%',
        flex: 1,
        resizeMode: 'cover',
    },

    logoImage: {
        width: '80%',
        resizeMode: 'contain',
    },

    logoText: {
        paddingTop: 50,
        backgroundColor: 'transparent',
        color: '#FFF',
        fontSize: 22,
    },

    topSponsorLine: {
        backgroundColor: '#9a9a9a',
        width: '100%',
        height: 1,
    },

    sponsorImage: {
        width: '100%',
        resizeMode: 'contain',
    },
});

export default class LoadingScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {

    }

    render() {
        return (
            <Image source={require('../img/background.png')} style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Image source={require('../img/logo.png')} style={styles.logoImage}/>
                    <Text style={styles.logoText}>Esi tuvāk Latvijas dabai</Text>
                    <ActivityIndicator size="large" color="#FFF"/>

                    <View style={styles.footerContainer}>
                        <View style={styles.topSponsorLine}/>
                        <Image source={require('../img/sponsor.png')} style={styles.sponsorImage}/>
                    </View>
                </View>
            </Image>
        );
    }
}