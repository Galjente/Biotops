"use strict";

import React from 'react';
import {View, Image, Animated} from 'react-native';
import {StackNavigator} from 'react-navigation';
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import MapScreen from "./MapScreen/index";
import TopScreen from "./TopScreen/index";
import ProfileScreen from "./ProfileScreen/index";
import PlaceDetailsScreen from "./PlaceDetailsScreen";
import HomeScreen from "./HomeScreen/index";
import COMMON_STYLE from "../CommonStyles/index";
import FriendDetailsScreen from "./FriendDetailsScreen/index";


export default class TabBarScreen extends React.PureComponent {
    static navigationOptions = {
        title: 'Biotops',
        header: null
    }

    static appbarElevation = 4;

    constructor(props) {
        super(props);
        const {state} = this.props.navigation;
        let pageIndex = 0;

        if (state && state.params && state.params.tabName === 'Map') {
            pageIndex = 1;
        }

        this.screen = [];
        this.state = {
            index: pageIndex,
            routes: [
                {key: '1', title: '', icon: <Image source={require('./icons/map_icon.png')} style={COMMON_STYLE.menuBarIcon}/>},
                {key: '2', title: '', icon: <Image source={require('./icons/place_list_icon.png')} style={COMMON_STYLE.menuBarIcon}/>},
                {key: '3', title: '', icon: <Image source={require('./icons/top_icon.png')} style={COMMON_STYLE.menuBarIcon}/>},
                {key: '4', title: '', icon: <Image source={require('./icons/profile_icon.png')} style={COMMON_STYLE.menuBarIcon}/>},
            ],
        };

    }

    _handleIndexChange = index => {
        if (this.screen[index] && this.screen[index].reloadData) {
            this.screen[index].reloadData();
        }

        this.setState({
            index: index,
        });
    };

    _renderIndicator = props => {
        const {width, position} = props;
        const translateX = Animated.multiply(position, width);

        return (
            <Animated.View style={[{width, transform: [{translateX}]}]}>
                <View style={COMMON_STYLE.menuBarItemIndicator}/>
            </Animated.View>
        );
    };

    _renderIcon = ({route}) => {
        return route.icon;
    };

    _renderFooter = props => {
        return (
            <TabBar
                {...props}
                renderIcon={this._renderIcon}
                renderIndicator={this._renderIndicator}
                style={COMMON_STYLE.menuBar}
                tabStyle={COMMON_STYLE.menuBarItem}
            />
        );
    };

    _renderScene = ({route}) => {
        const {state} = this.props.navigation;
        let jwtToken = this.props.screenProps.jwtToken;

        if (state && state.params && state.params.jwtToken) {
            jwtToken = state.params.jwtToken;
        }

        switch (route.key) {
            case '1':
                return (<HomeScreen
                            ref={(element) => this.screen[0] = element}
                            jwtToken={jwtToken}
                            onError={this.props.screenProps.onError}
                            onLogout={this.props.screenProps.onLogout}
                            onPlacePress={this.onHomeScreenPress.bind(this, 1)}
                            onTopPress={this.onHomeScreenPress.bind(this, 2)}
                            onProfilePress={this.onHomeScreenPress.bind(this, 3)}
                            onPlaceOpenPress={this.onPlaceOpenPress.bind(this)}/>);
            case '2':
                return (<MapScreen
                            ref={(element) => this.screen[1] = element}
                            jwtToken={jwtToken}
                            onError={this.props.screenProps.onError}
                            onLogout={this.props.screenProps.onLogout}
                            onPlaceOpenPress={this.onPlaceOpenPress.bind(this)}/>);
            case '3':
                return (<TopScreen
                            ref={(element) => this.screen[2] = element}
                            jwtToken={jwtToken}
                            onError={this.props.screenProps.onError}
                            onLogout={this.props.screenProps.onLogout}
                            onPlaceOpenPress={this.onPlaceOpenPress.bind(this)}/>);
            case '4':
                return (<ProfileScreen
                            ref={(element) => this.screen[3] = element}
                            jwtToken={jwtToken}
                            onError={this.props.screenProps.onError}
                            onLogout={this.props.screenProps.onLogout}
                            onPlaceOpenPress={this.onPlaceOpenPress.bind(this)}
                            onFriendPress={this.handleFriendPress.bind(this)}
                            onGoBackPress={this.handleGoBackPress.bind(this)}/>);
            default:
                return null;
        }
    };

    render() {
        return (
			<TabViewAnimated
				style={[this.props.style]}
				navigationState={this.state}
				renderScene={this._renderScene}
				renderFooter={this._renderFooter}
				onIndexChange={this._handleIndexChange}
                swipeEnabled={false}
			/>
        );
    }

	onHomeScreenPress(menuIndex) {
		this.setState({index: menuIndex});
	}

	onPlaceOpenPress(placeId) {
		const { navigate } = this.props.navigation;
		navigate('PlaceDetails', {placeId: placeId});
	}

    handleFriendPress(friendId) {
        const { navigate } = this.props.navigation;
        navigate('FriendDetails', {friendId: friendId});
    }

    handleGoBackPress() {
        this.setState({
            index: 0,
        });
    }
}

export const MainScreenNavigation = StackNavigator(
    {
        Home: {
            screen: TabBarScreen
        },
        PlaceDetails : {
            screen: PlaceDetailsScreen
        },
        FriendDetails: {
            screen: FriendDetailsScreen
        }
    }
);

