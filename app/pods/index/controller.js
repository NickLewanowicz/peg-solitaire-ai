import Controller from '@ember/controller'
import { task, timeout } from 'ember-concurrency'
import { get, set } from '@ember/object'
import { isEmpty } from '@ember/utils'
import computed from 'ember-macro-helpers/computed'
import async from 'async';


export default Controller.extend({
    boardVisable: true,
    results: [],
    dfsSolution: [],
    mode: 1,
    speed: 1,
    heuristic: 1,
    currBoard: [
        [ 2, 2,1,1,1, 2, 2],
        [ 2, 1,1,1,1, 1, 2],
        [ 1, 1,1,0,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 2, 1,1,1,1, 1, 2], 
        [ 2, 2,1,1,1, 2, 2]
    ],
    hardBoard: [
        [ 2, 2,1,1,1, 2, 2],
        [ 2, 1,1,1,1, 1, 2],
        [ 1, 1,1,0,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 2, 1,1,1,1, 1, 2], 
        [ 2, 2,1,1,1, 2, 2]
    ],
    simpleBoard: [
        [ 2, 2,0,0,0, 2, 2],
        [ 2, 0,0,0,0, 1, 2],
        [ 1, 1,0,0,1, 0, 0],
        [ 1, 1,1,0,1, 0, 0],
        [ 1, 0,0,1,1, 0, 0],
        [ 2, 0,0,0,1, 1, 2], 
        [ 2, 2,0,0,1, 2, 2]
    ],
    
    search: task(function * (mode,env) {
        let timeStart = moment.now()
        let posMoves = []
        let stack = []
        let oldMoves = new Set()
        let curr = {
            board:this.dupState(env),
            parent: null
        }
        let moves = []
        let i = 0
        let k = 0
        let bestSol = 0
        let newMoves = []
        while(!this.finalPeg(curr.board)) {
            posMoves = this.possibleMoves(curr)
            newMoves = []
            while(posMoves.length > 0){
                let temp1 = posMoves.pop()
                if(!oldMoves.has(temp1.board.toString())){
                    newMoves.push(temp1)
                }
            }
            stack.push(newMoves)
            
            if(mode === 1){
                while(stack.length > 0 && stack[stack.length-1].length === 0){
                    stack.pop()
                }
                curr = stack[stack.length-1].pop()
            }else if(mode === 2){
                while(oldMoves.has(curr.board.toString())){
                    while(stack.length > 0 && stack[0].length === 0){
                        stack.shift()
                    }
                    curr = stack[0].pop()
                }
            }

            if(i%10000 === 0){
                let a = curr
                let x = 0
                while(a !== null){
                    x++
                    a = a.parent
                }
                console.log(x)
                console.log(bestSol, stack.length, i, k)
            }
            oldMoves.add(curr.board.toString())
            i++
        }
        this.get('results').push({
            finalState: curr,
            time: (moment.now()-timeStart)/1000,
            checks: i
        })
        debugger
        let x = 0
        while(curr !== null){
            moves.push(curr.board)
            curr = curr.parent
        }
        
        this.get('playMoves').perform(moves)
        console.log(x)
        console.log(curr)
        console.log(moves.length, bestSol, stack.length, i, k)
        console.log(((moment.now()-timeStart)/1000).toString() + " seconds")
    }),

    aStarSearch: task(function * (env){
        let timeStart = moment.now()
        let curr = {
            board:this.dupState(env),
            parent: null,
            score: 0
        }
        let moves = []
        let open = new Map()
        let closed = new Set()
        let pegs = 35
        let i =0
        while (!this.finalPeg(curr.board))  {
            let newMoves = this.possibleMoves(curr)
            while(newMoves.length > 0){
                let temp1 = newMoves.pop()
                if(!closed.has(temp1.board.toString())){
                    if(open.has(temp1.score)){
                        open.get(temp1.score).push(temp1)
                    }else{
                        open.set(temp1.score, [temp1])
                    }
                }
            }
            while(open.get(Math.min.apply(null,Array.from(open.keys())))[0] == undefined){
                open.delete(Math.min.apply(null,Array.from(open.keys())))[0]
            }
            curr = open.get(Math.min.apply(null,Array.from(open.keys()))).pop()
            
            i++
            if(i%10000 === 0){
                console.log(i, Math.min.apply(null,Array.from(open.keys())), open.size, closed.size)
            }
        }
        while(curr !== null){
            moves.push(curr.board)
            curr = curr.parent
        }
        this.get('results').push({
            finalState: curr,
            time: (moment.now()-timeStart)/1000,
            checks: i
        })
        this.get('playMoves').perform(moves)
        console.log(curr)
        console.log(moves.length)
        console.log(((moment.now()-timeStart)/1000).toString() + " seconds")
    }),

    playMoves: task(function * (moves) {
        yield timeout(1000/this.get('speed'))
        this.set('currBoard',moves.pop())
        if(moves.length > 0){
            this.get('playMoves').perform(moves)
        }
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

    getScore(board){
        let option = this.get('heuristic')

        switch(option){
            case 1:
                return this.numPossibleMoves({board:board})
            case 2:
                return this.numCenterPegs(board)
            case 3:
                return this.numEdgePegs(board)*-1
            case 4:
                debugger
                return this.numPossibleMoves(board) + 
                        this.numCenterPegs(board) + 
                        this.numEdgePegs(board)*-1
        }
    },

    numEdgePegs (i) {
        return i[0][2] + i[0][3] + i[0][4]
             //+ i[1][1] + i[1][5]
             + i[2][0] + i[2][6]
             + i[3][0] + i[3][6]
             + i[4][0] + i[4][6]
             //+ i[5][1] + i[5][5]
             + i[6][2] + i[6][3] + i[6][4]

    },

    numCenterPegs (i) {
        return i[2][2] + i[2][3] + i[2][4]
             + i[3][2] + i[3][3] + i[3][4]
             + i[4][2] + i[4][3] + i[4][4]
    },

    numPossibleMoves (i) {
        return (this.possibleMoves(i)).length
    },

    possibleMoves(parent) {
        let env = this.dupState(parent.board)
        let moves = []
        let mode = this.get('mode')
        let a = null
        for (let i = 0; i<env.length; i++) {
            for (let j = 0; j<env[i].length; j++) {
                if(env[i][j] === 0){ 
                    if((j>1) && (env[i][j-1] === 1) && (env[i][j-2] === 1)){
                        a = this.dupState(env)
                        a[i][j] = 1
                        a[i][j-1] = 0
                        a[i][j-2] = 0
                        moves[moves.length] = {
                            board: a,
                            parent: parent,
                            score: (mode === 3) ? this.getScore(a):0
                        }
                    }
                    if((j<5) && (env[i][j+1] === 1) && (env[i][j+2] === 1)){
                        a = this.dupState(env)
                        a[i][j] = 1
                        a[i][j+1] = 0
                        a[i][j+2] = 0
                        moves[moves.length] = {
                            board: this.dupState(a),
                            parent: parent,
                            score: (mode === 3) ? this.getScore(a):0
                        }
                    } 
                    if((i>1) && (env[i-1][j] === 1) && (env[i-2][j] === 1)){
                        a = this.dupState(env)
                        a[i][j] = 1
                        a[i-1][j] = 0
                        a[i-2][j] = 0
                        moves[moves.length] = {
                            board: this.dupState(a),
                            parent: parent,
                            score: (mode === 3) ? this.getScore(a):0
                        }
                    } 
                    if((i<5) && (env[i+1][j] === 1) && (env[i+2][j] === 1)){
                        a = this.dupState(env)
                        a[i][j] = 1
                        a[i+1][j] = 0
                        a[i+2][j] = 0
                        moves[moves.length] = {
                            board: this.dupState(a),
                            parent: parent,
                            score: (mode === 3) ? this.getScore(a):0
                        }
                    }
                }
            }
        }
        return moves
    },

    actions: {
        depthFirstSearch (env) {
            this.get('dfsTask').perform(env)
        },
        resetDefaults (){
            this.set('currBoard', this.get('hardBoard'))
            this.set('heuristic', 1)
            this.set('speed', 1)
            this.set('mode',1)
        },

        swapBoard (board){
            this.set('currBoard', board)
        },

        heuristicSelect (num){
            this.set('heuristic', num)
        },

        speedSelect (num){
            this.set('speed', num)
        },

        modeSelect (mode){
            this.set('mode', mode)
            
        },

        doSearch (mode) {
            if(mode !== 3){
                this.get('search').perform(mode,this.get('currBoard'))
            }else{
                this.get('aStarSearch').perform(this.get('currBoard'))
            }
        }
        
    }
});
