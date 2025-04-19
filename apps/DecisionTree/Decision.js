class Node{
    value
    entropy
    predicate
    data
    firstChild
    secondChild
}

function searchMax(values){
    let tmp = -1
    let index
    for(let i = 0;i<values.length;i++){
        if(values[i] > tmp){
            tmp = values[i]
            index = i;
        }
    }
    return index
}

function ent(data,header, amountOfClasses){
    let probabilitiesForEntropy = []
    let p
    for(let i = 0;i<amountOfClasses;i++){
        let count = 0
        for(let object of data){
            let test = object[header[header.length-1]]
            if(parseInt(object[header[header.length-1]]) === i){
                count++
            }
        }
        p = count / data.length
        if( p === 0){
            probabilitiesForEntropy.push(p)
        }
        else{
            probabilitiesForEntropy.push(p*Math.log2(p))
        }
    }
    let s = 0
    for(let i = 0;i<probabilitiesForEntropy.length;i++){
        s += probabilitiesForEntropy[i]
    }
    s= s * -1
    return s
}

class DecisionTree{
    constructor(data,header,amountOfClasses) {
        this.root = new Node()
        this.root.data = data
        this.header = header
        this.root.entropy = ent(data,this.header,amountOfClasses)
        this.buildTree(this.root,amountOfClasses)
    }
    buildTree(node,amountOfClasses){
        let parentEntropy = ent(node.data,this.header,amountOfClasses)
        if(parentEntropy === 0){
            let div = document.createElement('div');
            div.innerHTML = '<div style="border: solid; width: 300px; height: 150px"><p> entropy: '+ node.entropy +'</p><p>samples: ' + node.data.length + '</p><p>blabla</p></div>'
            document.body.append(div);
            node.firstChild = null
            node.secondChild = null
            return
        }
        let predicates = []
        let informationGain = -1
        let firstResultSet
        let secondResultSet
        let firstResultEntropy
        let secondResultEntropy
        let resultPredicate
        for(let key of this.header.slice(0,-1)) {
            let colms = new Set()
            for (let i = 0; i < node.data.length; i++) {
                colms.add(node.data[i][key])
            }
            colms = Array.from(colms)
            predicates.push(colms)
        }
        for(let i = 0;i<predicates.length;i++){
            for(let j = 0;j<predicates[i].length;j++){
                let firstSet = []
                let secondSet = []
                let predicate = parseInt(predicates[i][j])
                for(let object of node.data){
                    if(parseInt(object[this.header[i]]) <= predicate){
                        firstSet.push(object)
                    }
                    else{
                        secondSet.push(object)
                    }
                }
                if(firstSet.length !== 0 && secondSet.length !==0){
                    let firstSetEntropy = ent(firstSet,this.header,amountOfClasses)
                    let secondSetEntropy = ent(secondSet,this.header,amountOfClasses)
                    let tempInformationGain = parentEntropy - (firstSet.length / node.data.length)*firstSetEntropy - (secondSet.length / node.data.length)*secondSetEntropy
                    if(tempInformationGain > informationGain){
                        informationGain = tempInformationGain
                        firstResultSet = firstSet
                        secondResultSet = secondSet
                        firstResultEntropy = firstSetEntropy
                        secondResultEntropy = secondSetEntropy
                        resultPredicate = [this.header[i],predicates[i][j]]
                    }
                }
            }
        }
        let firstNode = new Node()
        let secondNode = new Node()
        firstNode.data = firstResultSet
        firstNode.entropy = firstResultEntropy
        secondNode.data = secondResultSet
        secondNode.entropy = secondResultEntropy
        node.predicate = resultPredicate
        node.firstChild = firstNode
        node.secondChild = secondNode
        let div = document.createElement('div');
        div.innerHTML = '<div style="border: solid; width: 300px; height: 150px; left: 600px; position: relative;"><p> entropy: '+ node.entropy +'</p><p>samples: ' + node.data.length + '</p><p>blabla</p></div>'
        document.body.append(div);
        this.buildTree(firstNode,amountOfClasses)
        this.buildTree(secondNode,amountOfClasses)
    }
}

function makeTree(data,header){
    let amountOfClasses = new Set()
    for(let i = 0;i<data.length;i++) {
        amountOfClasses.add(data[i][header[header.length-1]])
    }
    let tree = new DecisionTree(data,header,amountOfClasses.size)
    return tree
}

function passTree(tree, node, object){
    let div = document.createElement('div');
    if(node.firstChild === null && node.secondChild === null){
        div.innerHTML = '<div style="border: solid"><p> entropy: '+ node.entropy +'</p><p>samples: ' + node.data.length + '</p><p>blabla</p></div>'
        document.body.append(div);
        console.log(node.data[0][tree.header[tree.header.length-1]])
        return
    }
    if(parseInt(object[node.predicate[0]]) <= parseInt(node.predicate[1])){
        div.innerHTML = '<div style="border: solid"><p> entropy: '+ node.entropy +'</p><p>samples: ' + node.data.length + '</p><p>blabla</p></div>'
        document.body.append(div);
        passTree(tree,node.firstChild,object)
    }
    else{
        div.innerHTML = '<div style="border: solid"><p> entropy: '+ node.entropy +'</p><p>samples: ' + node.data.length + '</p><p>blabla</p></div>'
        document.body.append(div);
        passTree(tree,node.secondChild,object)
    }
}