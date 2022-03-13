import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Organizer extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
      />
    );
  }

  render() {
    let squares = [];
    for (let rowIdx = 0; rowIdx < this.props.rows; rowIdx++) {
      let row = [];
      for (let colIdx = 0; colIdx < this.props.cols; colIdx++) {
        row.push(this.renderSquare(colIdx * this.props.cols + rowIdx));
      }
      squares.push(
        <div key={rowIdx} className="board-row">
          {row}
        </div>
      );
    }
    return <div>{squares}</div>;
  }
}

class Session extends React.Component {
  // Session trying to match fulfill pill instructions
  constructor(props) {
    super(props);
    const rows = 2;
    const cols = 7;
    let bottles = ["Ty", "Crestor"];
    // TODO: history needs to be mapping (perscription to number of pills) instead of the x/O text
    this.state = {
      history: [
        {
          squares: Array(rows * cols).fill(null),
        },
      ],
      stepNumber: 0,
      selectedMed: bottles[0],
      rows: rows,
      cols: cols,
    };
  }

  handleClick(i) {
    // Square click handler
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.selectedMed;
    this.setState({
      history: history.concat([
        {
          squares: squares, // this will be a count by med
          selectedMed: this.state.selectedMed,
        },
      ]),
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      selectedMed: this.state.history[step].selectedMed,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ? "Go to move #" + move : "Go to session start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Your pill have been correctly organized!";
    } else {
      status = "Selected Medication: " + this.state.selectedMed;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Organizer
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            rows={this.state.rows}
            cols={this.state.cols}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

class OverLord extends React.Component {
  // Handle modifications to game config here
  // - (row/col changes)
  // - instruction changes
  render() {
    return (
      <div>
        <div>
          <h1>Pill Master 3000</h1>
        </div>
        <Session />
      </div>
    );
  }
}
// ========================================

ReactDOM.render(<OverLord />, document.getElementById("root"));

function calculateWinner(squares) {
  // no winner yet
  // TODO: determine if pill org instructions have been met for all percriptions
  return null;
}
