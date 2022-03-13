import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  let display = null;
  if (!props.value) {
    display = "-";
  } else {
    display = `Ty: ${props.value.Ty} C: ${props.value.Crestor}`;
  }
  return (
    <button className="square" onClick={props.onClick}>
      {display}
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
        row.push(this.renderSquare(colIdx + rowIdx * this.props.cols));
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
    // TODO: make these vars properties
    const rows = 2;
    const cols = 7;
    const bottles = ["Ty", "Crestor"];
    const squares = [];
    for (let i = 0; i < rows * cols; i++) {
      let counts = {};
      bottles.forEach((med) => {
        counts[med] = 0;
      });
      squares.push(counts);
    }
    this.state = {
      history: [
        {
          squares: squares,
          selectedMed: bottles[0],
        },
      ],
      stepNumber: 0,
      medOptions: bottles,
      selectedMed: bottles[0],
      rows: rows,
      cols: cols,
    };
  }

  handleClick(i) {
    // Square click handler (adds a pill to the Square)
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      // return;
    }
    // slice only creates a shallow copy of the squares, not the squares' counts
    const newCount = Object.create(squares[i]);
    newCount[this.state.selectedMed]++;
    squares[i] = newCount;
    this.setState({
      history: history.concat([
        {
          squares: squares,
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

  setMedication(med) {
    this.setState({
      selectedMed: med,
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
      status = "Your pills have been correctly organized!";
    } else {
      status = "Selected Medication: " + this.state.selectedMed;
    }
    const medOptions = this.state.medOptions.map((i, j) => {
      return (
        <li key={j}>
          <button onClick={() => this.setMedication(i)}>{i}</button>
        </li>
      );
    });

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
        <div className="med-selection">
          <ul>{medOptions}</ul>
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
