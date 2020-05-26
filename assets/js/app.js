// Establish dimension for an SVG element
var svgWidth = 960;
var svgHeight = 500;

// Establish margins around a plot to be placed in the SVG element
// The bottom and left margins are larger, to provide room for axis labels
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Compute 
var axisWidth = svgWidth - margin.left - margin.right;
var axisHeight = svgHeight - margin.top - margin.bottom;

// Organize axis information
var xAxes = {
  'poverty' : {'ordinal' : 0, 'statistic' : 'poverty', 'label' : 'In Poverty (%)',
    'min_value' : 100000.0, 'max_value' : -100000.0},
  'age' : {'ordinal' : 1, 'statistic' : 'age', 'label' : 'Age (Median)', 
    'min_value' : 100000.0, 'max_value' : -100000.0},
  'income' : {'ordinal' : 2, 'statistic' : 'income', 'label' : 'Household Income (Median)', 
    'min_value' : 100000.0, 'max_value' : -100000.0},
};

var yAxes = {
  'obesity' : {'ordinal' : 0, 'statistic' : 'obesity', 'label' : 'Obese (%)', 
    'min_value' : 100000.0, 'max_value' : -100000.0},
  'smokes' : {'ordinal' : 1, 'statistic' : 'smokes', 'label' : 'Smokes (%)', 
    'min_value' : 100000.0, 'max_value' : -100000.0},
  'healthcare' : {'ordinal' : 2, 'statistic' : 'healthcare', 'label' : 'Lacks Healthcare (%)', 
    'min_value' : 100000.0, 'max_value' : -100000.0},
};

var currentXStatistic = "none";
var currentYStatistic = "none";

// Draw the static part of the chart
// Create an SVG area
var svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("style","background-color:lightcyan");

// Append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)
                    .attr("fill", "white");

// Create group for x-axis labels
var xLabelsGroup = svg.append("g")
                      .attr("transform", `translate(${margin.left + axisWidth/2}, ${margin.top + axisHeight + 20})`)
                      .selectAll("text")
                      .data(Object.values(xAxes))
                      .enter()
                      .append("text")
                      .attr("x", 0)
                      .attr("y", d => 15 + d.ordinal * 20)
                      .attr("value", d => d.statistic) // value to grab for event listener
                      .attr("id", d => d.statistic)
                      .classed("active", d => d.ordinal == 0)
                      .classed("inactive", d => d.ordinal != 0)
                      .text(d => d.label)
                      .on("click", function() {
                        let newXStatistic = d3.select(this).attr("value");
                        xLabelsGroup.select(`#${currentXStatistic}`).classed("active", false).classed("inactive", true);
                        xLabelsGroup.select(`#${newXStatistic}`).classed("active", true).classed("inactive", false);
                        updateChart(newXStatistic, currentYStatistic);
                      });

// Create group for y-axis labels
var yLabelsGroup = svg.append("g")
                      .attr("transform", `translate(0, ${axisHeight/2})`)
                      .selectAll("text")
                      .data(Object.values(yAxes))
                      .enter()
                      .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("x", 0)
                      .attr("y", d => 20 + d.ordinal * 20)
                      .attr("value", d => d.statistic) // value to grab for event listener
                      .attr("id", d => d.statistic)
                      .classed("active", d => d.ordinal == 0)
                      .classed("inactive", d => d.ordinal != 0)
                      .text(d => d.label)
                      .on("click", function() {
                        let newYStatistic = d3.select(this).attr("value");
                        yLabelsGroup.select(`#${currentYStatistic}`).classed("active", false).classed("inactive", true);
                        yLabelsGroup.select(`#${newYStatistic}`).classed("active", true).classed("inactive", false);
                        updateChart(currentXStatistic, newYStatistic);
                      });

// Retrieve data from the CSV file and execute everything below
var povertyData = null;
var circlesGroup = null;
var xAxisGroup = null;
var yAxisGroup = null;
d3.csv("assets/data/data.csv").then(data => {
  // Select the necessary object attributes
  // Convert numeric fields from strings
  // Test for min & max for each statistic
  povertyData = data.map(r => {
    newRow = {};
    newRow.state = r.state;
    newRow.abbr = r.abbr;

    Object.values(xAxes).map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    Object.values(yAxes).map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    return newRow;
  });

  // Draw the initial chart
  currentXStatistic = Object.keys(xAxes)[0];
  currentYStatistic = Object.keys(yAxes)[0];
  let xLinearScale = xScale(currentXStatistic);
  let yLinearScale = yScale(currentYStatistic);

  // X-axis
  let bottomAxis = d3.axisBottom(xLinearScale);
  xAxisGroup = chartGroup.append("g")
                             .classed("x-axis", true)
                             .attr("transform", `translate(0, ${axisHeight})`)
                             .call(bottomAxis);

  // Y-axis
  let leftAxis = d3.axisLeft(yLinearScale);
  yAxisGroup = chartGroup.append("g")
              .classed("y-axis", true)
              .call(leftAxis);

  // Draw Circles
  circlesGroup = chartGroup.selectAll("circle")
                           .data(povertyData)
                           .enter()
                           .append("circle")
                           .attr("cx", d => xLinearScale(d[currentXStatistic]))
                           .attr("cy", d => yLinearScale(d[currentYStatistic]))
                           .attr("r", 15)
                           .attr("opacity", ".5")
                           .classed("stateCircle", true);

  // Add Text Labels on top of Circles
  abbrGroup = chartGroup.selectAll(".stateText")
                        .data(povertyData)
                        .enter()
                        .append("text")
                        .text(d => d.abbr)
                        .attr("x", d => xLinearScale(d[currentXStatistic]))
                        .attr("y", d => yLinearScale(d[currentYStatistic])+5)
                        .classed("stateText", true);

  // Add Tool Tips for hover on every circle
  updateToolTip(currentXStatistic, currentYStatistic);
}
);

/*
 *     UPDATE CHART
 */
function updateChart(newXStatistic, newYStatistic) {
  const transition_period = 1000;
  let xLinearScale = xScale(newXStatistic);
  let yLinearScale = yScale(newYStatistic);

  if (newXStatistic != currentXStatistic) {
    // Update x-axis
    let bottomAxis = d3.axisBottom(xLinearScale);
    xAxisGroup.transition()
              .duration(transition_period)
              .call(bottomAxis);
    currentXStatistic = newXStatistic;
  }

  if (newYStatistic != currentYStatistic) {
    let leftAxis = d3.axisLeft(yLinearScale);
    yAxisGroup.transition()
              .duration(transition_period)
              .call(leftAxis);
    currentYStatistic = newYStatistic;
  }

  // Update circle positions
  circlesGroup.transition()
              .duration(transition_period)
              .attr("cx", d => xLinearScale(d[newXStatistic]))
              .attr("cy", d => yLinearScale(d[newYStatistic]));

  // Update state abbreviation positions
  abbrGroup.transition()
           .duration(transition_period)
           .attr("x", d => xLinearScale(d[newXStatistic]))
           .attr("y", d => yLinearScale(d[newYStatistic])+5);

  updateToolTip(newXStatistic, newYStatistic);
}

/*
 *     UTILITY FUNCTIONS
 */

function xScale(xStatistic) {
  return d3.scaleLinear()
           .domain([xAxes[xStatistic].min_value * 0.8, xAxes[xStatistic].max_value * 1.2])
           .range([0, axisWidth]);
}

function yScale(yStatistic) {
  return d3.scaleLinear()
           .domain([yAxes[yStatistic].min_value * 0.8, yAxes[yStatistic].max_value * 1.2])
           .range([axisHeight, 0]);
}

// function used for updating circles group with new tooltip
function updateToolTip(xStatistic, yStatistic) {
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xAxes[xStatistic].label}:  ${d[xStatistic]}<br>${yAxes[yStatistic].label}:  ${d[yStatistic]}`);
  });

  circlesGroup.call(toolTip)
              .on('mouseover', toolTip.show)
              .on('mouseout', toolTip.hide);
}
