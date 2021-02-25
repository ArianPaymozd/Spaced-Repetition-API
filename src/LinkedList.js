const { request } = require("express")
const LanguageService = require("./language/language-service")

class _Node {
    constructor(value, next) {
        this.value = value
        this.next = next
    }
}

class LinkedList {
    constructor() {
        this.head = null
    }

    insertFirst(item) {
        this.head = new _Node(item, this.head)
    }

    insertLast(item) {
        if (!this.head) {
            this.insertFirst(item)
        } else {
            let currNode = this.head
            while (currNode.next !== null) {
                currNode = currNode.next
            }
            currNode.next = new _Node(item, null)
        }
    }

    insertAt(item, place) {
        if (!this.head) {
            console.log("empty list") 
            return
        } else {
            let currNode = this.head
            let prevNode = this.head
            let currPlace = 1

            while (currPlace < place) {
                if (currNode.next == null) {
                    console.log("key not found")
                    return
                }
                currPlace++
                prevNode = currNode
                currNode = currNode.next
                
            }
            let newNode = new _Node(item, currNode.next)
            currNode.next = newNode
        }
    }

    insertAfter(item, key) {
        if (!this.head) {
            console.log("empty list") 
            return
        } else {
            let currNode = this.head
            let prevNode = this.head

            while (currNode.value !== key) {
                if (currNode.next == null) {
                    console.log("key not found")
                    return
                }
                currNode = currNode.next
                prevNode = currNode
            }
            let newNode = new _Node(item, currNode.next)
            prevNode.next = newNode
        }
    }

    remove(item) {
        if (!this.head) {
            console.log("empty list")
            return
        } else {
            let currNode = this.head
            let prevNode = this.head

            while (currNode.value !== item) {
                if (currNode.next == null) {
                    console.log("item not found")
                    return
                } else {
                    prevNode = currNode
                    currNode = currNode.next
                }
            }
            prevNode.next = currNode.next
        }
    }
}

module.exports = LinkedList