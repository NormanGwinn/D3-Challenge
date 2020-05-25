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
var xAxes = [
  {"statistic" : "poverty",
   "label": "In Poverty (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "age",
   "label": "Age (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "income",
   "label": "Household Income (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
var yAxes = [
  {"statistic" : "obesity",
   "label": "Obese (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "smokes",
   "label": "Smokes (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
  {"statistic" : "healthcare",
   "label": "Lacks Healthcare (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
var currentXStatistic = "poverty";
var currentYStatistic = "healthcare";

// Draw the static part of the chart
// Create an SVG area
var svg = d3
  .select("#scatter")
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
var xLabelsGroup = chartGroup.append("g")
                             .attr("transform", `translate(${axisWidth/2}, ${axisHeight + 20})`);

xAxes.map((axis, i) => {
  xLabelsGroup.append("text")
             .attr("x", 0)
             .attr("y", i * 20)
             .attr("value", axis.statistic) // value to grab for event listener
             .classed("active", true) // axis.statistic == currentXStatistic)
             .text(axis.label);
});

// Create group for y-axis labels
var yLabelsGroup = chartGroup.append("g")
                             .attr("transform", `translate(0, ${axisHeight/2})`);

yAxes.map((axis, i) => {
  yLabelsGroup.append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", 0)
              .attr("y", -i * 20)
              .attr("value", axis.statistic) // value to grab for event listener
              .classed("active", true) // axis.statistic == currentYStatistic)
              .text(axis.label);
});



// Retrieve data from the CSV file and execute everything below
var povertyData;
var circlesGroup;
d3.csv("assets/data/data.csv").then(data => {
  // Select the necessary object attributes
  // Convert numeric fields from strings
  // Test for min & max for each statistic
  povertyData = data.map(r => {
    newRow = {};
    newRow.state = r.state;
    newRow.abbr = r.abbr;

    xAxes.map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    yAxes.map(axis => {
      rFloat = +r[axis.statistic];
      newRow[axis.statistic] = rFloat;
      if (rFloat < axis.min_value) axis.min_value = rFloat;
      if (rFloat > axis.max_value) axis.max_value = rFloat;
    });

    return newRow;
  });

  console.log(povertyData);
  console.log(xAxes);
  console.log(yAxes);

  // append initial circles
  let xLinearScale = xScale(currentXStatistic);
  let yLinearScale = yScale(currentYStatistic);
  circlesGroup = chartGroup.selectAll("circle")
                               .data(povertyData)
                               .enter()
                               .append("circle")
                               .attr("cx", d => xLinearScale(d[currentXStatistic]))
                               .attr("cy", d => yLinearScale(d[currentYStatistic]))
                               .attr("r", 20)
                               .attr("fill", "pink")
                               .attr("opacity", ".5");

  drawChart("poverty", "healthcare");
}
);

function drawChart(newXStatistic, newYStatistic) {
  if (newXStatistic != currentXStatistic) {
    let xLinearScale = xScale(newXStatistic);
    let bottomAxis = d3.axisBottom(xLinearScale);
    var xAxis = chartGroup.append("g")
                          .classed("x-axis", true)
                          .attr("transform", `translate(0, ${axisHeight})`)
                          .call(bottomAxis);
    

    currentXStatistic = newXStatistic;
  }

  if (newYStatistic != currentYStatistic) {
    let yLinearScale = yScale(newYStatistic);
    let leftAxis = d3.axisLeft(yLinearScale);
    chartGroup.append("g")
              .call(leftAxis);


    currentYStatistic = newYStatistic;
  }
  updateToolTip(newXStatistic, newYStatistic);
}

function xScale(xStatistic) {
  let idx = statistic2Index(xStatistic);
  console.log(`In xScale; xStatistic = ${xStatistic}, idx = ${idx}`);
  return d3.scaleLinear()
           .domain([xAxes[idx].min_value * 0.8, xAxes[idx].max_value * 1.2])
           .range([0, axisWidth]);
}

function yScale(yStatistic) {
  let idx = statistic2Index(yStatistic);
  return d3.scaleLinear()
           .domain([yAxes[idx].min_value * 0.8, yAxes[idx].max_value * 1.2])
           .range([axisHeight, 0]);
}

function statistic2Index(statistic) {
  let index = 0;
  switch(statistic) {
    case "age":
    case "smokes":
      index = 1;
      break;
    case "income":
    case "healthcare":
      index = 2;
      break;
  }
  return index;
}

// function used for updating circles group with new tooltip
function updateToolTip(xStatistic, yStatistic) {
  let xIdx = statistic2Index(xStatistic);
  let yIdx = statistic2Index(yStatistic);

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xAxes[xIdx].label}:  ${d[xStatistic]}<br>${yAxes[yIdx].label}:  ${d[yStatistic]}`);
    });

  circlesGroup.call(toolTip)
              .on('mouseover', toolTip.show)
              .on('mouseout', toolTip.hide);
}
