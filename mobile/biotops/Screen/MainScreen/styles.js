"use strict";
import {Platform, StatusBar, StyleSheet, PixelRatio} from 'react-native';

export default StyleSheet.create({
    headline: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 5,
        color: '#9b99a9',
        fontWeight: 'bold',
    },

    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    page: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tab: {
        padding: 0,
    },
    tabBar: {
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    labelStyle: {
        color: '#9b99a9',
        fontSize: PixelRatio.getPixelSizeForLayoutSize(7),
    },
    activeLabelStyle: {
        color: '#50e3c2',
    },
    inactiveLabelStyle: {
        color: '#9b99a9',
    },
    indicator: {
        flex: 1,
        backgroundColor: '#50e3c2',
        margin: 4,
        borderRadius: 2,
    },
    sectionHeader: {
        textAlign: 'center',
        fontSize: 22,
        marginTop: 15,
        color: '#9b99a9',
    },
});