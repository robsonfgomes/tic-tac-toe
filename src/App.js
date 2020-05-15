import React, { Component } from 'react';
import './App.css';
import audioPlayX from './audio/play-x.mp3';
import audioPlayO from './audio/play-o.mp3';
import audioGameOver from './audio/game-over.mp3';

function Square(props) {  
  return(
    <div className="square" onClick={props.onClick} id={`square-${props.i}`}>
      <div className={`square-${props.color}`}>{props.value}</div>      
    </div>
  );
}

class Board extends Component {   

  renderSquare(i) {
    return <Square
      value={this.props.squares[i].value}
      onClick={() => this.props.onClick(i)}
      color={this.props.squares[i].color}
      i={i}
    />;
  }  

  render() {    
    return(
      <div>        
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null).map( () => ({value: null, color: 'black'}) ),   
      xIsNext: true,
      score: {
        player: 0,
        draw: 0,
        computer: 0,
      },
      lines: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ],
    };
  }

  async componentDidUpdate() {
    //Bot's turn
    
    if(!this.state.xIsNext
      && !calculateWinner(this.state.squares, this.state.lines) 
      && this.state.squares.find(el => !el.value)) {
      await new Promise(r => setTimeout(r, 500));
      this.botMove();
      this.playAudio(audioPlayO);
    }    
  }

  handleClick(i) {    
    const squares = this.state.squares.slice();  
    const lines = this.state.lines.slice();    

    if(calculateWinner(squares, lines) || squares[i].value) {      
      return;      
    }
        
    squares[i].value = 'X';
    this.playAudio(audioPlayX);    
    this.setState({
      squares: squares,      
      xIsNext: !this.state.xIsNext,
    });    
  }

  //Indicates to computer play a move
  botMove() {    
    const squares = this.state.squares.slice();  
    const lines = this.state.lines.slice();
    let squareToMove;    
    
    //console.log('------------------------------------------')    
    squareToMove = botWinner(squares, lines);
    //console.log('bot winner', squareToMove);
    if(squareToMove === null) {
      squareToMove = playerWinner(squares, lines);      
      //console.log('player winner', squareToMove);    

      if(squareToMove === null) {
        squareToMove = bestMove(squares, lines);  
        //console.log('best move', squareToMove);

        if(squareToMove === null) {
          squareToMove = initialMove(squares);    
          //console.log('initial move', squareToMove);      
        }
      }        
    }
    
    squares[squareToMove].value = 'O';
    this.setState({
      squares: squares,      
      xIsNext: true,
    });    
  }

  async newGame() {     
    const winners = calculateWinner(this.state.squares, this.state.lines);
    const score = {
      player: this.state.score.player,
      draw: this.state.score.draw,
      computer: this.state.score.computer,
    };
    
    if(winners) {
            
      if(this.state.squares[winners.a].value === 'X') {
        score.player++;        
      } else {
        score.computer++;        
      }

      await new Promise(r => setTimeout(r, 2000));
      this.setState({
        squares: Array(9).fill(null).map( () => ({value: null, color: 'black'})),
        xIsNext: true,
        score: score,
      });
      //console.clear();      
    } else {
      if(!this.state.squares.find(el => !el.value)) {        
        score.draw++;
        this.playAudio(audioGameOver);

        await new Promise(r => setTimeout(r, 2000));

        this.setState({          
          squares: Array(9).fill(null).map( () => ({value: null, color: 'black'})),
          xIsNext: true,
          score: score,
        });
      }
    }  
  } 
  
  playAudio(soundFile) {
    let audio = new Audio(soundFile);
    audio.play();
  }

  render() {    
    const squares = this.state.squares.slice();    
    const winners = calculateWinner(squares, this.state.lines);  
    const score = {
      player: this.state.score.player,
      draw: this.state.score.draw,
      computer: this.state.score.computer,
    };

    if(winners) {
      squares[winners.a].color = 'red';
      squares[winners.b].color = 'red';
      squares[winners.c].color = 'red';     
      this.playAudio(audioGameOver);       
    }         


    let status;
    let winner = false;
    if(winner) {
      status = `Winner ${winner}`;
    } else {      
      if(squares.find(el => !el) === null) {
        status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
      } else {
        status = 'Its a draw :)';
      }
    }
    /*
    const moves = history.map((step, move) => {
      const desc = move ? `Go to move #${move}` : 'Go to start';      
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>        
      );
    });
    */

    return (
      <div className="game" onClick={() => this.newGame()}>      
        <div>
          <span className="title">You wont'n beat me. But you can try 😬</span>
          <br/>
        </div>
        <div className="game-board">
          <Board
            squares={squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <br/>          
          <div>            
            <div>You</div>
            <div>-</div>
            <div>Computer</div>
          </div>
          <div>
            <div>{score.player}</div>
            <div>{score.draw}</div>
            <div>{score.computer}</div>
          </div>
        </div>               
      </div>
    );
  }
}

function calculateWinner(squares, lines) {  

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];    
    if (squares[a].value && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {      
      return {a: a, b: b, c: c};
    }
  }
  return null;
}

function bestMove(squares, lines) {  
  let square = null;

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];    
    if (squares[a].value && squares[a].value === 'O' && !squares[b].value && !squares[c].value) {     
      return c;        
    } else if (squares[c].value && squares[c].value === 'O'   && !squares[b].value && !squares[a].value) {
      return a;        
    } else if(squares[b].value && squares[b].value === 'O' && !squares[a].value && !squares[c].value) {
      return a;
    } else if(squares[b].value && squares[b].value === 'O' && squares[a].value && !squares[c].value) {
      return c;
    } else if(squares[b].value && squares[b].value === 'O' && !squares[a].value && squares[c].value) {
      return a;
    } else if(squares[a].value && squares[a].value === 'O' && squares[b].value && !squares[c].value) {
      return c;
    } else if(squares[a].value && squares[a].value === 'O' && !squares[b].value && squares[c].value) {
      return b;
    } else if(squares[c].value && squares[c].value === 'O' && !squares[a].value && squares[c].value) {
      return a;
    } else if(squares[c].value && squares[c].value === 'O' && squares[a].value && !squares[c].value) {
      return c;
    }   
  }

  return square;
}

function botWinner(squares, lines) {
  let square = null;

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];    
    if (squares[a].value && squares[a].value === 'O' && squares[a].value === squares[b].value && !squares[c].value) {     
      square = c;        
    } else if (squares[a].value && squares[a].value === 'O' && squares[a].value === squares[c].value && !squares[b].value) {
      square = b;        
    } else if (squares[b].value && squares[b].value === 'O'  && squares[b].value === squares[c].value && !squares[a].value) {
      square = a;        
    }    
  }

  return square;
}

function playerWinner(squares, lines) {
  let square = null;

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];    
    if (squares[a].value && squares[a].value === 'X'  && squares[a].value === squares[b].value && !squares[c].value) {     
      square = c;        
    } else if (squares[a].value && squares[a].value === 'X'  && squares[a].value === squares[c].value && !squares[b].value) {
      square = b;        
    } else if (squares[b].value && squares[b].value === 'X'  && squares[b].value === squares[c].value && !squares[a].value) {
      square = a;        
    }    
  }

  return square;
}

function initialMove(squares) {
  return !squares[4].value ? 4 : 0;
}

function App() {
  return (
    <div className="container">
      <Game />
    </div>
  );
}

export default App;
