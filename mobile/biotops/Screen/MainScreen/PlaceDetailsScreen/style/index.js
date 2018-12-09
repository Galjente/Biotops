'use strict';

import {StyleSheet} from 'react-native';

const PLACE_DETAILS_SCREEN_STYLE = StyleSheet.create({

	slider: {
        height: 200,
	},

    sliderImage: {
		width: '100%',
		height: 200,
	},

	backButton: {
		position: 'absolute',
		left: 2,
		top: 4,
	},

	placeDescriptionContainer: {
		marginTop: 25,
		marginLeft: 15,
		marginRight: 15,
	},

	placeName: {
		color: '#716f81',
		fontSize: 20,
		fontWeight: 'bold',
	},
	placeDescription: {
		marginTop: 5,
		color: '#716f81',
		fontSize: 15,
	},
});

export default PLACE_DETAILS_SCREEN_STYLE;