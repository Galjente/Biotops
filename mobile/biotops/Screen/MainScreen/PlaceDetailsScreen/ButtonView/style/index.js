'use strict';

import {StyleSheet} from 'react-native';

const PLACE_DETAILS_BUTTON_STYLE = StyleSheet.create({

	buttonContainerImage: {
		height: 100,
		width: '100%',
		resizeMode: 'stretch',
	},

	buttonContainer: {
		width: '100%',
		backgroundColor: 'transparent',
		paddingLeft: 10,
		paddingRight: 10,
		flexDirection: 'row',
	},

	buttonLeftContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start',
	},

	buttonRightContainer: {
		alignItems: 'flex-end',
	},

	button: {
		marginTop: 10,
		marginRight: 5,
		minWidth: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonImage: {
		width: 50,
		height: 50,
	},

	distanceButton: {
		marginTop: 10,
	},

});

export default PLACE_DETAILS_BUTTON_STYLE;