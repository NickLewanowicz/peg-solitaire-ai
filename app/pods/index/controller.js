import Controller from '@ember/controller'
import { task, timeout } from 'ember-concurrency'
import { get, set } from '@ember/object'
import { isEmpty } from '@ember/utils'
import computed from 'ember-macro-helpers/computed'
import async from 'async';


export default Controller.extend({
    boardVisable: true,
    dfsSolution: [],
    currBoard: [
        [-1,-1,0,0,0,-1,-1],
        [-1, 0,0,0,0, 1,-1],
        [ 1, 1,0,0,1, 0, 0],
        [ 1, 1,1,0,1, 0, 0],
        [ 1, 0,0,1,1, 0, 0],
        [-1, 0,0,0,1, 1,-1], 
        [-1,-1,0,0,1,-1,-1]
    ],
    bfsBoard: [
        [-1,-1,0,0,0,-1,-1],
        [-1, 0,0,0,0, 1,-1],
        [ 1, 1,0,0,1, 0, 0],
        [ 1, 1,1,0,1, 0, 0],
        [ 1, 0,0,1,1, 0, 0],
        [-1, 0,0,0,1, 1,-1], 
        [-1,-1,0,0,1,-1,-1]
    ],
    startBoard: [
        [-1,-1,0,0,0,-1,-1],
        [-1, 0,0,0,0, 1,-1],
        [ 1, 1,0,0,1, 0, 0],
        [ 1, 1,1,0,1, 0, 0],
        [ 1, 0,0,1,1, 0, 0],
        [-1, 0,0,0,1, 1,-1], 
        [-1,-1,0,0,1,-1,-1]
    ],
    goalBoard: [
        [-1,-1,0,0,0,-1,-1],
        [-1, 0,0,0,0, 0,-1],
        [ 0, 0,0,0,0, 0, 0],
        [ 0, 0,0,1,0, 0, 0],
        [ 0, 0,0,0,0, 0, 0],
        [-1, 0,0,0,0, 0,-1], 
        [-1,-1,0,0,0,-1,-1]
    ],

    dfsTask: task(function * (env) {
        let timeStart = moment.now()
        let posMoves = []
        let stack = []
        let oldMoves = new Set()
        let curr = this.dupState(env)
        let moves = []
        let i = 0
        let k = 0
        let bestSol = 0
        let newMoves = []
        return yield timeout().then(() => {
            while(moves.length < 13) {
                posMoves = this.possibleMoves(curr)
                newMoves = []
                while(posMoves.length > 0){
                    let temp1 = posMoves.pop()
                    for(let x = 0; x<4; x++){
                        newMoves.push(temp1)
                        if(oldMoves.has(temp1.toString())){
                            newMoves.pop()
                            break
                        }
                        temp1 = this.transposeArray(temp1)
                    }

                }
                stack.push(this.dupState(newMoves))
                moves.push(curr)
                
                while(true){
                    while(stack[stack.length-1].length === 0){
                        stack.pop()
                        moves.pop()
                    }
                    curr = this.dupState(stack[stack.length-1].pop())
                    
                    if(!oldMoves.has(curr.toString())){
                        break
                    }else{
                        k++
                    }
                }
                // if(moves.length > bestSol){
                //     bestSol = moves.length
                //     //console.log(moves.length, bestSol, stack.length, i, k)
                //     //console.log(moves.toString())
                // }
                if(i%10000 === 0){
                    console.log(moves.length, bestSol, stack.length, i, k)
                }
                oldMoves.add(curr.toString())
                i++
            }
            this.set('currBoard',curr)
            this.set('dfsSolution',moves)
            console.log(moves)
            console.log(moves.length, bestSol, stack.length, i, k)
            console.log(((moment.now()-timeStart)/1000).toString() + " seconds")
        })
    }),

    dfsBonusTask: task(function * (env) {
        let timeStart = moment.now()
        let posMoves = []
        let stack = []
        let oldMoves = new Set()
        let curr = this.dupState(env)
        let moves = []
        let i = 0
        let k = 0
        let bestSol = 0
        let newMoves = []
        return yield timeout().then(() => {
            while(moves.length < 35) {
                posMoves = this.possibleMoves(curr)
                newMoves = []
                while(posMoves.length > 0){
                    let temp1 = posMoves.pop()
                    newMoves.push(temp1)
                    if(oldMoves.has(temp1.toString())){
                        newMoves.pop()
                        break
                    }

                }
                stack.push(this.dupState(newMoves))
                moves.push(curr)
                
                while(true){
                    while(stack[stack.length-1].length === 0){
                        stack.pop()
                        moves.pop()
                    }
                    curr = this.dupState(stack[stack.length-1].pop())
                    
                    if(!oldMoves.has(curr.toString())){
                        break
                    }else{
                        k++
                    }
                }
                // if(moves.length > bestSol){
                //     bestSol = moves.length
                //     //console.log(moves.length, bestSol, stack.length, i, k)
                //     //console.log(moves.toString())
                // }
                if(i%10000 === 0){
                    console.log(moves.length, bestSol, stack.length, i, k)
                }
                oldMoves.add(curr.toString())
                i++
            }
            this.set('currBoard',curr)
            this.set('dfsSolution',moves)
            console.log(moves)
            console.log(moves.length, bestSol, stack.length, i, k)
            console.log(((moment.now()-timeStart)/1000).toString() + " seconds")
        })
    }),

    dupState (input) {
        let board = []
        for(let i = 0; i<input.length;i++){
            board[i] = input[i].copy()
        }
        return board
    },

    finalPeg (input) {
        let pegs = 0
        for(let i = 0; i<input.length;i++){
            for(let j = 0; j<input[i].length; j++){
                if(input[i][j] === 1){
                    pegs++
                    if(pegs > 1){
                        return false
                    }
                    
                }
            }
        }
        console.log(input, pegs)
        return true
    },

    boardPermEqual(bOne, bTwo) {
        let temp = this.dupState(bTwo)
        for(let x = 0; x<4; x++){
            if(this.boardsEqual(bOne, temp)){
                //console.log(bOne, temp)
                return true
            }
            temp = this.transposeArray(temp)
        }
        if(this.boardsEqual(bOne, temp.reverse()) || this.boardsEqual(bOne, this.transposeArray(temp).reverse())){
            return true
        }
        return false
    },

    updateBoard (input) {
        this.set('currBoard',input)
    },

    transposeArray (matrix){
        matrix = matrix.reverse();
        // swap the symmetric elements
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < i; j++) {
                var temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }

        return matrix
    },

    boardsEqual(bOne, bTwo) {
        return bOne.toString() === bTwo.toString()
    },

    possibleMoves(env) {
        let moves = []
        for (let i = 0; i<env.length; i++) {
            for (let j = 0; j<env[i].length; j++) {
                if(env[i][j] === 0){ 
                    if((j>1) && (env[i][j-1] === 1) && (env[i][j-2] === 1)){
                        moves[moves.length] = this.dupState(env)
                        moves[moves.length-1][i][j] = 1
                        moves[moves.length-1][i][j-1] = 0
                        moves[moves.length-1][i][j-2] = 0
                    }
                    if((j<5) && (env[i][j+1] === 1) && (env[i][j+2] === 1)){
                        moves[moves.length] = this.dupState(env)
                        moves[moves.length-1][i][j] = 1
                        moves[moves.length-1][i][j+1] = 0
                        moves[moves.length-1][i][j+2] = 0
                    } 
                    if((i>1) && (env[i-1][j] === 1) && (env[i-2][j] === 1)){
                        moves[moves.length] = this.dupState(env)
                        moves[moves.length-1][i][j] = 1
                        moves[moves.length-1][i-1][j] = 0
                        moves[moves.length-1][i-2][j] = 0
                    } 
                    if((i<5) && (env[i+1][j] === 1) && (env[i+2][j] === 1)){
                        moves[moves.length] = this.dupState(env)
                        moves[moves.length-1][i][j] = 1
                        moves[moves.length-1][i+1][j] = 0
                        moves[moves.length-1][i+2][j] = 0
                    } 
                }
            }
        }
        return moves
    },
    
    sleep (milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
    },

    actions: {
        depthFirstSearch (env) {
            this.get('dfsTask').perform(env)
        },
       
        breadthFirstSearch (env) {
            let timeStart = moment.now()
            let posMoves = []
            let stack = []
            let levelSize = []
            let oldMoves = new Set()
            let curr = this.dupState(env)
            let moves = []
            let i = 0
            let k = 0
            let bestSol = 0
            let newMoves = []
            while(!this.finalPeg(curr)) {
                posMoves = this.possibleMoves(curr)
                newMoves = []
                while(posMoves.length > 0){
                    let temp1 = posMoves.pop()
                    for(let x = 0; x<4; x++){
                        newMoves.push(temp1)
                        if(oldMoves.has(temp1.toString())){
                            newMoves.pop()
                            break
                        }
                        temp1 = this.transposeArray(temp1)
                    }

                }
                stack.push(this.dupState(newMoves))
                moves.push(curr)
                
                while(true){
                    while(stack[0].length === 0){
                        stack.shift()
                    }
                    curr = this.dupState(stack[0].pop())
                    if(!oldMoves.has(curr.toString())){
                        break
                    }else{
                        k++
                    }
                }
                if(moves.length > bestSol){
                    bestSol = moves.length
                    //console.log(moves.length, bestSol, stack.length, i, k)
                    //console.log(moves.toString())
                }
                oldMoves.add(curr.toString())
                if(i%10000 === 0){
                    console.log(moves.length, bestSol, stack.length, i, k)
                }
                i++
            }
            this.set('bfsBoard',curr)
            console.log(moves.length, bestSol, stack.length, i, k)
            console.log(((moment.now()-timeStart)/1000).toString() + " seconds")
            return moves
            
        },
        
    }
});
