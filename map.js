// Width and height for the SVG
const width = 960, height = 960;

const projection = d3.geoMercator()
    .center([-73.93, 40.81]) 
    .scale(148000)
    .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

// display NYC geojson
d3.json("data/Borough Boundaries.geojson").then(function(geojson) {
    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5");
});

// draw each station
d3.csv("data/stations_by_year.csv").then(function(data){
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d=> projection([+d.longitude, +d.latitude])[0])
        .attr("cy", d=> projection([+d.longitude, +d.latitude])[1])
        .attr("r", 1)
        .attr("fill", "black")
})
