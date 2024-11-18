import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import theme from './design_system.js';

export default function Index() {
  const [isHoveredWorkout, setIsHoveredWorkout] = useState(false);
  const [isHoveredHistory, setIsHoveredHistory] = useState(false);
  const [isHoveredNotes, setIsHoveredNotes] = useState(false);
  const [isHoveredLogin, setIsHoveredLogin] = useState(false);
  
  const handleMouseEnter = (page) => {
    switch (page){
      case 'Workout':
        setIsHoveredWorkout(true)
        break;
      case 'History':
        setIsHoveredHistory(true)
        break;
      case 'Notes':
        setIsHoveredNotes(true)
        break;
      case 'Login':
        setIsHoveredLogin(true)
        break;
      default:
        break;
    }
  }
  const handleMouseLeave = (page) => {
    switch (page){
      case 'Workout':
        setIsHoveredWorkout(false)
        break;
      case 'History':
        setIsHoveredHistory(false)
        break;
      case 'Notes':
        setIsHoveredNotes(false)
        break;
      case 'Login':
        setIsHoveredLogin(false)
        break;
      default:
        break;
    }
  }

  return (
    <View style={styles.outerWrapper}>
      
      <View style={styles.navbar}>
        <Link
          href="/workout"
          style={[styles.pageLink, isHoveredWorkout && styles.pageLinkHovered]}
          onMouseEnter={()=>{handleMouseEnter('Workout')}}
          onMouseLeave={()=>{handleMouseLeave('Workout')}}
        >
          Workout
        </Link>

        <Link
          href="/history"
          style={[styles.pageLink, isHoveredHistory && styles.pageLinkHovered]}
          onMouseEnter={()=>{handleMouseEnter('History')}}
          onMouseLeave={()=>{handleMouseLeave('History')}}
        >
          History
        </Link>

        <Link
          href="/notes"
          style={[styles.pageLink, isHoveredNotes && styles.pageLinkHovered]}
          onMouseEnter={()=>{handleMouseEnter('Notes')}}
          onMouseLeave={()=>{handleMouseLeave('Notes')}}
        >
          Notes 
        </Link>

        {/** TODO: Should this change based on registering / logging in/out? */}
        <Link
          href="/login"
          style={[styles.pageLink, isHoveredLogin && styles.pageLinkHovered]}
          onMouseEnter={()=>{handleMouseEnter('Login')}}
          onMouseLeave={()=>{handleMouseLeave('Login')}}
        >
          Login
        </Link>
      </View>

      <Text style={styles.innerWrapper}>Home screen (under construction :D) </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
  },
  navbar: {                      // TODO: Make navbar sticky.
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 50,
    padding: 50,

    backgroundColor: theme.colors.aqua,
  },
  pageLink: {
    color: theme.links.default,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold,
  },
  pageLinkHovered:{
    color: theme.links.hover,
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
