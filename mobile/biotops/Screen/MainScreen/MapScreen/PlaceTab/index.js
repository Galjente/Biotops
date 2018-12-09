"use strict";
import React from 'react';
import {StyleSheet, ActivityIndicator, ScrollView, View, Text, Image} from 'react-native';
import PlaceListItemView from "../../../../Components/PlaceListItemView";
import NearestPlaceListView from "../../../../Components/NearestPlaceListView";
import COMMON_STYLE from "../../../CommonStyles/index";
import PLACE_TAB_STYLE from "./style/index";

export default class PlaceTab extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let showEmptyMessage = !this.props.placeLoadingState && !this.props.placesState.length;
        let listTitle = 'A-Z';
        let previousLetter = '';

        if (this.props.searchState) {
            listTitle = 'Meklēšanas rezultāti'.toUpperCase();
        }

        return (
            <View style={COMMON_STYLE.container}>
                <ScrollView>
                    <NearestPlaceListView ref="nearestPlaceListView"
                                          onPlaceOpenPress={this.props.onPlaceOpenPress}
                                          jwtToken={this.props.jwtToken}
                                          onError={this.props.onError}
                                          onLogout={this.props.onLogout}/>
                    <View>
                        <Text style={COMMON_STYLE.listViewTitle}>{listTitle}</Text>
                        {this.props.placeLoadingState && <ActivityIndicator size="large"/>}
                        {showEmptyMessage && <Text style={COMMON_STYLE.listViewEmptyText}>Nekas nav atrasts</Text>}
                        {!this.props.placeLoadingState && this.props.placesState.map((place, index) => {
                            let addLetter = false;
                            if (place.name[0] != previousLetter) {
                                previousLetter = place.name[0];
                                addLetter = true;
                            }
                            return(
                                <View key={'container_' + index}>
                                    {addLetter && <View key={'container_' + previousLetter} style={PLACE_TAB_STYLE.letterWrapper}><Text  key={previousLetter} style={PLACE_TAB_STYLE.letterText}>{previousLetter}</Text></View>}
                                    <PlaceListItemView key={index}
                                                       place={place}
                                                       onPress={this.props.onPlaceOpenPress} />
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }

    reloadData() {
        if (this.refs.nearestPlaceListView) {
	        this.refs.nearestPlaceListView.refresh();
        }
    }
}