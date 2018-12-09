"use strict";
import React from 'react';
import {Text, View, ActivityIndicator} from 'react-native';
import DEFAULT_API_SERVICE from "../../../ApiService";
import COMMON_STYLE from "../../../Screen/CommonStyles/index";
import PlaceListItemView from "../../PlaceListItemView/index";

export default class HistoryListView extends React.PureComponent {

    static CLASS_NAME = 'HistoryListView';

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            places: [],
        };

        this.userId = this.props.userId ? this.props.userId : null;
        this.onErrro = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout : () => {};
    }

    componentWillMount() {
        this.loadHistory();
    }

    render() {
        return (
            <View>
                <Text style={COMMON_STYLE.listViewTitle}>VĒSTURE</Text>
                {this.state.loading && <ActivityIndicator size="large" />}
                {!this.state.loading && this.state.places.length == 0 && <Text style={COMMON_STYLE.listViewEmptyText}>Nav vietas</Text>}
				<View>
                    {this.state.places.map((place, index) => (
                        <PlaceListItemView onPress={this.props.onPlaceOpenPress}
                                           key={index}
                                           visited={true}
                                           place={place} />
                    ))}
				</View>
            </View>
        );
    }

    reloadData() {
        if (!this.state.loading) {
            this.loadHistory();
        }
	}

	loadHistory() {
        let self = this;

        this.setState({
            loading: true
        });

        DEFAULT_API_SERVICE.getHistoryPlaces(this.userId, this.props.jwtToken, () => {self.onLogout})
            .then(
                (json) => {
                    self.setState({
                        loading: false,
                        places: json
                    });
                },
                (error) => {
                    self.setState({
                        loading: false,
                        places: []
                    });
                    self.onErrro(error, self.CLASS_NAME);
                }
            ).catch((error) => {
                self.setState({
                    loading: false,
                    places: []
                });
                self.onErrro(error, self.CLASS_NAME);
            });
    }
}
