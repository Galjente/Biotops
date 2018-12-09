'use strict';
import {StyleSheet} from 'react-native';

const USER_INFO_VIEW_STYLE = StyleSheet.create({

    friendContainer: {
        backgroundColor: '#5f5d70',
    },

    containerHeaderTitle: {
        color: '#FFF',
        backgroundColor: 'transparent',
    },

    infoContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        marginBottom: 10,
    },

    avatar: {
        marginTop: 60,
        marginLeft: 15,
        marginRight: 15,
        width: 80,
        height: 80
    },

    contactInformation: {
        flex: 1,
    },

    logoutButtonWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 20,
        marginBottom: 10,
    },

    logoutButton: {
        backgroundColor: 'transparent',
        borderColor: '#50e3c2',
        borderWidth: 2,
        borderRadius: 10,
    },

    logoutButtonText: {
        color: '#50e3c2',
        fontSize: 15,
        fontWeight: 'bold',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 3,
        paddingBottom: 3,
    },

    textWrapContainer: {
        flexDirection: 'row',
        marginTop: 2,
    },

    nameSurname: {
        backgroundColor: 'transparent',
        color: '#FFF',
        fontSize: 20,
        flexGrow: 1,
        flex: 1,
    },

    top: {
        marginTop: 8,
        backgroundColor: 'transparent',
        color: '#50e3c2',
        fontSize: 16,
        flexGrow: 1,
        flex: 1,
        paddingBottom: 15,
    }
});

export default USER_INFO_VIEW_STYLE;