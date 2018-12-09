'use strict';
import {StyleSheet} from 'react-native';

const COMMON_STYLE = StyleSheet.create({

	mainContainer: {
		flex: 1,
		backgroundColor: '#FFF',
	},

	container: {
		flex: 1,
		backgroundColor: '#FFF',
	},

	containerHeaderTitle: {
		textAlign: 'center',
		fontSize: 18,
		marginTop: 8,
		color: '#9b99a9',
		fontWeight: 'bold',
	},

	menuBar: {
		paddingTop: 3,
		paddingBottom: 3,
		backgroundColor: '#FFF',
	},

	menuBarItem: {
		padding: 0,
	},

	menuBarItemIndicator: {
		backgroundColor: '#FFF',
		margin: 0,
		borderRadius: 0,
	},

	menuBarIcon: {
		width: 24,
		maxHeight: 24,
		resizeMode: 'stretch'
	},

    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },

    textWrapper: {
        flexDirection: 'row',
    },

	listView: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginTop: 15,
        minHeight: 50,
        alignItems: 'center',
	},

	listViewTitle: {
        color: '#9b99a9',
        textAlign: 'center',
        marginTop: 5,
        paddingBottom: 10,
	},

    listViewEmptyText: {
        color: '#9b99a9',
        paddingTop: 5,
        textAlign: 'center',
    },

    listViewItemContainer: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 3,
        marginBottom: 3,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
	},

    listViewItemImage: {
        marginRight: 10,
    },

	listViewItemInfoContainer: {
		flex: 1,
	},

    listViewItemInfoTextWrapper: {
        flexDirection: 'row',
	},

    listViewItemInfoText: {
        fontSize: 18,
        flexGrow: 1,
        flex: 1,
	},

    listViewItemInfoSubText: {
        color: '#8a8fab',
        fontSize: 14,
	},

    listViewItemIconContainer: {
        alignItems: 'center',
	},

    listViewItemIcon: {
        width: 25,
	},

});

export default COMMON_STYLE;