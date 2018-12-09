"use strict";
import React from 'react';
import {ActivityIndicator, ScrollView, View, TouchableOpacity, Image, StyleSheet, Text} from 'react-native';
import {APP_SETTINGS} from "../../../../../settings";
import CategoryButton from "./Component/CategoryButton";

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginLeft: 8,
        marginRight: 8,
    },
    placeCategoryContainer: {},
    placeCategoryButton: {
        backgroundColor: 'transparent',
    },
    placeCategoryButtonIcon: {
        width: 45,
        height: 45,
        marginLeft: 5,
        marginRight: 5,
        resizeMode: 'stretch',
    }
});

export default class PlaceCategoryListView extends React.PureComponent {

    static CLASS_NAME = 'PlaceCategoryListView';

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            categories: []
        };
        this.selectedCategories = {};
        this.onError = this.props.onError ? this.props.onError : (error) => {};
    }

    componentWillMount() {
        this.loadCategories();
    }

    render() {
        if (!this.state.loading && this.state.categories.length == 0) {
            return null;
        }
        return (
            <View style={styles.container}>
                { this.state.loading && <ActivityIndicator/> }
                <ScrollView horizontal={true} style={styles.placeCategoryContainer}>
                    {this.state.categories.map((placeCategory, index) => <CategoryButton  key={index} category={placeCategory} onPress={this.handleCategoryPress.bind(this)} />)}
                </ScrollView>
            </View>
        );
    }

    handleCategoryPress(id, selected) {
        if (selected) {
            this.selectedCategories[id] = id;
        } else if (this.selectedCategories[id]) {
            delete this.selectedCategories[id];
        }
        if (this.props.onPress) {
            this.props.onPress();
        }
    }

    getSelectedCategories() {
        let categories = [];
        for (let key in this.selectedCategories) {
            categories.push(this.selectedCategories[key]);
        }
        return categories;
    }

    loadCategories() {
        let self = this;
        this.setState({loading: true});
        fetch(APP_SETTINGS.serverUrl + '/api/place/category/all', {
            method: 'GET',
            headers: APP_SETTINGS.headers(this.props.jwtToken),
            timeout: APP_SETTINGS.timeout,
        }).then((response) => {
            if (response.status === 200) {
                response.json()
                    .then(
                        (responseJson) => {
                            self.setState({
                                loading: false,
                                categories: responseJson,
                            });
                        },
                        (error) => {
                            self.setState({
                                loading: false
                            });
                        }
                    )
                    .catch((error) => {
                        self.setState({
                            loading: false
                        });
                    });
            } else if (response.status === 401) {
                self.setState({
                    loading: false,
                });
                if (self.props.onAuthorizationFailed) {
                    self.props.onAuthorizationFailed();
                }
            }
        }).catch((error) => {
            self.setState({
                loading: false,
            });
        });
    }
}