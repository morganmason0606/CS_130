import { StyleSheet } from 'react-native';
import theme from './design_system.js';

const styles = StyleSheet.create({
	container: {
		flex: 1,
	  	justifyContent: 'center',
	},
    title: {
        textAlign: 'center',
        marginBottom: 48,

        color: theme.colors.black,
        fontSize: theme.fontSizes.larger,
        fontWeight: theme.fontWeights.bolder,
    },
	label: {
		marginBottom: 6,

		color: theme.colors.black,
		fontSize: theme.fontSizes.regular,
		fontWeight: theme.fontWeights.bold,
	},
	input: {
        borderRadius: 6,
		marginBottom: 6,
		padding: theme.fontSizes.regular / 2,

		backgroundColor: theme.colors.grey,
		color: theme.colors.black,
		fontSize: theme.fontSizes.regular,
	},
	submitButton: {
        alignSelf: 'center',
		textAlign: 'center',
        marginTop: 24,
        marginBottom: 24,
		padding: 10,
		width: '25%',
        
		borderRadius: 6,
        backgroundColor: theme.colors.aqua,
        color: theme.colors.white,
		fontSize: theme.fontSizes.large,
		fontWeight: theme.fontWeights.bold,
	},
    pageSwapText: {
        textAlign: 'center',

        color: theme.links.default,
        fontSize: theme.fontSizes.small,
    },
    pageSwapTextActive: {
        color: theme.links.active,
    },
    pageSwapTextHovered: {
        color: theme.links.hover,
    },
});

export default styles;