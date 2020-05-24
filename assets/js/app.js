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

// Organize axis information
var xAxes = [
  {"stat" : "poverty",
   "label": "In Poverty (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
   {"stat" : "age",
   "label": "Age (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
   {"stat" : "income",
   "label": "Household Income (Median)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
var yAxes = [
  {"stat" : "obesity",
   "label": "Obese (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
   {"stat" : "smokes",
   "label": "Smokes (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0},
   {"stat" : "healthcare",
   "label": "Lacks Healthcare (%)",
   "min_value" : 100000.0,
   "max_value" : -100000.0}
];
// Retrieve data from the CSV file and execute everything below
var povertyData;
d3.csv("assets/data/data.csv").then(data => {
  // This step is not necessary, but I wanted to eliminate
  // the unnecessary object attributes
  povertyData = data.map(r => {
    xAxes.map(axis => {
      if (r[axis.stat] < axis.min_value) axis.min_value = r[axis.stat];
      if (r[axis.stat] > axis.max_value) axis.max_value = r[axis.stat];
    });
    return Object.fromEntries(
      Object.entries(r).filter(([key, value]) => key != "id" 
                                              && key.slice(-3) != "Moe"
                                              && key.slice(-4) != "High"
                                              && key.slice(-3) != "Low"))
    });
  // Compute the min and max values for each statistic
  

  console.log(povertyData);
  console.log(xAxes);
}
);
