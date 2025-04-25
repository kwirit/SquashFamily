const ta1 = document.getElementById("ta1")
const b1 = document.getElementById("b1")
const ta2 = document.getElementById("ta2")
const b2 = document.getElementById("b2")
const maxDepthValue = document.getElementById("maxDepth")
const maxSamplesValue = document.getElementById("maxSamples")
const classificationCheckbox = document.getElementById("classificationCheckbox")
const regressionCheckbox = document.getElementById("regressionCheckbox")
b1.addEventListener("click", getTree)
b2.addEventListener("click", predict)
classificationCheckbox.addEventListener("click", switchesC)
regressionCheckbox.addEventListener("click", switchesR)

function switchesC() {
    regressionCheckbox.checked = false
}

function switchesR() {
    classificationCheckbox.checked = false
}

let tree = null

function getTree() {
    if(ta1.value === ""){
        alert("Введите выборку")
        return
    }
    let maxDepth = parseInt(maxDepthValue.value)
    let maxSamples = parseInt(maxSamplesValue.value)
    if (classificationCheckbox.checked === false && regressionCheckbox.checked === false) {
        alert("Нужно выбрать тип дерева")
        return
    }
    const data = ta1.value
    const rows = data.split("\n")
    const header = rows[0].split(",")
    let objects = []
    for (let row of rows.slice(1, rows.length)) {
        row = row.split(",")
        let user = {}
        for (let i = 0; i < header.length; i++) {
            user[header[i]] = row[i]
        }
        objects.push(user)
    }
    if (classificationCheckbox.checked) {
        tree = makeTree(objects, header, maxDepth, maxSamples,"classification")
    } else {
        tree = makeTree(objects, header, maxDepth, maxSamples, "regression")
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
        .attr("fill", "white")
        .attr("y", -15)
        .style("text-anchor", "middle")
        .text(d => d.data.name);

    nodes.append("text")
        .attr("fill", "white")
        .attr("y", 25)
        .style("text-anchor", "middle")
        .text(d => classificationCheckbox.checked ? `Entropy: ${d.data.entropy.toFixed(2)}` : `MSE: ${d.data.entropy.toFixed(2)}`);

    nodes.append("text")
        .attr("fill", "white")
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
        return classificationCheckbox.checked ? "Class: " + node.data[0][Object.keys(node.data[0]).pop()] : "Value: " + node.data[0][Object.keys(node.data[0]).pop()];
    }
    return node.predicate[0] + "<=" + node.predicate[1]
}

function predict() {
    if(ta2.value === ""){
        alert("Введите тест")
        return
    }
    if(tree === null){
        alert("Дерево не построено")
        return
    }
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

    function highlightNodes(node) {
        const key = `${getNodeLabel(node)}_${node.entropy}_${node.data.length}`

        const d3Node = nodeMap.get(key)
        if (d3Node) {
            d3.select(d3Node).classed("highlighted", true)
        }

        if (node.firstChild && node.secondChild) {
            const value = parseInt(object[node.predicate[0]])
            const threshold = parseInt(node.predicate[1])

            if (value <= threshold) {
                highlightNodes(node.firstChild)
            } else {
                highlightNodes(node.secondChild)
            }
        }
    }

    highlightNodes(node);
}

async function loadTemplate(url, elementId) {
    const response = await fetch(url);
    if (!response.ok)
        return;
    document.getElementById(elementId).innerHTML = await response.text();
}
loadTemplate('../../templates/footer.html', 'footer-templates');
loadTemplate('../../templates/headerAlgorithms.html', 'header-templates');