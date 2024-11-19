import { StyleSheet } from 'react-native';
import theme from './design_system.js';

const styles = StyleSheet.create({
    outerWrapper: {
      flex: 1,
      textAlign: 'left',
      backgroundColor: theme.colors.grey,
    },
    navbar: {                      // TODO: Make navbar sticky.
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
    innerWrapper: {
      paddingHorizontal: 70,
      paddingTop: 50,
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
  });
  
export default styles;