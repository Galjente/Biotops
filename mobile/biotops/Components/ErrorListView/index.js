"use strict";
import React from 'react';
import {View, ScrollView} from 'react-native';
import ERROR_VIEW_STYLE from "./styles/index";
import ErrorMessageView from "./ErrorMessageView/index";
import DEFAULT_API_SERVICE from "../../ApiService";

export default class ErrorListView extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showError: false,
			errors: []
		};
	}

	render() {
		return (
			<View style={ERROR_VIEW_STYLE.container}>
				<ScrollView>
					{this.state.errors.map((message, index) => <ErrorMessageView key={index}
																				 message={message}
																				 onPress={this.handleErrorMessagePress.bind(this, index)}/>
					)}
				</ScrollView>
			</View>
		);
	}

    handleErrorMessagePress(index) {
		let errors = this.state.errors;
		if (errors[index]) {
			delete errors[index];
			this.setState({
				errors: errors
			});
		}
	}

	showErrorMessage(message, className, showError) {
        let errors = this.state.errors;
        if (typeof showError === 'undefined') {
        	showError = true;
		}
        if (showError && message && errors.indexOf(message) < 0) {
        	errors.push(message);
            this.setState({
                errors: errors
            });
        }
        DEFAULT_API_SERVICE.sendErrorMessage(className, message, this.props.jwtToken);
	}
}