"use strict";
import React from 'react';
import {StyleSheet, ActivityIndicator, View, Text} from 'react-native';
import {APP_SETTINGS} from "../../settings";
import PlaceListItemView from "../PlaceListItemView/index";

const styles = StyleSheet.create({
    title: {
        color: '#9b99a9',
        textAlign: 'center',
        marginTop: 5,
        paddingBottom: 10,
    }
});

export default class NearestPlaceListView extends React.PureComponent {

    static CLASS_NAME = 'NearestPlaceListView';

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            places: []
        };
        this.onError = this.props.onError ? this.props.onError : (error) => {};
    }

    componentWillMount() {
        this.refresh();
    }

    render() {
        if (!this.state.places) {
            return null;
        }

        return(
            <View>
                <Text style={styles.title}>VISTUVĀK</Text>
                {this.state.loading && <ActivityIndicator/>}
                <View>
                    {this.state.places.map((place, index) => (
                        <PlaceListItemView key={index}
                                           onPress={this.props.onPlaceOpenPress}
                                           visited={true}
                                           place={place} />
                    ))}
                </View>
            </View>
        );
    }

    refresh() {
        let self = this;
        navigator.geolocation.getCurrentPosition((position) => {
            self.refreshByCoordinates(position.coords.latitude, position.coords.longitude)
        });
    }

    refreshByCoordinates(latitude, longitude) {
        let self = this;

        function processSuccessResponse(response) {
            response.json().then(
                (places) => {
                    self.setState({
                        loading: false,
                        places: places
                    });
                },
                (error) => {
                    self.onError(error, self.CLASS_NAME);
                    self.setState({
                        loading: false,
                        places: [],
                    });
                }
            )
            .catch((error) => {
                self.onError(error, self.CLASS_NAME);
                self.setState({
                    loading: false,
                    places: [],
                });
            });
        }

        fetch(`${APP_SETTINGS.serverUrl}/api/place/nearest?latitude=${latitude}&longitude=${longitude}&distance=300000&limit=3`, {
            method: 'GET',
            headers: APP_SETTINGS.headers(this.props.jwtToken),
            timeout: APP_SETTINGS.timeout,
        }).then(
            (response) => {
                if (response.status === 200) {
                    processSuccessResponse(response);
                } else if (response.status === 401) {
                    self.props.onLogout()
                } else {
                    self.setState({
                        loading: false,
                        places: [],
                    });
                }
            },
            (error) => {
                self.onError(error, self.CLASS_NAME);
                self.setState({
                    loading: false,
                    places: [],
                });
            }
        ).catch((error) => {
            self.onError(error, self.CLASS_NAME);
            self.setState({
                loading: false,
                places: [],
            });
        });
    }

}