// Width and height for the SVG
const width = 960,
    height = 960;
let years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

const projection = d3.geoMercator()
    .center([-73.93, 40.74])
    .scale(148000)
    .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

const colorScale = d3.scaleOrdinal()
    .domain(years)
    .range(d3.schemeTableau10);

const svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

// NYC geojson
d3.json("data/Borough Boundaries.geojson").then(function(geojson) {
    svg.selectAll(".nyc")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("class", ".nyc")
        .attr("d", pathGenerator)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5");
});

// Citbike Stations
let curr_year = 2013;
let stations = [];
d3.csv("data/stations_by_year.csv").then(data => {
    stations = data;
    addStations(curr_year);
});

// add stations to map
function addStations(year) {
    svg.selectAll("circle").remove();
    const filterYear = stations.filter(d => +d.year === year);
    const circles = svg.selectAll(`circle.year${year}`).data(filterYear);

    circles
        .enter()
        .append("circle")
        .merge(circles)
        .attr("class", `year${year}`)
        .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
        .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
        .attr("r", 1)
        .attr("fill", "grey");
};

// trip paths
const tripFiles = [
    { year: 2013, path: "data/route_2013.geojson" },
    { year: 2014, path: "data/route_2014.geojson" },
    { year: 2015, path: "data/route_2015.geojson" },
    { year: 2016, path: "data/route_2016.geojson" },
    { year: 2017, path: "data/route_2017.geojson" },
    { year: 2018, path: "data/route_2018.geojson" },
    { year: 2019, path: "data/route_2019.geojson" },
    { year: 2020, path: "data/route_2020.geojson" },
    { year: 2021, path: "data/route_2021.geojson" },
    { year: 2022, path: "data/route_2022.geojson" },
    { year: 2023, path: "data/route_2023.geojson" },
    { year: 2024, path: "data/route_2024.geojson" }
];

tripPaths = {};

function processTripGeoJSON(files) {

    files.forEach(file => {
        d3.json(file.path).then(data => {
            yearTrips = data.flatMap(d => d.features);
            geoData = { type: "FeatureCollection", features: yearTrips };
            tripPaths[file.year] = geoData;

            if (Object.keys(tripPaths).length === files.length) {
                addTrips(curr_year);
            }
        });
    });
}
processTripGeoJSON(tripFiles);

// add trips
let tripStack = []

function addTrips(year) {

    svg.selectAll(".trips.year" + year)
        .data(tripPaths[year].features)
        .enter()
        .append("path")
        .attr("class", `trips year${year}`)
        .attr("d", pathGenerator)
        .attr("fill", "none")
        .attr("stroke", d => colorScale(year))
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.5);
    tripStack.push(year);
}

function removeTrips(year) {
    svg.selectAll(`.trips.year${year}`).remove();
}

// scrolling logic
var scroll = scroller()
    .container(d3.select('#graphic'));

scroll(d3.selectAll('.step'));

scroll.on('active', function(index) {
    update(index);
});

/*
 * Credit to Jim Vallandingham for everything below
 * https://github.com/vlandham/scroll_demo
 */

var lastIndex = -1;
var activeIndex = 0;

var update = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolled = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolled.forEach(function(i) {
        if (sign === 1) {
            addStations(years[i]);
            addTrips(years[i]);
        } else {
            addStations(years[i]);
            removeTrips(tripStack.pop());
        }

    });
    lastIndex = activeIndex;
};

/**
 * scroller - handles the details of figuring out which section
 * the user is currently scrolled to.
 */
function scroller() {
    var container = d3.select('body');
    // event dispatcher
    var dispatch = d3.dispatch('active', 'progress');

    // d3 selection of all the text sections that will be scrolled through
    var sections = null;

    // array that will hold the y coordinate of each section that is scrolled through
    var sectionPositions = [];
    var currentIndex = -1;
    // y coordinate of
    var containerStart = 0;

    /**
     * scroll - constructor function.
     * Sets up scroller to monitor scrolling of els selection.
     *
     * @param els - d3 selection of elements that will be scrolled through by user.
     */
    function scroll(els) {
        sections = els;

        // when window is scrolled call position. When it is resized call resize.
        d3.select(window)
            .on('scroll.scroller', position)
            .on('resize.scroller', resize);

        // manually call resize initially to setup scroller.
        resize();

        // hack to get position to be called once for the scroll position onload.
        // @v4 timer no longer stops if you return true at the end of the callback function - so here we stop it explicitly.
        var timer = d3.timer(function() {
            position();
            timer.stop();
        });
    }

    /**
     * resize - called initially and also when page is resized. Resets the sectionPositions
     */
    function resize() {
        // sectionPositions will be each sections
        // starting position relative to the top
        // of the first section.
        sectionPositions = [];
        var startPos;
        sections.each(function(d, i) {
            var top = this.getBoundingClientRect().top;
            if (i === 0) {
                startPos = top;
            }
            sectionPositions.push(top - startPos);
        });
        containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
    }

    /**
     * position - get current users position.
     * if user has scrolled to new section,
     * dispatch active event with new section
     * index.
     *
     */
    function position() {
        var pos = window.pageYOffset - 10 - containerStart;
        var sectionIndex = d3.bisect(sectionPositions, pos);
        sectionIndex = Math.min(sections.size() - 1, sectionIndex);

        if (currentIndex !== sectionIndex) {
            // @v4 you now `.call` the dispatch callback
            dispatch.call('active', this, sectionIndex);
            currentIndex = sectionIndex;
        }

        var prevIndex = Math.max(sectionIndex - 1, 0);
        var prevTop = sectionPositions[prevIndex];
        var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
        // @v4 you now `.call` the dispatch callback
        dispatch.call('progress', this, currentIndex, progress);
    }

    /**
     * container - get/set the parent element
     * of the sections. Useful for if the
     * scrolling doesn't start at the very top
     * of the page.
     *
     * @param value - the new container value
     */
    scroll.container = function(value) {
        if (arguments.length === 0) {
            return container;
        }
        container = value;
        return scroll;
    };

    // @v4 There is now no d3.rebind, so this implements
    // a .on method to pass in a callback to the dispatcher.
    scroll.on = function(action, callback) {
        dispatch.on(action, callback);
    };

    return scroll;
}