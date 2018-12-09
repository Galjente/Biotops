"use strict";
import React from 'react';
import {View, Text, ScrollView, ActivityIndicator} from 'react-native';
import COMMON_STYLE from "../../CommonStyles/index";
import PlaceListItemView from "../../../Components/PlaceListItemView/index";
import DEFAULT_API_SERVICE from "../../../ApiService";


export default class TopScreen extends React.Component {

    static CLASS_NAME = 'TopScreen';

    constructor(props) {
        super(props);
        this.state = {
        	loading: true,
			places: []
		};
        this.onError = this.props.onError ? this.props.onError : (error) => {};
        this.onLogout = this.props.onLogout ? this.props.onLogout : () => {};
    }

    componentDidMount() {
        this.loadTops();
    }

	render() {
		return (
			<View style={COMMON_STYLE.container}>
				<Text style={COMMON_STYLE.containerHeaderTitle}>LABĀKIE</Text>
				<ScrollView>
                    {this.state.loading && <ActivityIndicator size="large"/>}
                    {!this.state.loading && this.state.places.length == 0 && <Text style={COMMON_STYLE.listViewEmptyText}>Tops ir tukš</Text>}
                    {this.state.places.map(
                        (place, index) => <PlaceListItemView key={index}
															 place={place}
															 position={`${index + 1}`}
															 onPress={this.props.onPlaceOpenPress}/>
                    )}
				</ScrollView>
			</View>
		);
	}

    reloadData() {
        if (!this.state.loading) {
            this.loadTops();
        }
	}

	loadTops() {
        let self = this;
        self.setState({
            loading: true,
        });

        DEFAULT_API_SERVICE.getTop10Places(this.props.jwtToken, () => {self.onLogout();})
            .then(
                (json) => {
                    self.setState({
                        loading: false,
                        places: json,
                    });
                },
                (error) => {
                    self.setState({
                        loading: false,
                        places: [],
                    });
                    self.onError(error, self.CLASS_NAME);
                }
            ).catch((error) => {
                self.setState({
                    loading: false,
                    places: [],
                });
                self.onError(error, self.CLASS_NAME);
            });
	}
}