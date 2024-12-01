import { StyleSheet } from 'react-native';
import theme from './design_system.js';

const styles = StyleSheet.create({
    outerWrapper: {
      flex: 1,
      textAlign: 'left',
      backgroundColor: theme.colors.offWhite,
    },
    innerWrapper: {
      paddingHorizontal: 70,
      paddingTop: 50,
    },
    navbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 3,
      paddingHorizontal: 40,
      backgroundColor: theme.colors.aqua,
    },
    logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    logo: {
      resizeMode: 'contain',
      width: 200,
    },
    navLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 50,
      padding: 30,
      backgroundColor: theme.colors.aqua,
    },
    pageLink: {
      color: theme.links.light.default,
      fontSize: theme.fontSizes.regular,
      fontWeight: theme.fontWeights.bold,
    },
    pageLinkHovered:{
      color: theme.links.light.hover,
    },
    home: {
      justifyContent: 'center',
    }, 
    homeLogoContainer: {
      backgroundColor: theme.colors.dustyAqua,
      paddingHorizontal: 30,
      paddingTop: 300,
      paddingBottom: 30,
      width: '100%',
      bottom: 0,
    },
    homeLogo: {
      resizeMode: 'contain',
    },
    homeTextContainer: {
      padding: 30,
    },
    homeText: {
      fontSize: theme.fontSizes.large,
    },
    pageTitle: {
      fontSize: theme.fontSizes.larger,
      fontWeight: theme.fontWeights.bold,
      marginVertical: 10,
    },
    pageSubtitle: {
      fontSize: theme.fontSizes.large,
      fontWeight: theme.fontWeights.bold,
    },
    emptyMessage: {
      marginTop: 10,
    },
    iconButton: {
      color: theme.colors.aqua,
    },
  });
  
export default styles;