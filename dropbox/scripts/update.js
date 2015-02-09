updateChart = function() {
    log("updateChart");
    initialize();
    updateNodes();
    updateChords();
    intervalId=setInterval(onInterval,1);
}

function updateLinks(links) {
    log("updateLinks");
    linkGroup=linksSvg.selectAll("g.links")
        .data(links, function (d,i) {
            return d.Key;
        });

 //   linkGroup.selectAll("g.links").transition(500).style("opacity",1);

    var enter=linkGroup.enter().append("g").attr("class","links");
    var update=linkGroup.transition();


   /*  ARC SEGMENTS */
    enter.append("g")
        .attr("class", "arc")
        .append("path")
        .attr("id",function (d) { return "a_" + d.Key;})
        .style("fill", function(d) { 
            return demColor;
            // return (d.PTY=="DEM") ? demColor : (d.PTY=="REP") ? repColor : otherColor; 
        })
        .style("fill-opacity",.2)
        .attr("d", function (d,i) {
            var newArc={};
            var relatedChord=chordsById[d.parentId];
            newArc.startAngle=relatedChord.currentAngle;
            relatedChord.currentAngle=relatedChord.currentAngle+(1/*Number(d.TRANSACTION_AMT)*//relatedChord.value)*(relatedChord.endAngle-relatedChord.startAngle);
            newArc.endAngle=relatedChord.currentAngle;
            newArc.value=1 /*Number(d.TRANSACTION_AMT)*/;
            var arc=d3.svg.arc(d,i).innerRadius(linkRadius).outerRadius(innerRadius);
            totalContributions+=newArc.value;
            // total.text(formatCurrency(totalContributions));

            return arc(newArc,i);
        })
        .on("mouseover", function (d) { node_onMouseOver(d,"CONTRIBUTION");})
        .on("mouseout", function (d) {node_onMouseOut(d,"CONTRIBUTION"); });

    /* LINKS */
     enter.append("path")
        .attr("class","link")
        .attr("id",function (d) { return "l_" + d.Key;})
        .attr("d", function (d,i) {
              d.links=createLinks(d);
              var diag = diagonal(d.links[0],i);
              diag += "L" + String(diagonal(d.links[1],i)).substr(1);
              diag += "A" + (linkRadius) + "," + (linkRadius) + " 0 0,0 " +  d.links[0].source.x + "," + d.links[0].source.y;

              return diag;
        })
        .style("stroke",function(d) {
            return demColor;
            // return (d.PTY=="DEM") ? demColor : (d.PTY=="REP") ? repColor : otherColor;
          })
        .style("stroke-opacity",.07)
       // .style("stroke-width",function (d) { return d.links[0].strokeWeight;})
        .style("fill-opacity",0.1)
        .style("fill",function(d) { 
            return demColor;
            // return (d.PTY=="DEM") ? demColor : (d.PTY=="REP") ? repColor : otherColor; 
        })
        .on("mouseover", function (d) { node_onMouseOver(d,"CONTRIBUTION");})
        .on("mouseout", function (d) {node_onMouseOut(d,"CONTRIBUTION"); });


        /* NODES */
     enter.append("g")
        .attr("class","node")
        .append("circle")
        .style("fill",function(d) { 
            return demColor;
            // return (d.PTY=="DEM") ? demColor : (d.PTY=="REP") ? repColor : otherColor; 
        })
        .style("fill-opacity",0.2)
        .style("stroke-opacity",1)
        .attr("r", function (d) {
            var relatedNode=nodesById["450820"];
            // var relatedNode=nodesById[d.CAND_ID];
            //Decrement Related Node
            relatedNode.currentAmount=relatedNode.currentAmount/*-Number(d.TRANSACTION_AMT)*/;
            var ratio=((relatedNode.Amount-relatedNode.currentAmount)/relatedNode.Amount);
            return relatedNode.r*ratio;
        })
        .attr("transform", function (d,i) {
            return "translate(" + (d.links[0].target.x) + "," + (d.links[0].target.y) + ")";
        })


      linkGroup.exit().remove();


    function createLinks(d) {
        var target={};
        var source={};
        var link={};
        var link2={};
        var source2={};

        var relatedChord=chordsById[d.parentId];
        // 450820
        var relatedNode=nodesById["450820"];
        // var relatedNode=nodesById[d.id];
        var r=linkRadius;
        var currX=(r * Math.cos(relatedChord.currentLinkAngle-1.57079633));
        var currY=(r * Math.sin(relatedChord.currentLinkAngle-1.57079633));

        var a=relatedChord.currentLinkAngle-1.57079633; //-90 degrees
        relatedChord.currentLinkAngle=relatedChord.currentLinkAngle+(1/*Number(d.TRANSACTION_AMT)*//relatedChord.value)*(relatedChord.endAngle-relatedChord.startAngle);
        var a1=relatedChord.currentLinkAngle-1.57079633;

        source.x=(r * Math.cos(a));
        source.y=(r * Math.sin(a));
        target.x=relatedNode.x-(chordsTranslate-nodesTranslate);
        target.y=relatedNode.y-(chordsTranslate-nodesTranslate);
        source2.x=(r * Math.cos(a1));
        source2.y=(r * Math.sin(a1));
        link.source=source;
        link.target=target;
        link2.source=target;
        link2.target=source2;

        return [link,link2];

    }


 //   console.log("updateLinks()");
}

function updateNodes() {

    var node = nodesSvg.selectAll("g.node")
        .data(docs, function (d,i) {
            return d.id;
        });
        // .data(cands, function (d,i) {
        //     return d.CAND_ID;
        // });


    var enter=node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    enter.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill-opacity", function (d) { return (d.depth < 2) ? 0 : 0.05})
        .style("stroke",function(d) {
            return demColor;
            // return ((d.PTY=='DEM') ? demColor : (d.PTY=="REP") ? repColor : otherColor);
        })
        .style("stroke-opacity", function (d) { return (d.depth < 2) ? 0 : 0.2})
        .style("fill", function(d) {
            return demColor;
            // return ((d.PTY=='DEM') ? demColor : (d.PTY=="REP") ? repColor : otherColor);
        });



    var g=enter.append("g")
        .attr("id", function(d) { 
            return "d_" + d.id; 
            // return "c_" + d.CAND_ID; 
        })
        .style("opacity",0);

        g.append("circle")
        .attr("r", function(d) { return d.r+2; })
        .style("fill-opacity", 0)
        .style("stroke", "#FFF")
        .style("stroke-width",2.5)
        .style("stroke-opacity",.7);

        g.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill-opacity", 0)
        .style("stroke", "#000")
        .style("stroke-width",1.5)
        .style("stroke-opacity",1)
        .on("mouseover", function (d) { node_onMouseOver(d,"CAND"); })
        .on("mouseout", function (d) {node_onMouseOut(d,"CAND"); });


    node.exit().remove().transition(500).style("opacity",0);


    log("updateBubble()");
}

function updateChords() {
    var arcGroup = chordsSvg.selectAll("g.arc")
        .data(chords, function (d) {
            return d.label;
        });

    var enter =arcGroup.enter().append("g").attr("class","arc");

    enter.append("text")
        .attr("class","chord")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { 
            return trimLabel(phenotypeRootsById["phenotypeRoot_" + d.label].name);
            // return trimLabel(psacsById[office + "_" + d.label].CMTE_NM); 
        })
        .on("mouseover", function (d) { node_onMouseOver(d,"PAC");})
        .on("mouseout", function (d) {node_onMouseOut(d,"PAC"); });

    arcGroup.transition()
        .select("text")
        .attr("id",function (d) { return "t_"+ d.label;})
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("fill", "#777")
        .text(function(d) { 
             return trimLabel(cleanName(phenotypeRootsById["phenotypeRoot_" + d.label].name));
            // return trimLabel(psacsById[office + "_" + d.label].CMTE_NM); 
        });



     enter.append("path")
        .style("fill-opacity",0)
        .style("stroke", "#555")
        .style("stroke-opacity",0.4)
        .attr("d", function (d,i) {
                var arc=d3.svg.arc(d,i).innerRadius(innerRadius-20).outerRadius(innerRadius);
                return arc(d.source,i);
            });

    arcGroup.transition()
        .select("path")
        .attr("d", function (d,i) {
            var arc=d3.svg.arc(d,i).innerRadius(innerRadius-20).outerRadius(innerRadius);
            return arc(d.source,i);
        });


    arcGroup.exit().remove();

    log("updateChords()");
}

function trimLabel(label) {
    if (label.length > 25) {
        return String(label).substr(0,25) + "...";
    }
    else {
        return label;
    }
}

function getChordColor(i) {
    var country=nameByIndex[i];
    if (colorByName[country]==undefined) {
        colorByName[country]=fills(i);
    }

    return colorByName[country];
}

update = function(source, row, startOffset) {
    // phenoTree
    if (typeof startOffset == "undefined") {
        startOffset = 0;
    }
    if (typeof source != "undefined") {
        if (typeof drill !== "undefined") {
            if (!drill) {
                childrenNumStack.pop();
            }
        }
        var levelWidth = [1];
        var childCount = function(level, n) {
            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };

        if (typeof source.children !== "undefined") {
            childCount(0, source);
            if (typeof levelWidth[1] !== "undefined") {
                childrenNumStack.push(levelWidth[1]);
            }
        }


        var newHeight = d3.max(childrenNumStack) * (sqheight + 1);
        tree = tree.size([newHeight, treeWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(currentTreeData).reverse(),
            links = tree.links(nodes);

        nodes.forEach(function(d) {

            d.y = d.depth * (sqwidth + 1) + startOffset + horizontalPadding - 20; // final positioning
            if (d.children != null) {
                d.children.forEach(function(d, i) {
                    d.x = sqheight + i * (sqheight + sqspacing) + verticalPadding;
                });
            }
        });

        // Update the nodes…
        var node = svgBoxes.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("mouseover", tooltipMouseOver)
            .on("mouseout", tooltipMouseOut)
            .on("click", function(d) {
                cursorData = d;
                cursorElement["element"].id = "";
                cursorElement["element"].style["stroke"] = "grey";
                this.children[0].id = "cursor";
                cursorElement = {
                    "element": this.children[0],
                    "location": "tree"
                };
                if (typeof d != "undefined") {
                    move(d);
                }
            })
            .on("dblclick", function() {
                createPhenoBox();
            });

        nodeEnter.append("rect") // top majority of phenotype box
        .attr("y", function(d) {
            return sqspacing;
        })
            .attr("x", phenobarheight)
            .attr("width", sqwidth)
            .attr("height", sqheight)
            .attr("class", "childPheno")
            .attr("hpid", function(d) {
                return d.id;
            })
            .style("fill", function(d) {
                return color(d);
            })
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
            .style("stroke-width", "1px")
            .style("stroke", cursor);

        nodeEnter.append("text")
            .attr("y", sqheight / 2)
            .attr("x", function(d) {
                return d.children || d._children ? 55 : 55;
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) {
                try {
                    return cleanName(d.name).substring(0, 10);
                } catch (e) {
                    return "Empty Pheno!";
                }
            })
            .style("fill-opacity", 1e-6)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        nodeUpdate.select("rect")
            .style("stroke-width", "1px")
            .style("stroke", cursor)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
            .style("opacity", function(d) {
                if (cursorData.id == d.id) {
                    return 1.0;
                }

                var lineage = getLineage(cursorData);
                for (var i = 0; i < lineage.length; i++) {
                    if (d.id == lineage[i].id) {
                        return 1.0;
                    }
                }

                var children = cursorData["children"];

                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        if (d.id == children[i].id) {
                            return 1.0;
                        }
                    }
                }

                if (typeof cursorData.parent == "undefined") {
                    return 1.0;
                }

                return 0.6;
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("text")
            .style("fill-opacity", 1e-6)
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            });

        nodeExit.select("rect")
            .style("visibility", function(d) {
                return d.parent == null ? "hidden" : "visible";
            })
        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
}

draw = function(svg, data) {
    svg.selectAll("*").remove();

    var bar = svg.selectAll("g") // the bar which will hold the phenotype boxes.
        .data(data, function(d) {
            return d.order;
        })
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + 0 + ", " + i + ")";
        });

    bar.append("rect") // top majority of phenotype box
    .attr("y", function(d) {
        return (d.order * sqheight) + sqspacing + verticalPadding;
    })
        .attr("x", horizontalPadding)
        .attr("class", "rootPheno")
        .attr("width", sqwidth)
        .attr("height", sqheight)
        .attr("hpid", function(d) {
            return d.id;
        })
        .style("fill", color)
        .on("click", function(d) {
            treeActive = true;
            activerow = d.order - 1;
            cursorData = d;
            if (cursorElement != null) {
                cursorElement["element"].id = "";
            }

            this.id = "cursor";
            cursorElement = {
                "element": this,
                "location": "list"
            };

            var rootPhenos = d3.selectAll(".rootPheno"); // CSS adjustments
            for (var i = 0; i < rootPhenos[0].length; i++) {
                rootPhenos[0][i].style["stroke"] = "";
                rootPhenos[0][i].style["opacity"] = 0.6;
            }
            this.style["stroke"] = "black";
            this.style["opacity"] = 1.0;

            var childPhenos = d3.selectAll(".childPheno"); // CSS adjustments
            for (var i = 0; i < childPhenos[0].length; i++) {
                childPhenos[0][i].style["opacity"] = 0;
                childPhenos[0][i].nextSibling.style["opacity"] = 0;
            }
            prepData(d, data, activerow);
        })
        .on("contextmenu", function(d) {
            d3.event.preventDefault();
        })
        .on("mouseover", function(d) { // tool tip  
            tooltipMouseOver(d);
        })
        .on("mouseout", function(d) {
            tooltipMouseOut(d);
        });

    bar.append("text") // phenotype name
    .attr("y", function(d) {
        return ((d.order * sqheight) + sqheight / 2) + sqspacing + verticalPadding;
    })
        .attr("x", horizontalPadding + 35) // hardcoded until better option is found
    .attr("dy", ".35em")
        .style("font-size", function(d) {
            return 0.15 * sqwidth + "px";
        })
        .style("text-anchor", "middle")
        .attr("pointer-events", "none")
        .text(function(d) {
            return cleanName(d.name).substring(0, 10);
        });

    // attempt to create children boxes.
    var locData = data;
    for (var row = 0; row < locData.length; row++) {
        if (locData[row].children.length > 0) {
            var barChildren = svg.selectAll(locData[row].name) // the bar which will hold the phenotype boxes.
                .data(locData[row].children)
                .enter().append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + 0 + ", " + 0 + ")";
                });

            for (var count = 0; count < locData[row].children.length; count++) {
                var tempName = locData[row].children[count].name;

                barChildren.append("rect") // top majority of phenotype box
                .attr("y", function(d) {
                    return (locData[row].order * (sqheight + sqspacing)) + verticalPadding;
                })
                    .attr("x", function(d) {
                        return ((1 + sqwidth) * (count + sqspacing) + horizontalPadding);
                    })
                    .attr("width", sqwidth)
                    .attr("height", sqheight)
                    .attr("id", count)
                    .attr("class", "childPheno")
                    .attr("row", row)
                    .attr("hpid", function(d) {
                        return d.id;
                    })
                    .style("fill", color)
                    .style("stroke-width", "1px")
                    .style("stroke", cursor)
                    .on("click", function(d) { // for now as the mouseover issues need to be addressed
                        // treeActive = true;
                        // var tempColumn = d3.select(this).attr("id");
                        // var tempRow = d3.select(this).attr("row"); 
                        // cursorData = d;

                        // if (cursorElement != null) {
                        //     cursorElement["element"].id = "";
                        // }
                        // this.id = "cursor";
                        // cursorElement = {"element":this, "location":"list"};

                        // var rootPhenos = d3.selectAll(".rootPheno"); // CSS adjustments
                        // for(var i = 0; i < rootPhenos[0].length; i++) {
                        //    rootPhenos[0][i].style["stroke"] = "";
                        //    rootPhenos[0][i].style["opacity"] = 0.6;
                        // }

                        // var childPhenos = d3.selectAll(".childPheno"); // CSS adjustments
                        // for(var i = 0; i < childPhenos[0].length; i++) {
                        //     childPhenos[0][i].style["opacity"] = 0;
                        //     childPhenos[0][i].nextSibling.style["opacity"] = 0;
                        // }

                        // this.style["stroke"] = "grey";
                        // this.style["opacity"] = 1.0;
                        // this.nextSibling.style["opacity"] = 1.0;

                        // pheno = data[tempRow].children[tempColumn];
                        // prepData(pheno, data, tempRow);
                    })
                    .on("contextmenu", function(d) {
                        d3.event.preventDefault();
                        var tempColumn = d3.select(this).attr("id");
                        var tempRow = d3.select(this).attr("row");
                        removeChild(tempRow, tempColumn);
                    })
                    .on("mouseover", function(d) { // tool tip 
                        var tempColumn = d3.select(this).attr("id");
                        var tempName = "";
                        var tempRow = d3.select(this).attr("row");
                        if (typeof data[tempRow] !== "undefined" &&
                            typeof data[tempRow].children[tempColumn] !== "undefined") {
                            tempName = data[tempRow].children[tempColumn] /*.name*/ ;
                        }

                        div.transition()
                            .duration(200)
                            .style("opacity", 10);
                        div.html("<h3>" + generateBreadCrumb(tempName) + "</h3><br/>") // issue only remembers last name
                        .style("left", 100 + "px") // horizontal
                        .style("top", 50 + "px"); // vertical
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                barChildren.append("text") // phenotype name
                .attr("y", function(d) {
                    return ((locData[row].order) * (sqheight + sqspacing) + sqheight / 2) + sqspacing + verticalPadding;
                })
                    .attr("x", 51 * (count + 1) + horizontalPadding + 55 + (count * 20)) // hardcoded until better option is found
                .attr("dy", ".35em")
                    .style("font-size", function(d) {
                        return 0.15 * sqwidth + "px";
                    })
                    .style("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(function(d) {
                        return cleanName(locData[row].children[count].name).substring(0, 10);
                    });
            }
        }
    }
}