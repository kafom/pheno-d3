var mapMargin = {top: 20, right: 0, bottom: 0, left: 0},
    mapWidth = 960,
    mapHeight = 500 - mapMargin.top - mapMargin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var mapX = d3.scale.linear()
    .domain([0, mapWidth])
    .range([0, mapWidth]);

var mapY = d3.scale.linear()
    .domain([0, mapHeight])
    .range([0, mapHeight]);

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(mapHeight / mapWidth * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select("#chart").append("svg")
    .attr("mapWidth", mapWidth + mapMargin.left + mapMargin.right)
    .attr("mapHeight", mapHeight + mapMargin.bottom + mapMargin.top)
    .style("mapMargin-left", -mapMargin.left + "px")
    .style("mapMargin.right", -mapMargin.right + "px")
  .append("g")
    .attr("transform", "translate(" + mapMargin.left + "," + mapMargin.top + ")")
    .style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
    .attr("class", "grandparent");

grandparent.append("rect")
    .attr("y", -mapMargin.top)
    .attr("mapWidth", mapWidth)
    .attr("mapHeight", mapMargin.top);

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - mapMargin.top)
    .attr("dy", ".75em");

d3.json("flare.json", function(root) {
  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = mapWidth;
    root.dy = mapHeight;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    d.value = 1;
    // return (d._children = d.children)
    //     ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
    //     : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      mapX.domain([d.x, d.x + d.dx]);
      mapY.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }
    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return mapX(d.x) + 6; })
        .attr("y", function(d) { return mapY(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return mapX(d.x); })
        .attr("y", function(d) { return mapY(d.y); })
        .attr("mapWidth", function(d) { return mapX(d.x + d.dx) - mapX(d.x); })
        .attr("mapHeight", function(d) { return mapY(d.y + d.dy) - mapY(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }
});
