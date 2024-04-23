
// Width and height for the SVG
const width = 960, height = 960;

const projection = d3.geoMercator()
    .center([-73.93, 40.80]) 
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

// drawing stations
let curr_year = 2013;
let stations = [];

d3.csv("data/stations_by_year.csv").then(data => {
    stations = data;
    addStations(curr_year);
});

function addStations(year) {
    const filterYear = stations.filter(d => +d.year === year);
    const circles = svg.selectAll(`circle.year${year}`).data(filterYear);

    // Exit old elements not present in new data
    //circles.exit().remove();

    // Enter new elements present in the new data
    circles
        .enter()
        .append("circle")
        .merge(circles) // Enter + Update existing circles
        .attr("class", `year${year}`)
        .transition()
        .duration(2)
        .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
        .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
        .attr("r", 1)
        .attr("fill", "black");
}

var scroll = scroller()
    .container(d3.select('#graphic'));

scroll(d3.selectAll('.step'));

scroll.on('active', function(index) {
    update(index);
});

var update = function(index) {
    switch(index) {
        case 1:
            curr_year = 2014;
            break;
        case 2:
            curr_year = 2015;
            break;
        case 3:
            curr_year = 2016;
            break;
        case 4:
            curr_year = 2017;
            break;
        case 5:
            curr_year = 2018;
            break;
        case 6:
            curr_year = 2019;
            break; 
        case 7:
            curr_year = 2020;
            break;
        case 8:
            curr_year = 2021;
            break;
        case 9:
            curr_year = 2022;
            break;
        case 10:
            curr_year = 2023;
            break;
        case 11:
            curr_year = 2024;
            break;                       
      default:
        curr_year = 2013;
        break;
    }
    addStations(curr_year);
};

/*
* Credit to Jim Vallandingham
* https://github.com/vlandham/scroll_demo
*/

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
      var timer = d3.timer(function () {
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
      sections.each(function (d, i) {
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
    scroll.container = function (value) {
      if (arguments.length === 0) {
        return container;
      }
      container = value;
      return scroll;
    };
  
    // @v4 There is now no d3.rebind, so this implements
    // a .on method to pass in a callback to the dispatcher.
    scroll.on = function (action, callback) {
      dispatch.on(action, callback);
    };
  
    return scroll;
  }
  
