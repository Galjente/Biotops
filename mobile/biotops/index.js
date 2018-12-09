"use strict";
import React from 'react';
import {View, NetInfo, PermissionsAndroid, Platform} from 'react-native';
import {StackNavigator} from 'react-navigation';
import StatusBarPaddingIOS from 'react-native-ios-status-bar-padding';
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import {MainScreenNavigation} from './Screen/MainScreen';
import LoadingScreen from "./Screen/LoadingScreen";
import ErrorListView from "./Components/ErrorListView";
import AuthenticationScreen from "./Screen/AuthenticationScreen";
import COMMON_STYLE from "./Screen/CommonStyles/index";
import WebViewScreen from "./Screen/WebViewScreen/index";
import DEFAULT_API_SERVICE from "./ApiService";

export default class Biotops extends React.Component {

	static CLASS_NAME = 'Biotops';

	constructor(props) {
		super(props);

		this.state = {
			token: null,
			checkedSignIn: false,
		};
	}

    componentDidMount() {
		let self = this;
	    NetInfo.fetch().then(() => {self.handleConnectivityChange()});
        NetInfo.addEventListener('change', () => {self.handleConnectivityChange()});
        if (Platform.OS === 'android') {
            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            ]).then(
                (result) => {
                	let permissionsOk = true;
                	if (result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
                        permissionsOk = false;
                        this.handleError('Location permission required', this.CLASS_NAME);
					}
                    if (result[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !== PermissionsAndroid.RESULTS.GRANTED) {
                        permissionsOk = false;
                        this.handleError('Storage permission required', this.CLASS_NAME);
                    }
                    if (result[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] !== PermissionsAndroid.RESULTS.GRANTED) {
                        permissionsOk = false;
                        this.handleError('Phone state permission required', this.CLASS_NAME);
                    }
					if (permissionsOk) {
                        this.checkAuthentication();
                    }
                },
                (error) => {
                    this.handleError(error, this.CLASS_NAME);
                    this.state = {
                        checkedSignIn: true,
                    };
                }
            ).catch((error) => {
                this.handleError(error, this.CLASS_NAME);
                this.state = {
                    checkedSignIn: true,
                };
            });
		} else {
            this.checkAuthentication();
		}
	}

    componentWillUnmount() {
		let self = this;
		NetInfo.removeEventListener('change', () => {self.handleConnectivityChange()});
    }

	render() {
		let Layout = this.createLayout(this.state.checkedSignIn, this.state.token);

		return (
			<View style={COMMON_STYLE.mainContainer}>
				<StatusBarPaddingIOS/>
				<Layout screenProps={{
				    jwtToken: this.state.token,
                    onError: this.handleError.bind(this),
					onSuccessLogin: this.handleLogin.bind(this),
                    onLogout: this.handleLogout.bind(this)
				}}/>
				<ErrorListView ref="errorView"
							   jwtToken={this.state.token}/>
			</View>
		);
	}

    createLayout(checkedSignIn, token) {
        if (!checkedSignIn) {
            return LoadingScreen;
        }

        return StackNavigator(
            {
                SignedIn: {
                    screen: MainScreenNavigation,
                    navigationOptions: {
                        gesturesEnabled: false
                    }
                },
                SignedOut: {
                    screen: AuthenticationScreen,
                    navigationOptions: {
                        gesturesEnabled: false
                    }
                },
				WebView: {
                	screen: WebViewScreen,
                    navigationOptions: {
                        gesturesEnabled: false
                    }
				}
            },
            {
                headerMode: "none",
                mode: "modal",
                initialRouteName: token ? "SignedIn" : "SignedOut"
            }
        );
    }

	checkAuthentication() {
	    let self = this;
	    AccessToken.getCurrentAccessToken().then(
			(data) => {
				if (data) {
					self.handleLogin(data.accessToken);
                } else {
                    self.handleError('Failed get valid token', this.CLASS_NAME, false);
					self.setState({
                        checkedSignIn:	true,
						token: null
					});
				}
			},
			(error) => {
				self.handleError(error, this.CLASS_NAME);
                self.setState({
                    checkedSignIn:	true,
                    token: null
                });
			}
		).catch((error) => {
			self.handleError(error, this.CLASS_NAME);
            self.setState({
                checkedSignIn:	true,
                token: null
            });
		});
	}

	handleConnectivityChange(connectionType) {
		if (connectionType == 'none' || connectionType == 'unknown') {
            this.handleError('Nav savienojuma ar serveri', this.CLASS_NAME, true);
		}
	}

    handleError(errorMessage, className, showError) {
		let message = errorMessage && errorMessage.message ? errorMessage.message : errorMessage;
	    if (this.refs.errorView) {
            this.refs.errorView.showErrorMessage(message, className, showError);
        }
	}

	handleLogin(accessToken) {
		let self = this;
		if (this.state.checkedSignIn) {
			this.setState({
				checkedSignIn: false,
				token: null
			});
		}

        DEFAULT_API_SERVICE.login(accessToken).then(
			(token) => {
				self.setState({
					checkedSignIn:	true,
					token: token
				});
			},
			(error) => {
				console.log(error);
				self.setState({
					checkedSignIn:	true,
					token: null
				});
				self.handleError(error, this.CLASS_NAME);
			}
		).catch((error) => {
			self.setState({
				checkedSignIn:	true,
				token: null
			});
			self.handleError(error, this.CLASS_NAME);
		});
	}

    handleLogout() {
	    this.setState({
		    checkedSignIn:	true,
		    token: null
	    });
	    LoginManager.logOut();
    }
}
