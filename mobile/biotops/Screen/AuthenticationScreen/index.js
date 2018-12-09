"use strict";
import React from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity, Linking} from 'react-native';
import {Icon} from 'react-native-elements';
import {LoginManager, AccessToken} from 'react-native-fbsdk';

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
        bottom: 0,
        left: 0,
        right: 0,
    },

    footerButtonContainer: {
	    alignItems: 'center',
        backgroundColor: 'transparent',
		paddingBottom: 15,
	},

    agreementContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexGrow: 1,
        flex: 1,
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

    agreementText: {
        color: '#FFF',
		fontSize: 17,
		padding: 0,
		margin: 0,
	},
    agreementButton: {
        color: '#FFF',
        fontSize: 10,
	},

	facebookButtonWrapper: {
    	width: 200,
		padding:10,
		flexDirection: 'row',
		backgroundColor: "#3b5998"
	},

	facebookButtonText: {
		color: '#FFF',
	},
});

export default class AuthenticationScreen extends React.Component {

	static CLASS_NAME = 'AuthenticationScreen';

	static navigationOptions = {
		title: 'Login',
        header: null
	};

	constructor(props) {
		super(props);
		this.state = {
		    text: ''
        };

		this.onSuccessLogin = this.props.screenProps.onSuccessLogin ? this.props.screenProps.onSuccessLogin : (token) => {};
		this.onError = this.props.screenProps.onError ? this.props.screenProps.onError : (error) => {};
	}

	render() {
		return (
			<Image source={require('../img/background.png')} style={styles.backgroundImage}>
				<View style={styles.container}>
					<Image source={require('../img/logo.png')} style={styles.logoImage}/>
					<Text style={styles.logoText}>Esi tuvāk Latvijas dabai</Text>
                    <Text style={styles.logoText}>{this.state.text}</Text>

					<View style={styles.footerContainer}>
						<View style={styles.footerButtonContainer}>
							<TouchableOpacity onPress={this.onFacebookLoginPress.bind(this)}>
								<View style={styles.facebookButtonWrapper}>
									<Icon name="sc-facebook" type="evilicon" size={30} color="#FFF"/>
									<Text style={styles.facebookButtonText}>Pieteikties ar Facebook</Text>
								</View>
							</TouchableOpacity>
								<View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',}}>
									<Text style={styles.agreementText}>Izveidojot kontu, jūs piekrītat </Text>
									<TouchableOpacity onPress={this.handleTermAndConditionsPress.bind(this)}>
										<Text style={styles.agreementText}>“Lietošanas noteikumiem”</Text>
									</TouchableOpacity>
									<Text style={styles.agreementText}> un </Text>
									<TouchableOpacity onPress={this.handlePrivacyPolicyPress.bind(this)}>
										<Text style={styles.agreementText}>“Konfidencialitātes politikai”</Text>
									</TouchableOpacity>
								</View>
						</View>

						<View style={styles.topSponsorLine}></View>
						<Image source={require('../img/sponsor.png')} style={styles.sponsorImage}/>
					</View>
				</View>
			</Image>
		);
	}

	onFacebookLoginPress() {
		let self = this;
		LoginManager.logInWithReadPermissions(['public_profile', 'user_friends'])
			.then(
				(result) => {
					if (result.isCancelled) {
						this.onError('Login atcelts', self.CLASS_NAME);
					} else {
						AccessToken.getCurrentAccessToken().then(
							(tokenData) => {
								this.onSuccessLogin(tokenData.accessToken);
							},
							(error) => {
								this.onError(error, self.CLASS_NAME);
							}
						).catch((error) => {
							this.onError(error, self.CLASS_NAME);
						});
					}
				},
				(error) => {
					this.onError(error, self.CLASS_NAME);
				}
			)
			.catch((error) => {
				this.onError(error, self.CLASS_NAME);
			});
	}

	handleTermAndConditionsPress() {
        Linking.openURL("http://dabastops.lv/terms-and-conditions.html")
			.catch((error) => {
                this.onError(error, this.CLASS_NAME);
			});
	}

	handlePrivacyPolicyPress() {
		Linking.openURL("http://dabastops.lv/privacy-policy.html")
			.catch((error) => {
				this.onError(error, this.CLASS_NAME);
			});
	}
}
