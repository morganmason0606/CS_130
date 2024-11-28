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

      // Sort dates from earliest to latest
      labels.sort((a, b) => {
        const dateA = a.split('/');
        const dateB = b.split('/');
        return new Date(dateA[2], dateA[0], dateA[1]) - new Date(dateB[2], dateB[0], dateB[1]);
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
            <View key={bodyPart} style={[graphStyles.graphInnerWrapper, {width: screenWidth*0.45}]}>
              <Text style={graphStyles.graphSubtitle}>{bodyPart}</Text>
              <BarChart
                chartConfig={barChartConfig}
                data={dataset[bodyPart]}
                width={screenWidth * 0.4}            // 40% of screen width
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
    marginBottom: '0.25rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: theme.colors.lightAqua,
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
    fontWeight: theme.fontWeights.bolder,
  },
  graphInnerWrapper: {
    alignItems: 'center',
    marginHorizontal: '1rem',
    marginBottom: '1rem',
    paddingVertical: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: theme.colors.dustyAqua,
  },
  graphSubtitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold,
  },
  chart: {
    marginVertical: '1rem',
    borderRadius: '0.5rem',
  },
});

export default Graph;
