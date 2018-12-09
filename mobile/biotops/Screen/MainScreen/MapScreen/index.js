"use strict";
import React from 'react';
import {Platform, Text, View} from 'react-native';
import {SearchBar} from 'react-native-elements';
import {TabBar, TabViewAnimated, TabViewPagerPan, TabViewPagerScroll} from 'react-native-tab-view';
import MapTab from './MapTab';
import PlaceTab from "./PlaceTab";
import PlaceCategoryListView from './PlaceTab/PlaceCategoryListView';
import {APP_SETTINGS} from "../../../settings";
import COMMON_STYLE from "../../CommonStyles/index";
import MAP_STYLE from "./style/index";
import DEFAULT_API_SERVICE from "../../../ApiService";

export default class MapScreen extends React.PureComponent {

    static CLASS_NAME = 'MapScreen';

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            routes: [
                {key: '1', title: 'KARTE'},
                {key: '2', title: 'SARAKSTS'},
            ],
	        loading: true,
            placeSearch: false,
            places: []
        };
        this.searchTimeout = null;
        this.searchText = '';
        this.screen = [];
        this.jwtToken = this.props.jwtToken;
        this.onError = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout: () => {};
    }

	componentDidMount() {
        this.loadAllPlaces();
    }

    render() {
        return (
            <View style={COMMON_STYLE.container}>
                <Text style={COMMON_STYLE.containerHeaderTitle}>VIETAS</Text>
                <SearchBar round
                           placeholder="Meklēt"
                           containerStyle={MAP_STYLE.searchContainer}
                           inputStyle={MAP_STYLE.searchInput}
                           clearIcon={{color: '#86939e', name: 'cancel'}} onChangeText={this.handleChangeSearchText.bind(this)}/>
                {this.state.index === 1 && <PlaceCategoryListView ref="placeCategoryListView"
                                                                  jwtToken={this.jwtToken}
                                                                  onPress={this.handleChangeSearchText.bind(this, this.searchText)}
                                                                  onError={this.onError}
                                                                  onLogout={this.onLogout}/>
                }
                <TabViewAnimated
                    style={[this.props.style]}
                    navigationState={this.state}
                    renderScene={this._renderScene}
                    renderHeader={this._renderHeader}
                    onIndexChange={this._handleIndexChange}
                    renderPager={this._renderPager}
                    swipeEnabled={false}
                    activeTextColor={{color: '#50e3c2'}}/>
            </View>
        );
    }

    _handleIndexChange = index => {
        if (this.screen[index] && this.screen[index].reloadData) {
            this.screen[index].reloadData();
        }
        this.setState({index: index});
    };


    _renderLabel = ({route, focused}) => {
        let selectedLabelStyle = focused ? MAP_STYLE.menuBarActiveIndicatorItem : MAP_STYLE.menuBarInactiveIndicatorItem;
        return (
            <Text style={[MAP_STYLE.menuBarIndicatorItem, selectedLabelStyle]}>{route.title}</Text>
        );
    };

    _renderHeader = props => {
        return (
            <TabBar {...props}
                    indicatorStyle={MAP_STYLE.menuBarIndicator}
                    style={COMMON_STYLE.menuBar}
                    renderLabel={this._renderLabel} />
        );
    };

    _renderScene = ({route}) => {
        switch (route.key) {
            case '1':
                return (<MapTab ref={(element) => this.screen[0] = element}
                                searchState={this.state.placeSearch}
                                placesState={this.state.places}
                                placeLoadingState={this.state.loading}
                                jwtToken={this.jwtToken}
                                onError={this.onError}
                                onLogout={this.onLogout}
                                onPlaceOpenPress={this.props.onPlaceOpenPress}/>);
            case '2':
                return (<PlaceTab ref={(element) => this.screen[1] = element}
                                  searchState={this.state.placeSearch}
                                  placesState={this.state.places}
                                  placeLoadingState={this.state.loading}
                                  onPlaceOpenPress={this.props.onPlaceOpenPress}
                                  jwtToken={this.jwtToken}
                                  onError={this.onError}
                                  onLogout={this.onLogout}/>);
            default:
                return null;
        }
    };


    _renderPager = (props) => {
        return (Platform.OS === 'ios') ? <TabViewPagerScroll {...props} /> : <TabViewPagerPan {...props} />
    };

    reloadData() {
        if (this.screen && this.state.index) {
            this.screen[this.state.index].reloadData();
        }
    }

	handleChangeSearchText(text) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchText = text && text.length > 2 ? text : '';
        let categories = [];
        if (this.state.index === 1 && this.refs.placeCategoryListView) {
            categories = this.refs.placeCategoryListView.getSelectedCategories();
        }
        if (this.searchText || categories.length) {
            this.searchTimeout = setTimeout(() => {this.searchPlace(this.searchText, categories)}, 500);
        } else if (this.state.placeSearch) {
            this.searchTimeout = setTimeout(() => {this.loadAllPlaces()}, 500);
        }
    }

    searchPlace(text, categories) {
        let self = this;

        self.setState({
            placeSearch: true,
            loading: true,
        });

        function processSuccessResponse(response) {
            response.json().then(
                (responseJson) => {
                    self.setState({
                        loading: false,
                        places: responseJson
                    });
                },
                (error) => {
                    self.onError(error, self.CLASS_NAME);
                    self.setState({
                        loading: false,
                        places: []
                    });
                }
            )
                .catch((error) => {
                    self.onError(error, self.CLASS_NAME);
                    self.setState({
                        loading: false,
                        places: []
                    });
                });
        }

        new Promise((resolve, reject) => {
            fetch(`${APP_SETTINGS.serverUrl}/api/place/search`, {
                method: 'POST',
                body: JSON.stringify({
                    search: text,
                    categories: categories,
                }),
                headers: APP_SETTINGS.headers(self.props.jwtToken),
                timeout: APP_SETTINGS.timeout,
            }).then(resolve, reject).catch(reject);
        }).then(
            (response) => {
                if (response.status === 200) {
                    processSuccessResponse(response);
                } else if (response.status === 401) {
                        self.onLogout();
                } else {
                    self.setState({
                        loading: false,
                        places: []
                    });
                }
            },
            (error) => {
                self.onError(error, self.CLASS_NAME);
                self.setState({
                    loading: false,
                    places: []
                });
            }
        )
        .catch((error) => {
            self.onError(error, self.CLASS_NAME);
            self.setState({
                loading: false,
                places: []
            });
        });
    }

    loadAllPlaces() {
        let self = this;
        self.setState({
            placeSearch: false,
            loading: true,
            places: [],
        });

        DEFAULT_API_SERVICE.getAllPlaces(this.jwtToken, () =>{ self.onLogout();})
            .then(
                (json) => {
                    self.setState({
                        loading: false,
                        places: json
                    });
                },
                (error) => {
                    self.onError(error, self.CLASS_NAME);
                    self.setState({
                        loading: false,
                        places: []
                    });
                }
            ).catch((error) => {
                self.onError(error, self.CLASS_NAME);
                self.setState({
                    loading: false,
                    places: []
                });
            });
    }
}