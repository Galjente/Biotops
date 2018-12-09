'use strict';
import {StyleSheet} from 'react-native';

const ERROR_VIEW_STYLE = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },

    errorMessageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#7a0d0d',
        minHeight: 40,
        paddingLeft: 15,
        paddingRight: 15,
    },

    errorMessageButtonContainer: {
        width: '100%',
        flexDirection: 'row',
    },

    errorMessageSadFace: {
        width: 20,
        height: 20,
        marginRight: 6,
    },

    errorMessageText: {
        color: '#f29898',
    },
});

export default ERROR_VIEW_STYLE;