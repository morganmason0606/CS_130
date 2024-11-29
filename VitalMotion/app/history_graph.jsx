import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import theme from './design_system.js';

const Graph = ({startDate, endDate, type, data}) => {

  const [dataset, setDataset] = useState({});     // For populating the charts

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.colors.white,
    backgroundGradientTo: theme.colors.white,
    decimalPlaces: 0,                             // Number of decimal places in data
    color: () => "rgba(0, 0, 0, 1",               // Bar color
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

    if (!filteredPainData || filteredPainData.length === 0) {
      console.log('No data found within the date range.');
      setDataset({});
      return;
    }

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
      dataset[bodyPart] = {labels: labels, datasets: [
        {
          data: averageValue
        },
        {
          data: [1], // min
          withDots: false,
        },
        {
          data: [10], // max
          withDots: false,
        },],};
    };
    setDataset(dataset);
  };

  // Set up weekly datasets for workouts graphs
  const setupWorkoutsDataset = () => {
    // Filter workout notes based on date range
    const filteredWorkoutData = data.filter((entry) => {
      return entry.date >= startDate && entry.date <= endDate;
    });

    console.log('filteredWorkoutData:', filteredWorkoutData);

    // Exit early if there's no data within the date range
    if (!filteredWorkoutData || filteredWorkoutData.length === 0) {
      console.log('No data found within the date range.');
      setDataset({});
      return;
    }

    // Convert date to MM/DD/YYYY format
    const reformattedWorkoutData = filteredWorkoutData.map((entry) => {
      return {
        date: convertDate(entry.date),
      };
    });

    // Sort workouts by date (earliest to latest)
    reformattedWorkoutData.sort((a, b) => {
      const dateA = a.date.split('/');
      const dateB = b.date.split('/');
      return new Date(dateA[2], dateA[0], dateA[1]) - new Date(dateB[2], dateB[0], dateB[1]);
    });

    console.log('reformattedWorkoutData:', reformattedWorkoutData);

    // Count workouts by week starting from earliest date
    const weekToWorkouts = {};
    reformattedWorkoutData.forEach((entry) => {
      const date = entry.date;
      
      // If weekToWorkouts is empty, add first date (start of the first week)
      if (Object.entries(weekToWorkouts).length === 0){
        weekToWorkouts[date] = 1;
      }
      else {
        const lastDate = Object.keys(weekToWorkouts).pop();

        // Create date objects for comparison (convert strings from MM/DD/YYYY to YYYY/MM/DD and pass then pass into Date constructor)
        const lastDateParts = lastDate.split('/');
        const dateParts = date.split('/');
        const dateObj = new Date(dateParts[2] + '/' + dateParts[0] + '/' + dateParts[1]);
        const lastDateObj = new Date(lastDateParts[2] + '/' + lastDateParts[0] + '/' + lastDateParts[1]);

        // Check if dateObj is within 6 days of lastDateObj
        if ((dateObj - lastDateObj) / (1000 * 60 * 60 * 24) <= 6) {
          weekToWorkouts[lastDate]++;
        }
        else {
          weekToWorkouts[date] = 1;
        }
      }
    });

    console.log('weekToWorkouts:', weekToWorkouts);

    // Set up datasets (labels and values) for the bar chart  (1 dataset for all workouts; 1 bar per week)
    const labels = [];
    const values = [];
    for (const weekStart in weekToWorkouts) {
      let weekEnd = new Date(weekStart);          // weekStart is in MM/DD/YYYY format
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd = weekEnd.toLocaleDateString();     // weekEnd is converted to MM/DD/YYYY format

      labels.push(`${weekStart} to ${weekEnd}`);
      values.push(weekToWorkouts[weekStart]);
    }
    const dataset = {labels: labels, datasets: [
      {
        data: values
      },
      {
        data: [1], // min
        withDots: false,
      },
      {
        data: [10], // max
        withDots: false,
      },
    ],};

    console.log('dataset:', dataset);
    setDataset(dataset);
  };
  
  useEffect(() => {
    // Pain graph per day per body part.
    if (data.length === 0) {
      console.log('No data found within date range.');
      setDataset({});
      return;
    }

    if (type === 'pain') {
      setupPainDataset('pain');
    }
    else if (type === 'workouts') {
      setupWorkoutsDataset('workouts');
    }
  }, [type, data, startDate, endDate]);

  const calculateWidth = (dataPoints, pointWidth = 200) => {
    return dataPoints.length * pointWidth;
  };

  return (
    <View style={graphStyles.container}>
      {Object.entries(dataset).length === 0 &&
        <View>
          <Text style={graphStyles.emptyMessage}>
            No data found within date range.
          </Text>
          <Text style={graphStyles.emptyMessage}>
            Update the range or add data for dates within the range.
          </Text>
        </View>
      }

      {type === 'pain' && Object.keys(dataset).length > 0 &&
        <View>
          <Text style={graphStyles.graphTitle}>Pain Level Per Day</Text>

          {/* Display bar chart for each body part */}
          <View style={graphStyles.graphOuterWrapper}>
            {Object.keys(dataset).map((bodyPart) => {
              if (dataset[bodyPart] !== undefined && dataset[bodyPart].labels && dataset[bodyPart].datasets && dataset[bodyPart].datasets[0].data){  // Extra check if dataset is not empty (addresses map error for BarChart)
                return (
                  <View key={bodyPart} style={[graphStyles.graphInnerWrapper, {width: calculateWidth(dataset[bodyPart].datasets[0].data)+60}]}>
                    <Text style={graphStyles.graphSubtitle}>{bodyPart}</Text>
                    <LineChart
                      chartConfig={chartConfig}
                      data={dataset[bodyPart]}
                      width={calculateWidth(dataset[bodyPart].datasets[0].data)}
                      height={220}
                      segments={5}
                      fromZero={true}
                      style={graphStyles.chart}
                    />
                  </View>
                );
              }
            })}
          </View>
        </View>
      }
      
      {type === 'workouts' && dataset.labels && dataset.datasets && dataset.datasets[0].data &&  // Extra check if dataset is not empty (addresses map error for BarChart)
        <View>
          <Text style={graphStyles.graphTitle}>
            Workouts Completed Per Week From {convertDate(startDate)} to {convertDate(endDate)}
          </Text>

          {/* Display bar chart for workouts */}
          <View style={[graphStyles.graphInnerWrapper, {width: calculateWidth(dataset.datasets[0].data)+120}]}>
            <LineChart
              chartConfig={chartConfig}
              data={dataset}
              width={calculateWidth(dataset.datasets[0].data, 250)}
              height={360}
              segments={5}
              fromZero={true}
              verticalLabelRotation={20}
              style={graphStyles.chart}
            />
          </View>
        </View>
      }
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
    alignSelf: 'center',
    marginBottom: '1rem',
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bolder,
  },
  graphInnerWrapper: {
    alignSelf: 'center',
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
  emptyMessage: {
    textAlign: 'center',
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold,
  },
});

export default Graph;
