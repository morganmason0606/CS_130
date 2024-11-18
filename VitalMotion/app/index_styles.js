import { StyleSheet } from 'react-native';
import theme from './design_system.js';

const styles = StyleSheet.create({
    outerWrapper: {
      flex: 1,
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
    // TODO: Placeholder styles. Update when actual content is added.
    innerWrapper: {
      flex: 1,
      textAlign: 'center',
      justifyContent: 'center',
      alignContent: 'center',
      backgroundColor: theme.colors.grey,
    },
  });
  
export default styles;