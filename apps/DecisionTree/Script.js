import {loadTemplate} from "../Cluster/utilites.js";

loadTemplate('../../templates/headerAlgorithms.html', 'header-templates');
loadTemplate('../../templates/footer.html', 'footer-templates');

let ta1 = document.getElementById("ta1")
let b1 = document.getElementById("b1")
let ta2 = document.getElementById("ta2")
let b2 = document.getElementById("b2")
let maxDepthValue = document.getElementById("maxDepth")
let maxSamplesValue = document.getElementById("maxSamples")
b1.addEventListener("click", getTree)
b2.addEventListener("click", predict)
let c = document.getElementById("c")
let r = document.getElementById("r")
c.addEventListener("click", switchesC)
r.addEventListener("click", switchesR)

function switchesC() {
    r.checked = false
}

function switchesR() {
    c.checked = false
}

let tree

function getTree() {
    let maxDepth = parseInt(maxDepthValue.value)
    let maxSamples = parseInt(maxSamplesValue.value)
    if (c.checked === false && r.checked === false) {
        alert("Нужно выбрать тип дерева")
        return
    }
    let data = ta1.value
    let rows = data.split("\n")
    let header = rows[0].split(",")
    let objects = []
    for (let row of rows.slice(1, rows.length)) {
        row = row.split(",")
        let user = {}
        for (let i = 0; i < header.length; i++) {
            user[header[i]] = row[i]
        }
        objects.push(user)
    }
    if (c.checked) {
        tree = makeClassificationTree(objects, header, maxDepth, maxSamples)
    } else {
        tree = makeRegressionTree(objects, header, maxDepth, maxSamples)
    }
    console.log(tree)
    visualizeTree(tree)
}

function convertToD3Format(tree) {
    return transformNode(tree.root);
}

function visualizeTree(tree) {
    const root = convertToD3Format(tree)

    d3.select("#tree-container").html("")

    const width = document.getElementById("tree-container").clientWidth
    const height = document.getElementById("tree-container").clientHeight

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))

    const g = svg.append("g")

    const treeLayout = d3.tree().size([width, height])

    const hierarchy = d3.hierarchy(root)

    const treeData = treeLayout(hierarchy)

    g.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    const nodes = g.selectAll(".node")
        .data(treeData.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
        .attr("r", 10)

    nodes.append("text")
        .attr("y", -15)
        .style("text-anchor", "middle")
        .text(d => d.data.name);

    nodes.append("text")
        .attr("y", 25)
        .style("text-anchor", "middle")
        .text(d => c.checked ? `Entropy: ${d.data.entropy.toFixed(2)}` : `MSE: ${d.data.entropy.toFixed(2)}`);

    nodes.append("text")
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text(d => `Samples: ${d.data.samples}`);
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
        return c.checked ? "Class: " + node.data[0][Object.keys(node.data[0]).pop()] : "Value: " + node.data[0][Object.keys(node.data[0]).pop()];
    }
    return node.predicate[0] + "<=" + node.predicate[1]
}

function predict() {
    let data = ta2.value
    data = data.split(",")
    let obj = {}

    for (let i = 0; i < tree.header.length - 1; i++) {
        obj[tree.header[i]] = data[i]
    }
    passTree(tree, tree.root, obj)
}

function passTree(tree, node, object) {
    d3.selectAll(".node").classed("highlighted", false);

    const nodeMap = new Map()

    d3.selectAll(".node").each(function (d) {
        const key = `${d.data.name}_${d.data.entropy}_${d.data.samples}`
        nodeMap.set(key, this)
    });

    function traverseAndHighlight(node) {
        const key = `${getNodeLabel(node)}_${node.entropy}_${node.data.length}`

        const d3Node = nodeMap.get(key)
        if (d3Node) {
            d3.select(d3Node).classed("highlighted", true)
        }

        if (node.firstChild && node.secondChild) {
            const value = parseInt(object[node.predicate[0]])
            const threshold = parseInt(node.predicate[1])

            if (value <= threshold) {
                traverseAndHighlight(node.firstChild)
            } else {
                traverseAndHighlight(node.secondChild)
            }
        }
    }

    traverseAndHighlight(node);
}

