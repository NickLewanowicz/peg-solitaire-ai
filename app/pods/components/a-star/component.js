import Component from '@ember/component'
import { task, timeout } from 'ember-concurrency'
import computed from 'ember-macro-helpers/computed'
//import { priorityQueue } from 'async'

export default Component.extend({
    currBoard: [
        [ 2, 2,1,1,1, 2, 2],
        [ 2, 1,1,1,1, 1, 2],
        [ 1, 1,1,0,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 1, 1,1,1,1, 1, 1],
        [ 2, 1,1,1,1, 1, 2], 
        [ 2, 2,1,1,1, 2, 2]
    ],

    progress: [
        [2,2,0,0,0,2,2],
        [2, 0,0,0,0, 1,2],
        [ 1, 1,0,0,1, 0, 0],
        [ 1, 1,1,0,1, 0, 0],
        [ 1, 0,0,1,1, 0, 0],
        [2, 0,0,0,1, 1,2], 
        [2,2,0,0,1,2,2]
    ],

    open: [],
    closed: [],
    dupState (input) {
        let board = []
        for(let i = 0; i<input.length;i++){
            board[i] = input[i].copy()
        }
        return board
    },

    pegsLeft (input) {
        return (input.toString().match(/1/g) || []).length
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

    allPermutations (input) {
        let temp = this.dupState(input)
        let allPerms = new Set()
        for(let x = 0; x<4; x++){
            temp = this.transposeArray(temp)
            allPerms.add(temp.toString())
            allPerms.add(temp.reverse().toString())
        }
        return allPerms
    },

    boardsEqual(bOne, bTwo) {
        return bOne.toString() === bTwo.toString()
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
    currBoard: computed('progress', function() {
        let progress = this.get('progress')
        this.set('currBoard', progress)
        return progress
    }),


    aStarFast(input) {
        let progress = input
        let open = new Map()
        let closed = new Set()
        let pegs = 35
        let i =0
        while (pegs > 1)  {
            let newMoves = this.possibleMoves(progress)
            while(newMoves.length > 0){
                let curr = newMoves.pop()
                if(!closed.has(curr.toString())){
                    let newPerms = this.allPermutations(curr)
                    newPerms.forEach(function(item) {  
                        closed.add(item)
                    });
                    let cost = pegs
                    if(open.has(cost)){
                        open.get(cost).push(curr)
                    }else{
                        open.set(cost, [curr])
                    }
                }
            }
            while(open.get(Math.min.apply(null,Array.from(open.keys())))[0] == undefined){
                open.delete(Math.min.apply(null,Array.from(open.keys())))[0]
            }
            progress = open.get(Math.min.apply(null,Array.from(open.keys()))).pop()
            
            i++
            pegs = this.pegsLeft(progress)
            if(i%10000 === 0){
                this.set('progress',progress)
                console.log(i,pegs, Math.min.apply(null,Array.from(open.keys())), open.size, closed.size)
            }
        }
        this.set('progress', progress)
        console.log(progress)
      return progress;
    },
    






















    aStar: task({
        progress: [
            [2,2,0,0,0,2,2],
            [2, 0,0,0,0, 1,2],
            [ 1, 1,0,0,1, 0, 0],
            [ 1, 1,1,0,1, 0, 0],
            [ 1, 0,0,1,1, 0, 0],
            [2, 0,0,0,1, 1,2], 
            [2,2,0,0,1,2,2]
        ],
        // progress: [
        //     [ 2, 2,1,1,1, 2, 2],
        //     [ 2, 1,1,1,1, 1, 2],
        //     [ 1, 1,1,0,1, 1, 1],
        //     [ 1, 1,1,1,1, 1, 1],
        //     [ 1, 1,1,1,1, 1, 1],
        //     [ 2, 1,1,1,1, 1, 2], 
        //     [ 2, 2,1,1,1, 2, 2]
        // ],
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
                //  + i[3][0] + i[3][6]
                //  + i[4][0] + i[4][6]
                //  + i[5][1] + i[5][5]
                //  + i[6][2] + i[6][3] + i[6][4]

        },

        numPossibleMoves (i) {
            return (this.possibleMoves(i)).length
        },

        open: [],
        closed: [],
        dupState (input) {
            let board = []
            for(let i = 0; i<input.length;i++){
                board[i] = input[i].copy()
            }
            return board
        },
    
        pegsLeft (input) {
            return (input.toString().match(/1/g) || []).length
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

        allPermutations (input) {
            let temp = this.dupState(input)
            let allPerms = new Set()
            for(let x = 0; x<4; x++){
                temp = this.transposeArray(temp)
                allPerms.add(temp.toString())
                allPerms.add(temp.reverse().toString())
            }
            return allPerms
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
        currBoard: computed('progress', function() {
            let progress = this.get('progress')
            this.set('currBoard', progress)
            return progress
        }),

    
        *perform() {
            let progress = this.get('progress')
            let open = new Map()
            let closed = new Set()
            let pegs = 35
            let i =0
            let timeStart = moment.now()
            while (pegs > 1)  {
                let newMoves = this.possibleMoves(progress)
                while(newMoves.length > 0){
                    let curr = newMoves.pop()
                    if(!closed.has(curr.toString())){
                        let newPerms = this.allPermutations(curr)
                        newPerms.forEach(function(item) {  
                            closed.add(item)
                        });
                        let cost = this.numEdgePegs(curr) + this.numPossibleMoves(curr) 
                        if(open.has(cost)){
                            open.get(cost).push(curr)
                        }else{
                            open.set(cost, [curr])
                        }
                    }
                }
                while(open.get(Math.min.apply(null,Array.from(open.keys())))[0] == undefined){
                    open.delete(Math.min.apply(null,Array.from(open.keys())))[0]
                }
                progress = open.get(Math.min.apply(null,Array.from(open.keys()))).pop()
                
                i++
                pegs = this.pegsLeft(progress)
                if(i%10000 === 0){
                    yield timeout(1)
                    this.set('progress',progress)
                    console.log(i,pegs, open.size, closed.size)
                }
            }
            this.set('progress', progress)
            console.log(progress)
            console.log(((moment.now()-timeStart)/1000).toString() + " seconds", i + " state checks")
          return progress;
        },
      }),
    
    actions: {
        doAStar (input) {
            this.set('currBoard',this.aStarFast(input))
        }

    }
});
