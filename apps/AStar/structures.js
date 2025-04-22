export class UnionFind {
    constructor(size) {
        this.parent = Array.from({length: size}, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX !== rootY) {
            if (this.rank[rootX] > this.rank[rootY]) {
                this.parent[rootY] = rootX;
            } else if (this.rank[rootX] < this.rank[rootY]) {
                this.parent[rootX] = rootY;
            } else {
                this.parent[rootY] = rootX;
                this.rank[rootX]++;
            }
        }
    }
}

export class Queue {
    constructor() {
        this.items = {};
        this.rear = 0;
        this.front = 0;
    }

    append(element) {
        this.items[this.rear++] = element;
    }

    popLeft() {
        if (this.isEmpty())
            return "Queue is empty";
        const item = this.items[this.front];
        delete this.items[this.front++];
        return item;
    }

    popRight() {
        if (this.isEmpty())
            return "Queue is empty";
        const item = this.items[this.rear];
        delete this.items[this.rear++];
        return item;
    }

    peekLeft() {
        if (this.isEmpty())
            return "Queue is empty";
        return this.items[this.front];
    }

    peekRight() {
        if (this.isEmpty())
            return "Queue is empty";
        return this.items[this.rear - 1];
    }

    isEmpty() {
        return this.rear - this.front === 0;
    }

    size() {
        return this.rear - this.front;
    }

    clear() {
        this.items = {};
        this.rear = 0;
        this.front = 0;
    }
}