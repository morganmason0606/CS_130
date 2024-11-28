import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import theme from './design_system.js';

const Graph = ({startDate, endDate, type, data}) => {
  const screenWidth = Dimensions.get('window').width;

  const [dataset, setDataset] = useState([]);     // For populating the charts

  // Bar chart configuration
  const barChartConfig = {
    backgroundGradientFrom: theme.colors.white,
    backgroundGradientTo: theme.colors.white,
    decimalPlaces: 0,                             // Number of decimal places in data
    color: () => theme.colors.aqua,               // Bar color
    labelColor: () => theme.colors.black,         // Label color
    propsForLabels: { 
      fontSize: theme.fontSizes.small,            // Label font size
    },
  }

  // Convert date from YYYY-MM-DD format to MM/DD/YYYY format
  const convertDate = (date) => {
    const newDate = date.split('-');
    return `${newDate[1]}/${newDate[2]}/${newDate[0]}`;
  };

  // Set up daily datasets for pain graphs per body part
  const setupPainDataset = () => {
    // Convert start and end dates to YYYY-MM-DD format
    startDate = startDate.split('/');
    startDate = `${startDate[2]}-${startDate[0]}-${startDate[1]}`;
    endDate = endDate.split('/');
    endDate = `${endDate[2]}-${endDate[0]}-${endDate[1]}`;
    
    // Filter pain notes based on date range
    const filteredPainData = data.filter((entry) => {
      return entry.date >= startDate && entry.date <= endDate;
    });

    // Convert date to MM/DD/YYYY format
    const reformattedPainData = filteredPainData.map((entry) => {
      return {
        date: convertDate(entry.date),
        pain_level: entry.pain_level,
        body_part: entry.body_part,
      };
    })

    // Group pain data by body part
    const bodyPartToData = {};
    reformattedPainData.forEach((entry) => {
      if (bodyPartToData[entry.body_part] === undefined) {
        bodyPartToData[entry.body_part] = [];
      }
      bodyPartToData[entry.body_part].push(entry);
    });

    // Set up datasets (labels and values) for the bar chart (1 dataset per body part)
    const dataset = {};

    // For each body part, calculate average pain level per day
    for (const bodyPart in bodyPartToData) {
      const labels = [];
      const labelsToValues = {};

      // Collect ordered list of dates and all pain levels per date
      bodyPartToData[bodyPart].forEach((entry) => {
        if (labelsToValues[entry.date] === undefined) {   // New date found
          labels.push(entry.date);
          labelsToValues[entry.date] = [];
        }
        labelsToValues[entry.date].push(entry.pain_level);
      });

      // Calculate average
      const averageValue = labels.map((date) => {
        return labelsToValues[date].reduce((a, b) => a + b, 0) / labelsToValues[date].length;
      });

      // Add averages per day to dataset
      dataset[bodyPart] = {labels: labels, datasets: [{data: averageValue},],};
    };
    setDataset(dataset);
  };

  // TODO: Set up weekly datasets for workouts graphs
  const setupWorkoutsDataset = () => {
  };
  
  useEffect(() => {
    // Pain graph per day per body part.
    if (type === 'pain') {
      setupPainDataset('pain');
    }
    else if (type === 'workouts') {
      // TODO: Convert date range to week range for weekly workout data
      setupWorkoutsDataset('workouts');
    }
  }, []);

  return (
    <View style={graphStyles.container}>
      {type === 'pain' && <Text style={graphStyles.graphTitle}>Pain Level Per Day</Text>}

      {/* Display bar chart for each body part */}
      <View style={graphStyles.graphOuterWrapper}>
        {Object.keys(dataset).map((bodyPart) => {
          return (
            <View key={bodyPart} style={[graphStyles.graphInnerWrapper, {width: screenWidth*0.4}]}>
              <Text style={graphStyles.graphSubtitle}>{bodyPart}</Text>
              <BarChart
                chartConfig={barChartConfig}
                data={dataset[bodyPart]}
                width={screenWidth * 0.35}            // 35% of screen width
                height={220}
                fromZero={true}
                style={graphStyles.chart}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const graphStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '1rem',
    backgroundColor: theme.colors.lightAqua,
    marginBottom: '1rem',
  },
  graphOuterWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphTitle: {
    marginBottom: '1rem',
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
  },
  graphInnerWrapper: {
    alignItems: 'center',
    marginHorizontal: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    borderRadius: '1rem',
    backgroundColor: theme.colors.dustyAqua,
  },
  graphSubtitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold,
  },
  chart: {
    marginVertical: '1rem',
    borderRadius: '1rem',
  },
});

export default Graph;
