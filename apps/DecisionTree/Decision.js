class DecisionTree{
    constructor(data,header,amountOfClasses, maxDepth, maxSamples, typeOfTree) {
        this.root = new treeNode(data)
        this.typeOfTree = typeOfTree
        this.header = header
        this.maxDepth = maxDepth
        this.maxSamples = maxSamples
        if(this.typeOfTree === "classification"){
            this.root.entropy = this.ent(data,this.header,amountOfClasses)

        }
        else {
            this.root.entropy = this.mse(data,this.header)
        }
        this.buildTree(this.root,amountOfClasses, 0, typeOfTree)
    }

    ent(data,header, amountOfClasses){
        let probabilitiesForEntropy = []
        let p
        for(let i = 0;i<amountOfClasses;i++){
            let count = 0
            for(let object of data){
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

    mse(data,header){
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

    setPredicates(data){
        let predicates = []
        for(let key of this.header.slice(0,-1)) {
            let colms = new Set()
            for (let i = 0; i < data.length; i++) {
                colms.add(data[i][key])
            }
            colms = Array.from(colms)
            predicates.push(colms)
        }
        return predicates
    }

    findBestInformationGain(data,header,predicates, amountOfClasses, parentEntropy){
        let informationGain = -1
        let firstResultSet
        let secondResultSet
        let firstResultEntropy
        let secondResultEntropy
        let resultPredicate

        for(let i = 0;i<predicates.length;i++){
            for(let j = 0;j<predicates[i].length;j++){
                let firstSet = []
                let secondSet = []
                let predicate = parseInt(predicates[i][j])
                for(let object of data){
                    if(parseInt(object[this.header[i]]) <= predicate){
                        firstSet.push(object)
                    }
                    else{
                        secondSet.push(object)
                    }
                }
                if(firstSet.length !== 0 && secondSet.length !==0){
                    let firstSetEntropy
                    let secondSetEntropy
                    if(this.typeOfTree === "classification"){
                        firstSetEntropy = this.ent(firstSet,this.header,amountOfClasses)
                        secondSetEntropy = this.ent(secondSet,this.header,amountOfClasses)
                    }
                    else{
                        firstSetEntropy = this.mse(firstSet,this.header)
                        secondSetEntropy = this.mse(secondSet,this.header)
                    }
                    let tempInformationGain = parentEntropy - (firstSet.length / data.length)*firstSetEntropy - (secondSet.length / data.length)*secondSetEntropy
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
        return [firstResultSet, secondResultSet,firstResultEntropy, secondResultEntropy,resultPredicate]
    }

    buildTree(node,amountOfClasses, level, typeOfTree){
        let parentEntropy
        if(this.typeOfTree === "classification"){
            parentEntropy = this.ent(node.data,this.header,amountOfClasses)
        }
        else{
            parentEntropy = this.mse(node.data,this.header)
        }
        if(parentEntropy === 0 || level === this.maxDepth || node.data.length === this.maxSamples){
            node.firstChild = null
            node.secondChild = null
            return
        }

        let predicates = this.setPredicates(node.data,this.header)

        const resultData = this.findBestInformationGain(node.data,this.header,predicates,amountOfClasses,parentEntropy)

        const firstNode = new treeNode(resultData[0])
        const secondNode = new treeNode(resultData[1])

        firstNode.entropy = resultData[2]
        secondNode.entropy = resultData[3]
        node.predicate = resultData[4]
        node.firstChild = firstNode
        node.secondChild = secondNode

        this.buildTree(firstNode,amountOfClasses, level + 1, typeOfTree)
        this.buildTree(secondNode,amountOfClasses, level + 1,typeOfTree)
    }
}

class treeNode{
    constructor(data) {
        this.data = data
    }
}

function makeTree(data,header, maxDepth, maxSamples, typeOfTree){
    let amountOfClasses
    if(typeOfTree === "classification") {
        amountOfClasses = new Set()
        for (let i = 0; i < data.length; i++) {
            amountOfClasses.add(data[i][header[header.length - 1]])
        }
    }
    else{
        amountOfClasses = 0
    }
    return new DecisionTree(data, header, amountOfClasses.size, maxDepth, maxSamples, typeOfTree)
}
