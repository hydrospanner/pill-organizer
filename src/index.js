import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const display = [];
  for (const name in props.value) {
    if (props.value[name]) {
      display.push(`${name}: ${props.value[name]}`);
    }
  }
  const rows = display.map((txt, i) => {
    return <div key={i}>{txt}</div>;
  });
  return (
    <button className="square" onClick={props.onClick}>
      {rows}
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
    const squares = [];
    for (let i = 0; i < this.props.rows * this.props.cols; i++) {
      let counts = {};
      this.props.medications.forEach((med) => {
        // TODO: Would be better to use a medication int PK. This prevent name edit
        counts[med.name] = 0;
      });
      squares.push(counts);
    }
    this.state = {
      history: [
        {
          squares: squares,
          selectedMed: this.props.medications[0],
        },
      ],
      stepNumber: 0,
      medOptions: this.props.medications,
      selectedMed: this.props.medications[0],
      cols: this.props.cols,
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
    newCount[this.state.selectedMed.name]++;
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
      status = "Selected Medication: " + this.state.selectedMed.name;
    }
    const medOptions = this.state.medOptions.map((i, j) => {
      const className = this.state.selectedMed.name === i.name ? "active" : "";
      return (
        <li key={j}>
          <button className={className} onClick={() => this.setMedication(i)}>
            {i.name}
          </button>
        </li>
      );
    });
    const header = this.props.header.map((day, i) => {
      return (
        <div key={i}>
          <h3>{day}</h3>
        </div>
      );
    });

    return (
      <div className="game">
        <div className="board-header">{header}</div>
        <div className="game-board">
          <Organizer
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            rows={this.props.rows}
            cols={this.state.cols}
          />
        </div>
        <div className="med-selection">
          <h5>Select Medication</h5>
          <ul>{medOptions}</ul>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <h3>History</h3>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function Medication(props) {
  return (
    <div>
      <label>
        Name
        <input
          type="text"
          name="name"
          maxLength="100"
          onChange={(e) => props.handleMedChange(e, props.medIdx)}
          required
          value={props.name}
        />
      </label>
      <label>
        Instructions
        <textarea
          name="instructions"
          onChange={(e) => props.handleMedChange(e, props.medIdx)}
          value={props.instructions}
        ></textarea>
      </label>
    </div>
  );
}

class SessionConfig extends React.Component {
  render() {
    const medications = this.props.medications.map((med, i) => {
      return (
        <Medication
          key={i}
          medIdx={i}
          name={med.name}
          instructions={med.instructions}
          handleMedChange={(e, i) => this.props.handleMedChange(e, i)}
        />
      );
    });
    return (
      <div>
        <h2>Session Configuration</h2>
        <input
          value={this.props.rows}
          onChange={this.props.onRowChange}
          type="number"
          min="1"
          max="4"
        ></input>
        <h3>Medications</h3>
        <div>{medications}</div>
        <button onClick={() => this.props.clickAddMedication()} type="button">
          Add Medication
        </button>
      </div>
    );
  }
}

class OverLord extends React.Component {
  // Handle modifications to game config here
  // - (row/col changes)
  // - instruction changes
  constructor(props) {
    super(props);
    this.newMedication = { name: "", instructions: "" };
    this.state = {
      rows: 2,
      medications: [Object.create(this.newMedication)],
      sessionKey: 0,
    };
  }

  incrementSessionKey() {
    this.setState((prevState) => {
      return { sessionKey: prevState.sessionKey + 1 };
    });
  }

  setRows(rowCt) {
    this.setState({
      rows: parseInt(rowCt.target.value),
    });
    this.incrementSessionKey();
  }

  clickAddMedication() {
    const meds = this.state.medications.slice();
    this.setState({
      medications: meds.concat([Object.create(this.newMedication)]),
    });
    this.incrementSessionKey();
  }

  handleMedChange(event, medKey) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    const meds = this.state.medications.slice();
    // use they key to edit the right medication
    meds[medKey][name] = value;
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  render() {
    const days = [
      { name: "Sunday", abbr: "Sun" },
      { name: "Monday", abbr: "Mon" },
      { name: "Tuesday", abbr: "Tue" },
      { name: "Wednesday", abbr: "Wed" },
      { name: "Thursday", abbr: "Thu" },
      { name: "Friday", abbr: "Fri" },
      { name: "Saturday", abbr: "Sat" },
    ];
    return (
      <div>
        <div>
          <h1>Pill Master 3000</h1>
        </div>
        <Session
          rows={this.state.rows}
          key={this.state.sessionKey}
          cols={days.length}
          header={days.map((day) => day.abbr)}
          medications={this.state.medications}
        />
        <SessionConfig
          rows={this.state.rows}
          onRowChange={(i) => this.setRows(i)}
          clickAddMedication={(i) => this.clickAddMedication(i)}
          medications={this.state.medications}
          handleMedChange={(e, k) => this.handleMedChange(e, k)}
        />
      </div>
    );
  }
}
// ========================================

ReactDOM.render(
  <React.StrictMode>
    <OverLord />
  </React.StrictMode>,
  document.getElementById("root")
);

function calculateWinner(squares) {
  // no winner yet
  // TODO: determine if pill org instructions have been met for all percriptions
  return null;
}
