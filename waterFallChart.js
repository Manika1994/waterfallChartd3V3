var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    padding = 0.3;

var formatAxis = d3.format("%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], padding);

var y = d3.scale.linear()
   // .range([height, 0]);
 .range([height - padding, padding]); 
    
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(function(d) { return percentage(d); })
  
    // .tickFormat(formatAxis)
    

  var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0)
     .attr("align","middle");
  

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 

data = [
  {"name":"Quater1","value":420000},
  {"name":"Quater2","value":210000},
   {"name":"Quater3","value":190000}, 
  {"name":"Quater4","value":-170000},
  {"name":"Quater15","value":-140000}
   
    ];

//function to find all the positive values
var positive_val = data.filter(function(d) { return d.value > 0; });
console.log(JSON.stringify(positive_val));

//function to calculate the sum of all the positive values
var maxSum = positive_val.reduce(function(sum, d) {
   return sum + d.value;
}, 0);
console.log("The maximum sum is "+maxSum);

//to calculate the new Domain by adding 120 
var yaxisRange=maxSum+120;
console.log("The y axis sum is "+yaxisRange);

var newDomain=percentage(yaxisRange);
console.log(newDomain);
var newDomain = newDomain.replace(/[!@#$%^&*]/g, "");
console.log(newDomain);

  // Transform data (i.e., finding cumulative values and total) for easier charting
  var cumulative = 0;
  for (var i = 0; i < data.length; i++) {
    data[i].start = cumulative;
    cumulative += data[i].value;
    data[i].end = cumulative;

    data[i].class = ( data[i].value >= 0 ) ? 'positive' : 'negative'
  }
  data.push({
    name: 'Total',
    end: cumulative,
    start: 0,
    class: 'total',
    value: cumulative
  });

  x.domain(data.map(function(d) { return d.name; }));
 y.domain([0, d3.max(data, function(d) { return d.end; })]);

  //var y_domain = ([0, d3.max(data, function(d) { return d.end; })]);
// y.domain( y_domain);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var bar = chart.selectAll(".bar")
      .data(data)
    .enter().append("g")
      .attr("class", function(d) { return "bar " + d.class })
      .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

  bar.append("rect")
       //.attr("y", function(d) { return y(d.value); })
      .attr("y", function(d) { return y( Math.max(d.start, d.end) ); })
      .attr("height", function(d) { return Math.abs( y(d.start) - y(d.end) );  })
      //function to draw the tooltip
      .attr("width", x.rangeBand()).on("mouseover", function(d) {
     // to find the parent node,to calculate the x position
     var parentG = d3.select(this.parentNode);
     var barPos = parseFloat(parentG.attr('transform').split("(")[1]);
     var xPosition = barPos+x.rangeBand()/2;
      //to find the y position
     var yPosition = parseFloat(d3.select(this).attr("y"))+ Math.abs( y(d.start) - y(d.end))/2;
           tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);	
          tooltip.html(d.name + "<br/>"  + percentage(d.value))	
                .style("left", xPosition + "px")		
                .style("top",  yPosition + "px");	
            }).on("mouseout", function(d) {		
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);	
        });
  
  bar.append("text")
      .attr("x", x.rangeBand() / 2)
      .attr("y", function(d) { return y(d.end) + 5; })
      .attr("dy", function(d) { return ((d.class=='negative') ? '-' : '') + ".75em" })
      .text(function(d) { return percentage(d.end - d.start);});
  

  bar.filter(function(d) { return d.class != "total" }).append("line")
      .attr("class", "connector")
      .attr("x1", x.rangeBand() + 5 )
      .attr("y1", function(d) { return y(d.end) } )
      .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
      .attr("y2", function(d) { return y(d.end) } )

  
function type(d) {
  d.value = +d.value;
  return d;
}

function percentage(n) {
  n = Math.round(n);
  var result = n;
  if (Math.abs(n) > 100) {
    result = Math.round(n/100) + '%';
  }
  return  result;
}


