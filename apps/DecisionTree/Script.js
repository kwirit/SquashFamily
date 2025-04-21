ta1 = document.getElementById("ta1")
b1 = document.getElementById("b1")
ta2 = document.getElementById("ta2")
b2 = document.getElementById("b2")
b1.addEventListener("click", getTree)
b2.addEventListener("click", predict)

let tree

function getTree(){
    let data = ta1.value
    let rows = data.split("\n")
    let header = rows[0].split(";")
    let objects = []
    for(let row of rows.slice(1,rows.length)){
        row = row.split(";")
        let user = {}
        for(let i = 0;i<header.length;i++){
            user[header[i]] = row[i]
        }
        objects.push(user)
    }
    tree = makeTree(objects,header)
    visualizeTree(tree)
}

function convertToD3Format(tree) {
    // Начинаем с корня дерева
    return transformNode(tree.root);
}

function visualizeTree(tree) {
    // Convert tree to D3 format
    const root = convertToD3Format(tree);

    // Clear previous visualization
    d3.select("#tree-container").html("");

    // Set dimensions and margins
    const margin = {top: 20, right: 90, bottom: 30, left: 90};
    const width = document.getElementById("tree-container").clientWidth;
    const height = document.getElementById("tree-container").clientHeight;

    // Create SVG
    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a group for the zoomable content
    const g = svg.append("g");

    // Create the tree layout
    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    // Assign the data to the hierarchy
    const hierarchy = d3.hierarchy(root);

    // Assign the data to the tree layout
    const treeData = treeLayout(hierarchy);

    // Add links between nodes
    g.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    // Create node groups
    const nodes = g.selectAll(".node")
        .data(treeData.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add circles to nodes
    nodes.append("circle")
        .attr("r", 10);

    // Add node labels
    nodes.append("text")
        .attr("dy", ".35em")
        .attr("y", d => d.children ? -20 : 20)
        .style("text-anchor", "middle")
        .text(d => d.data.name);

    // Add entropy information
    nodes.append("text")
        .attr("dy", "1.5em")
        .style("text-anchor", "middle")
        .text(d => `Entropy: ${d.data.entropy.toFixed(2)}`);

    // Add data length information
    nodes.append("text")
        .attr("dy", "2.5em")
        .style("text-anchor", "middle")
        .text(d => `Samples: ${d.data.samples}`);
}

function convertToD3Format(tree) {
    return transformNode(tree.root);
}

function transformNode(node) {
    let d3Node = {
        name: getNodeLabel(node),
        entropy: parseFloat(node.entropy),
        samples: node.data ? node.data.length : 0,
        children: []
    };

    if (node.firstChild !== null && node.secondChild !== null) {
        d3Node.children.push(transformNode(node.firstChild));
        d3Node.children.push(transformNode(node.secondChild));
    }

    return d3Node;
}

function getNodeLabel(node) {
    if (node.firstChild === null && node.secondChild === null) {
        return `Class: ${node.data[0][Object.keys(node.data[0]).pop()]}`;
    }
    return `${node.predicate[0]} <= ${node.predicate[1]}`;
}

function predict(){
    let data = ta2.value
    data = data.split(";")
    let obj = {}
    for(let i = 0;i<tree.header.length-1;i++){
        obj[tree.header[i]] = data[i]
    }
    console.log(tree)
    passTree(tree,tree.root,obj)
}

