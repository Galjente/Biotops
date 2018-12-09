'use strict';
import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {Avatar} from 'react-native-elements';
import COMMON_STYLE from "../../../../CommonStyles";

export default class FriendListItem extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let friend = this.props.friend;
        let displayedName = `${friend.name} ${friend.surname}`;
        let lastBadgeName = friend.lastBadge ? friend.lastBadge.name : '';

        return (
            <TouchableOpacity onPress={this.handleFriendPress.bind(this)}>
                <View style={[COMMON_STYLE.listViewItemContainer, this.props.style]}>
                    {friend.profilePhotoLink && <Avatar rounded width={60} height={60} style={{marginRight: 10}} source={{uri: friend.profilePhotoLink}} />}
                    <View style={COMMON_STYLE.listViewItemInfoContainer}>
                        <View style={COMMON_STYLE.listViewItemInfoTextWrapper}>
                            <Text style={[COMMON_STYLE.listViewItemInfoText, {fontSize: 20, color: '#43496a'}]}>{displayedName}</Text>
                        </View>
                        <Text style={COMMON_STYLE.listViewItemInfoSubText}>{lastBadgeName}</Text>
                    </View>
                    <View style={[COMMON_STYLE.listViewItemIconContainer, {justifyContent: 'center',}]}>
                        <Image style={[COMMON_STYLE.listViewItemIcon, {resizeMode: 'cover', width: 25, height: 25}]} source={require('./img/profile_icon.png')}/>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    handleFriendPress() {
        let friend = this.props.friend;
        if (this.props.onPress && friend) {
            this.props.onPress(friend.id);
        }
    }
}