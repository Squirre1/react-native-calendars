import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    ScrollView,
    PanResponder,
    Dimensions,
    Animated
} from 'react-native';

import style from './style';

export default class Swiper extends PureComponent {
    static propTypes = {
        // the value for change in fractional part of full width, for example 0.5 is half of window width
        successCapture: PropTypes.number,
        // on change success
        onChangePage: PropTypes.func,
        // render functions
        renderLeft: PropTypes.func.isRequired,
        renderRight: PropTypes.func.isRequired,
        renderCenter: PropTypes.func.isRequired,
        // accessibility toggles
        canSwipeToLeft: PropTypes.bool,
        canSwipeToRight: PropTypes.bool,

        animationDuration: PropTypes.number,
        // styles
        blockStyle: PropTypes.any,
        containerStyle: PropTypes.any
    }

    static defaultProps = {
        successCapture: 0.5,
        onChangePage: undefined,
        canSwipeToRight: true,
        canSwipeToLeft: true,
        animationDuration: 200,
        blockStyle: undefined,
        containerStyle: undefined
    }

    static SWITCH_TYPE = {
        LEFT: true,
        RIGHT: false
    }

    state = {
        translateX: new Animated.Value(0),
        isInited: false,
    }

    componentWillMount() {
        const panHelper = {
            startGestureX: this.state.translateX._value,
            endGestureX: this.state.translateX._value,
            isAnimationPlaying: false,
            width: 0
        };
        this._panHelper = panHelper;
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                if (!panHelper.isAnimationPlaying) {
                    panHelper.startGestureX = this.state.translateX._value;
                }

                this.state.translateX.stopAnimation((value) => { panHelper.endGestureX = value; });
                panHelper.isAnimationPlaying = false;
            },
            onPanResponderRelease: (evt, gestureState) => {
                const startGestureX = panHelper.startGestureX;
                const endGestureX = this.state.translateX._value;
                const screenWidth = panHelper.width;
                const diff = startGestureX - endGestureX;
                const isGestureSuccessForChange = Math.abs(diff) / screenWidth >= this.props.successCapture;

                panHelper.endGestureX = endGestureX;
                panHelper.isAnimationPlaying = true;

                if (isGestureSuccessForChange) {
                    const toLeft = diff < 0;
                    const toValue = toLeft
                        ? startGestureX + screenWidth
                        : startGestureX - screenWidth;

                    // go to new state
                    Animated.timing(
                        this.state.translateX,
                        {
                            toValue,
                            duration: this.props.animationDuration,
                        }
                    ).start(this.handleAnimationComplete(true, toLeft));
                } else {
                    // return back
                    Animated.timing(
                        this.state.translateX,
                        {
                            toValue: startGestureX,
                            duration: this.props.animationDuration,
                        }
                    ).start(this.handleAnimationComplete(false));
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                const { dx } = gestureState;
                if (dx > 0 && this.props.canSwipeToLeft || dx < 0 && this.props.canSwipeToRight) {
                    this.state.translateX.setValue(panHelper.endGestureX + dx);
                }
            },
        });
    }

    /**
     * Run change animation
     */
    change = (toLeft) => new Promise((resolve, reject) => {
        const { startGestureX, width: screenWidth } = this._panHelper;
        this.state.translateX.stopAnimation();

        Animated.timing(
            this.state.translateX,
            {
                toValue: toLeft
                    ? startGestureX + screenWidth
                    : startGestureX - screenWidth,
                duration: this.props.animationDuration,
            }
        ).start(() => { this.handleAnimationComplete(true, toLeft)(); resolve(); });
    });

    handleAnimationComplete = (changed, isToLeft) => () => {
        this._panHelper.isAnimationPlaying = false;

        if (changed) {
            this.state.translateX.setValue(-this._panHelper.width);

            if (this.props.onChangePage) {
                this.props.onChangePage(isToLeft);
            }
        }
    }

    handleOnLayout = (e) => {
        const { nativeEvent: { layout: { width } } } = e;

        this.setState({
            isInited: true
        }, () => {
            this._panHelper.width = width;
            this._panHelper.startGestureX = -width;
            this._panHelper.endGestureX = -width;
            this.state.translateX.setValue(-width);
        });
    }

    render() {
        const { translateX, isInited } = this.state;
        const blockStyle = style.block(translateX, this.props.blockStyle);
        const containerStyle = style.calc(style.container, this.props.containerStyle);

        return (
            <View
                style={containerStyle}
                onLayout={this.handleOnLayout}
                {...this._panResponder.panHandlers}
            >
                {
                    isInited ? ([
                        <Animated.View style={blockStyle} key="left">
                            {this.props.renderLeft()}
                        </Animated.View>,
                        <Animated.View style={blockStyle} key="center">
                            {this.props.renderCenter()}
                        </Animated.View>,
                        <Animated.View style={blockStyle} key="right">
                            {this.props.renderRight()}
                        </Animated.View>
                    ]) : ([
                        <Animated.View style={blockStyle} key="center">
                            {this.props.renderCenter()}
                        </Animated.View>
                    ])
                }
            </View>
        );
    }
}
