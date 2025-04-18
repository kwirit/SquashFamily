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
        this.buildTree(this.root, header,amountOfClasses)
    }
    buildTree(node,header,amountOfClasses){
        let parentEntropy = ent(node.data,header,amountOfClasses);
        if(parentEntropy === 0){
            return 1
        }
        let predicates = []
        let informationGain = -1
        let firstResultSet
        let secondResultSet
        let firstResultEntropy
        let secondResultEntropy
        let resultPredicate
        for(let key of header.slice(0,-1)) {
            let colms = new Set()
            for (let i = 0; i < node.data.length; i++) {
                colms.add(node.data[i][key])
            }
            colms = Array.from(colms)
            predicates.push(colms)
        }
        for(let i = 0;i<predicates.length;i++){
            let firstSet = []
            let secondSet = []
            for(let j = 0;j<predicates[i].length;j++){
                let predicate = parseInt(predicates[i][j])
                for(let object of node.data){
                    if(parseInt(object[header[i]]) <= predicate){
                        firstSet.push(object)
                    }
                    else{
                        secondSet.push(object)
                    }
                }
                let firstSetEntropy = ent(firstSet,header,amountOfClasses)
                let secondSetEntropy = ent(secondSet,header,amountOfClasses)
                let tempInformationGain = parentEntropy - (firstSet.length / node.data.length)*firstSetEntropy - (secondSet.length / node.data.length)*secondSetEntropy
                console.log(tempInformationGain)
                if(tempInformationGain > informationGain){
                    informationGain = tempInformationGain
                    firstResultSet = firstSet
                    secondResultSet = secondSet
                    firstResultEntropy = firstSetEntropy
                    secondResultEntropy = secondSetEntropy
                    resultPredicate = predicates[i][j]
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
        this.buildTree(firstNode,header,amountOfClasses)
        this.buildTree(secondNode,header,amountOfClasses)
    }
}

function makeTree(data,header){
    let amountOfClasses = new Set()
    for(let i = 0;i<data.length;i++) {
        amountOfClasses.add(data[i][header[header.length-1]])
    }
    let tree = new DecisionTree(data,header,amountOfClasses.size)
}