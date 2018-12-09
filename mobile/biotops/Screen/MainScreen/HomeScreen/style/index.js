'use strict';

import {StyleSheet} from 'react-native';

const HOME_SCREEN_STYLE = StyleSheet.create({
	headerContainer: {
		height: '50%',
	},

	headerBackgroundImage: {
		maxWidth: '100%',
		height: '100%',
	},

	headerLogoContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		paddingTop: 50,
	},

	headerLogo: {
		width: '80%',
		height: 100,
		resizeMode: 'contain',
	},

	mainContainer: {
		flex: 1,
		backgroundColor: '#FFF',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonContainer: {
		marginTop: 10,
		paddingLeft: 20,
		paddingRight: 20,
		width: '100%',
	},

	buttonContainerShadow: {
		marginBottom: 15,
		height: 70,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		resizeMode: 'contain',
	},

	button: {
		backgroundColor: 'transparent',
		borderColor: '#50e3c2',
		borderWidth: 2,
		borderRadius: 10,
		marginTop: 10,
		height: 45,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonText: {
		color: '#9b99a9',
		fontSize: 15,
		fontWeight: 'bold',
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 3,
		paddingBottom: 3,
		textAlign: "center",
	},

	buttonCheckIn: {
		position: 'absolute',
	},

	buttonCheckInImage: {
		width: 130,
		height: 130
	},

	buttonCheckInDescriptionText: {
		fontSize: 16,
		textAlign: "center",
	},

	buttonCheckInDescriptionTextActive: {
		color: '#00ca9d',
	},

	buttonCheckInDescriptionTextInactive: {
		color: '#DDD',
	},
});

export default HOME_SCREEN_STYLE;