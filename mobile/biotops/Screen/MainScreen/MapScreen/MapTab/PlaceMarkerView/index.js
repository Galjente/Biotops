'use strict';
import React from 'react';
import {ActivityIndicator, ScrollView, View, TouchableOpacity, Image, StyleSheet, Text, Button} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';
import MapView from 'react-native-maps';
import {APP_SETTINGS} from "../../../../../settings";

export default class PlaceMarkerView extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let place = this.props.place;
        let image = place.previewImage;
        return (
            <MapView.Callout onPress={this.handleCalloutPress.bind(this)}>
                <View style={[{flex: 1, flexDirection: 'row', padding: 6, width: 350}, this.props.style]}>
                    {image && <Avatar style={{marginTop: 10}} source={{uri: APP_SETTINGS.serverUrl + image}} rounded width={80} height={80}/>}
                    <View style={{paddingLeft: 6, flex: 1,}}>
                        {/*<TouchableOpacity onPress={this.handleCloseButton.bind(this)}>*/}
                            {/*<View style={{alignItems: 'flex-end',}}>*/}
                                {/*<Icon name="close"/>*/}
                            {/*</View>*/}
                        {/*</TouchableOpacity>*/}
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>{place.name}</Text>
                        <Text style={{}} numberOfLines={4}>{place.shortDescription}</Text>
                        <TouchableOpacity>
                            <View style={{alignItems: 'flex-end',}}>
                                <Text style={{color: '#00ca9d', fontSize: 18,}}>VAIRĀK…</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </MapView.Callout>
        );
    }

    handleCalloutPress() {
        let place = this.props.place;
        if (this.props.onPress) {
            this.props.onPress(place.id);
        }
    }
}