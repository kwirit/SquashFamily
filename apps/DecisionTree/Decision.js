class Node{
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

function mse(data,header){
    let pred = 0
    let mse = 0
    for(let object of data){
        pred += parseFloat(object[header[header.length-1]])
    }
    pred = pred / data.length
    for(let object of data){
        mse += Math.pow(parseFloat(object[header[header.length-1]]) - pred, 2)
    }
    mse = mse / data.length
    return mse
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

class classificationDecisionTree{
    constructor(data,header,amountOfClasses, maxDepth, maxSamples) {
        this.root = new Node()
        this.root.data = data
        this.header = header
        this.maxDepth = maxDepth
        this.maxSamples = maxSamples
        this.root.entropy = ent(data,this.header,amountOfClasses)
        this.buildTree(this.root,amountOfClasses, 0)
    }

    buildTree(node,amountOfClasses, level){
        let parentEntropy = ent(node.data,this.header,amountOfClasses)
        if(parentEntropy === 0 || level === maxDepth || node.data.length === maxSamples){
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
        this.buildTree(firstNode,amountOfClasses, level + 1)
        this.buildTree(secondNode,amountOfClasses, level + 1)
    }
}

class regressionDecisionTree{
    constructor(data,header, maxDepth, maxSamples) {
        this.root = new Node()
        this.root.data = data
        this.header = header
        this.maxDepth = maxDepth
        this.maxSamples = maxSamples
        this.root.entropy = mse(data,this.header)
        this.buildTree(this.root, 0)
    }

    buildTree(node, level){
        let parentEntropy = mse(node.data,this.header)
        if(parentEntropy === 0 || level === this.maxDepth || node.data.length === this.maxSamples){
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
                    let firstSetEntropy = mse(firstSet,this.header)
                    let secondSetEntropy = mse(secondSet,this.header)
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
        this.buildTree(firstNode,level + 1)
        this.buildTree(secondNode, level + 1)
    }
}

function makeClassificationTree(data,header, maxDepth, maxSamples){
    let amountOfClasses = new Set()
    for(let i = 0;i<data.length;i++) {
        amountOfClasses.add(data[i][header[header.length-1]])
    }
    let tree = new classificationDecisionTree(data,header,amountOfClasses.size, maxDepth, maxSamples)
    return tree
}

function makeRegressionTree(data,header, maxDepth, maxSamples){
    let tree = new regressionDecisionTree(data,header, maxDepth, maxSamples)
    return tree
}

