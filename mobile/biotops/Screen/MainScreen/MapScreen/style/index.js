'use strict';
import {StyleSheet} from 'react-native';

const MAP_STYLE = StyleSheet.create({

	searchContainer: {
		backgroundColor: '#FFF',
		borderBottomWidth: 0,
		borderTopWidth: 0,
	},

	searchInput: {
		fontSize: 16,
		backgroundColor: '#FFF',
		color: '#000',
		borderColor: '#86939e',
		borderStyle: 'solid',
		borderWidth: 1,
		padding: 0,
	},

	menuBarIndicator: {
		backgroundColor: '#50e3c2',
		margin: 4,
		borderRadius: 2,
	},

	menuBarIndicatorItem: {
		fontSize: 15,
	},

	menuBarInactiveIndicatorItem: {
		color: '#9b99a9',
	},

	menuBarActiveIndicatorItem: {
		color: '#50e3c2',
	},

	mapContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},

	map: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},

	mapCurrentPositionButton: {
		position: 'absolute',
		right: 8,
		bottom: 8,
	},

	mapCurrentPositionButtonImage: {
		width: 60,
		height: 60,
	},
});

export default MAP_STYLE;