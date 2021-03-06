import {
    StyleSheet,
    Platform
} from 'react-native';
import * as defaultStyle from '../../style';

export default function(theme = {}) {
    const appStyle = { ...defaultStyle,
        ...theme
    };
    return StyleSheet.create({
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 10,
            paddingRight: 10,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0'
        },
        monthText: {
            fontSize: appStyle.textMonthFontSize,
            fontFamily: appStyle.textMonthFontFamily,
            fontWeight: '300',
            color: appStyle.monthTextColor,
            margin: 10
        },
        arrow: {
            padding: 10
        },
        arrowImage: {
            ...Platform.select({
                ios: {
                    tintColor: appStyle.arrowColor
                },
                android: {
                    tintColor: appStyle.arrowColor
                }
            })
        },
        week: {
            marginTop: 7,
            paddingLeft: 16,
            paddingRight: 16,
            flexDirection: 'row',
            justifyContent: 'space-around'
        },
        dayHeader: {
            marginTop: 2,
            marginBottom: 7,
            width: 32,
            textAlign: 'center',
            fontSize: appStyle.textDayHeaderFontSize,
            fontFamily: appStyle.textDayHeaderFontFamily,
            color: appStyle.textSectionTitleColor
        },
        dayHeaderWeekend: {
            color: appStyle.textDayHeaderWeekendColor,
        }
    });
}
