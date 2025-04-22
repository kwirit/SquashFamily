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
    console.log(tree)
    visualizeTree(tree)
}

function convertToD3Format(tree) {
    return transformNode(tree.root);
}

function visualizeTree(tree) {
    const root = convertToD3Format(tree);

    d3.select("#tree-container").html("");

    const width = document.getElementById("tree-container").clientWidth;
    const height = document.getElementById("tree-container").clientHeight;

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))

    const g = svg.append("g");

    const treeLayout = d3.tree().size([width, height]);

    const hierarchy = d3.hierarchy(root);

    const treeData = treeLayout(hierarchy);

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
        .attr("class", d => d.data.highlighted ? "highlighted" : "");

    nodes.append("text")
        .attr("dy", ".35em")
        .attr("y", d => d.children ? -20 : 20)
        .style("text-anchor", "middle")
        .text(d => d.data.name);

    nodes.append("text")
        .attr("dy", "1.5em")
        .style("text-anchor", "middle")
        .text(d => `Entropy: ${d.data.entropy.toFixed(2)}`);

    nodes.append("text")
        .attr("dy", "2.5em")
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
        return "Class: " + node.data[0][Object.keys(node.data[0]).pop()];
    }
    return node.predicate[0] + "<=" + node.predicate[1]
}

function predict() {
    let data = ta2.value; // Получаем данные из текстового поля
    data = data.split(";"); // Разбиваем по разделителю
    let obj = {}; // Создаем объект для классификации

    // Заполняем объект данными (исключаем последний заголовок, так как это целевая переменная)
    for (let i = 0; i < tree.header.length - 1; i++) {
        obj[tree.header[i]] = data[i];
    }

    // Вызываем passTree, передавая дерево, корневой узел и объект для классификации
    passTree(tree, tree.root, obj);
}

function passTree(tree, node, object) {
    // Сбрасываем подсветку
    d3.selectAll(".node").classed("highlighted", false);

    // Создаем карту для быстрого доступа к D3 узлам
    const nodeMap = new Map();

    // Заполняем карту соответствия
    d3.selectAll(".node").each(function(d) {
        const key = `${d.data.name}_${d.data.entropy}_${d.data.samples}`;
        nodeMap.set(key, this);
    });

    // Функция обхода с подсветкой
    function traverseAndHighlight(node) {
        // Генерируем уникальный ключ для узла
        const key = `${getNodeLabel(node)}_${node.entropy}_${node.data.length}`;

        // Находим соответствующий D3 узел и подсвечиваем
        const d3Node = nodeMap.get(key);
        if (d3Node) {
            d3.select(d3Node).classed("highlighted", true);
        }

        // Проверяем условие предиката
        if (node.firstChild && node.secondChild) {
            const value = parseInt(object[node.predicate[0]]);
            const threshold = parseInt(node.predicate[1]);

            if (value <= threshold) {
                traverseAndHighlight(node.firstChild);
            } else {
                traverseAndHighlight(node.secondChild);
            }
        }
    }

    // Начинаем обход
    traverseAndHighlight(node);
}