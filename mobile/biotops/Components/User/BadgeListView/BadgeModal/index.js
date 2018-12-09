"use strict";
import React from 'react';
import {StyleSheet, Text, View, Modal, TouchableOpacity, Image} from 'react-native';
import {Icon} from 'react-native-elements';
import { ShareDialog } from 'react-native-fbsdk';
import PLACE_DETAILS_BUTTON_STYLE from "../../../../Screen/MainScreen/PlaceDetailsScreen/ButtonView/style/index";
import LoadingButton from "../../../LoadingButton/index";
import {APP_SETTINGS} from "../../../../settings";

const styles = StyleSheet.create({
    modalWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        paddingBottom: 20,
    },

    modalContainerAchieved: {
        backgroundColor: '#04693c',
    },

    modalContainerNotAchieved: {
        backgroundColor: '#5f5d70',
    },

    closeButtonContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 10,
        marginRight: 20,
        paddingBottom: 20,
    },

    descriptionContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 25,
        paddingLeft: 15,
        paddingRight: 15,
    },

    badgeImage: {
        width: '60%',
        height: 150,
        resizeMode: 'contain',
        marginBottom: 25,
    },

    badgeInfoMessage: {
        color: '#FFF',
        fontSize: 22,
        textAlign: 'center',
    },

    badgeAchievedInfoMessage: {
        color: '#FFF',
        fontSize: 15,
        textAlign: 'center',
    },

    badgeName: {
        color: '#f9d641',
        fontSize: 22,
    },

    badgeInfoFooter: {
        color: '#FFF',
        fontSize: 15,
    },
});

export default class BadgeView extends React.PureComponent {

    static CLASS_NAME = 'BadgeView';

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            name: '',
            description: '',
            imageUrl: null,
            achieved: false,
        };
        this.onError = this.props.onError ? this.props.onError : (error, className) => {};
    }

    render() {
        return (
            <Modal animationType={"fade"}
                   transparent={true}
                   visible={this.state.visible}
                   onRequestClose={() => {}}>
                <View style={styles.modalWrapper}>
                    <View style={[styles.modalContainer, this.state.achieved ? styles.modalContainerAchieved : styles.modalContainerNotAchieved]}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={this.handleHideModal.bind(this)}>
                                <Icon name="close"/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Image style={styles.badgeImage} source={{uri: this.state.imageUrl}}/>
                            {!this.state.achieved && <Text style={styles.badgeInfoMessage}>Lai iegūtu titulu</Text>}
                            {this.state.achieved && <Text style={styles.badgeInfoMessage}>Apsveicam!</Text>}
                            {this.state.achieved && <Text style={styles.badgeInfoMessage}>Esi ieguvis titulu –</Text>}
                            <Text style={styles.badgeName}>{this.state.name}</Text>
                            <Text style={this.state.achieved ? styles.badgeAchievedInfoMessage : styles.badgeInfoMessage}>{this.state.description}</Text>
                        </View>
                        {!this.state.achieved && <Text style={styles.badgeInfoFooter}>Tev padodas labi!</Text>}
                        {!this.state.achieved && <Text style={styles.badgeInfoFooter}>Tā turpināt</Text>}

	                    {this.state.achieved &&
                            <LoadingButton onPress={this.onFacebookSharePress.bind(this)}
                                           style={{marginTop: 8}}
                                           buttonText="Dalies"
                                           buttonImage={require('./img/facebook_icon.png')}
                                           buttonLoaderStyle={PLACE_DETAILS_BUTTON_STYLE.button}
                                           buttonStyle={PLACE_DETAILS_BUTTON_STYLE.button}
                                           buttonImageStyle={PLACE_DETAILS_BUTTON_STYLE.buttonImage}
                                           loading={false}/>
	                    }
                    </View>
                </View>
            </Modal>
        );
    }

    showModal(badge) {
        this.setState({
            visible: true,
            achieved: badge.achieved,
            name: badge.name.toUpperCase(),
            description: badge.description,
            imageUrl: APP_SETTINGS.serverUrl + badge.imageUrl,
        });
    }

    handleHideModal() {
        this.setState({
            visible: false,
        });
    }

	onFacebookSharePress() {
		let shareContent = {
			contentType: 'photo',
			photos: [
				{
					userGenerated: false,
					imageUrl: this.state.imageUrl
				}
			]
		};
		ShareDialog.canShow(shareContent).then(
			(canShow) => {
				if (canShow) {
					return ShareDialog.show(shareContent);
				}
			}
		).then(
			(result) => {
				if (result.isCancelled) {
				    this.onError('Dališana atcelta', this.CLASS_NAME);
				}
			},
			(error) => {
                this.onError('Dališana atcelta: ' + error, this.CLASS_NAME);
			}
		);
    }
}