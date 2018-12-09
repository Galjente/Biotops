'use strict';

import {StyleSheet} from 'react-native';

const PLACE_DETAILS_DISTANCE_BUTTON_STYLE = StyleSheet.create({

	distanceWrapper: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},

	navigationWrapper: {
		flex: 1,
		flexDirection: 'row',
	},

	title: {
		color: '#9b99a9',
		fontSize: 14,
	},

	navigationTitle: {
		fontSize: 18,
	},

	mapTitle: {
		marginBottom: 3,
	},

	buttonText: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderRadius: 5,
		fontSize: 14,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 1,
		paddingBottom: 1,
		paddingLeft: 15,
		paddingRight: 15,
	},

	mapButtonText: {
		borderColor: '#9b99a9',
	},

	navigateButtonText: {
		borderColor: '#00ca9d'
	},
});

export default PLACE_DETAILS_DISTANCE_BUTTON_STYLE;