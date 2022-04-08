import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMugSaucer,
  faSun,
  faMoon,
  faTrash,
  faPills,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "react-bootstrap/Button";
import {
  ButtonGroup,
  ToggleButton,
  Row,
  Col,
  Form,
  Accordion,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

library.add(faMugSaucer, faSun, faMoon, faTrash, faPills, faBed);

const orgRow = {
  morning: { name: "Morning", icon: "fa-mug-saucer", className: "morning" },
  day: { name: "Noon", icon: "fa-sun", className: "noon" },
  night: { name: "Night", icon: "fa-moon", className: "night" },
  bed: { name: "Bed", icon: "fa-bed", className: "bed" },
};
const organizerModes = [
  { name: "Simple", rows: [orgRow.day] },
  { name: "Morning/Night", rows: [orgRow.morning, orgRow.night] },
  {
    name: "Morning/Noon/Night",
    rows: [orgRow.morning, orgRow.day, orgRow.night],
  },
  {
    name: "Morning/Noon/Night/Bed",
    rows: [orgRow.morning, orgRow.day, orgRow.night, orgRow.bed],
  },
];
const days = [
  { name: "Sunday", abbr: "Sun" },
  { name: "Monday", abbr: "Mon" },
  { name: "Tuesday", abbr: "Tue" },
  { name: "Wednesday", abbr: "Wed" },
  { name: "Thursday", abbr: "Thu" },
  { name: "Friday", abbr: "Fri" },
  { name: "Saturday", abbr: "Sat" },
];

function Square(props) {
  const display = [];
  for (const name in props.medCounts) {
    if (props.medCounts[name][props.colIdx]) {
      display.push(`${name}: ${props.medCounts[name][props.colIdx]}`);
    }
  }
  // display count of each medication in row
  const rows = display.map((txt, i) => {
    return <div key={i}>{txt}</div>;
  });
  return (
    <div className="square-container">
      <div className="square">
        <button onClick={(e) => props.onClick(props.colIdx, props.orgRow.name)}>
          {rows}
        </button>
      </div>
    </div>
  );
}

function OrganizerRow(props) {
  const daySquares = days.map((day, colIdx) => {
    return (
      <Square
        colIdx={colIdx}
        medCounts={props.medCounts[props.orgRow.name]}
        onClick={(e, n) => props.onClick(e, n)}
        orgRow={props.orgRow}
        key={`${props.orgRow.name}-${day.abbr}`}
      />
    );
  });
  return (
    <div key={props.rowIdx} className={`board-row ${props.orgRow.className}`}>
      <div className="square-container">
        <div className="square icon-cell">
          <FontAwesomeIcon icon={props.orgRow.icon} />
        </div>
      </div>
      {daySquares}
    </div>
  );
}

function Organizer(props) {
  const rows = props.organizerMode.rows.map((orgRow, rowIdx) => {
    return (
      <OrganizerRow
        medCounts={props.medCounts}
        rowIdx={rowIdx}
        onClick={(e, n) => props.onClick(e, n)}
        orgRow={orgRow}
        key={orgRow.name}
      />
    );
  });

  return <React.Fragment>{rows}</React.Fragment>;
}

function MoveHistory(props) {
  const history = props.history;
  const moves = history.map((step, move) => {
    let desc = "Go to start";
    if (move) {
      const day = days[step.selectedCol].abbr;
      desc = `${step.selectedMed.name} added to ${day} ${step.selectedRow}`;
    }
    let btnContext = "secondary";
    if (!move) {
      // doesn't have compliance object
    } else if (step.compliance.met) {
      btnContext = "success";
    } else if (step.compliance.exceeded) {
      btnContext = "danger";
    }
    return (
      <Button
        variant={`outline-${btnContext}`}
        onClick={() => props.jumpTo(move)}
        active={move === props.stepNumber}
        key={move}
      >
        {desc}
      </Button>
    );
  });
  return (
    <Row>
      <Col md={6}>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>History</Accordion.Header>
            <Accordion.Body className="history-accordion-body">
              <div className="d-grid gap-1">{moves}</div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Row>
  );
}

class Session extends React.Component {
  // Session trying to match fulfill pill instructions
  constructor(props) {
    super(props);
    // create mapping of Organizer row to mapping of medication to array of
    // cell counts for the Med.
    const rowMeds = {};
    this.props.organizerMode.rows.forEach((row, i) => {
      const medCounts = {};
      this.props.medications.forEach((med, medIdx) => {
        medCounts[med.name] = new Array(days.length).fill(0);
      });
      rowMeds[row.name] = medCounts;
    });
    this.state = {
      history: [
        {
          selectedMed: this.props.medications[0],
          medCounts: rowMeds,
        },
      ],
      stepNumber: 0,
      medOptions: this.props.medications,
      selectedMed: this.props.medications[0],
    };
  }

  /** Organizer cell click handler.
   *
   * i: cell column index
   * rowName: name of Organizer row
   */
  handleClick(i, rowName) {
    // Square click handler (adds a pill to the Square)
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const medCounts = cloneDeep(current.medCounts);
    medCounts[rowName][this.state.selectedMed.name][i]++;
    const compliance = determineCompliance(medCounts, this.props.medications);
    this.setState({
      history: history.concat([
        {
          medCounts: medCounts,
          selectedMed: this.state.selectedMed,
          compliance: compliance,
          selectedRow: rowName,
          selectedCol: i,
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

    const medOptions = this.state.medOptions.map((i, j) => {
      return (
        <ToggleButton
          key={j}
          variant="outline-info"
          type="radio"
          onClick={() => this.setMedication(i)}
          checked={this.state.selectedMed.name === i.name}
        >
          {i.name}
        </ToggleButton>
      );
    });
    const header = days.map((day, i) => {
      return (
        <div key={i}>
          <h3>{day.abbr}</h3>
        </div>
      );
    });
    let moveHistory = "";
    // Show history if there is any
    if (history.length > 1) {
      moveHistory = (
        <MoveHistory
          history={this.state.history}
          stepNumber={this.state.stepNumber}
          jumpTo={(step) => this.jumpTo(step)}
        />
      );
    }

    return (
      <div className="game">
        <div className="board-header">
          <div></div>
          {header}
        </div>
        <div className="game-board">
          <Organizer
            medCounts={current.medCounts}
            onClick={(e, n) => this.handleClick(e, n)}
            organizerMode={this.props.organizerMode}
          />
        </div>
        <Row>
          <Col md>
            <div className="med-selection">
              <h5>Select Medication</h5>
              <ButtonGroup vertical>{medOptions}</ButtonGroup>
            </div>
          </Col>
          <Col md>
            <h3>{this.state.selectedMed.name}</h3>
            <h4>Instructions</h4>
            <div>{this.state.selectedMed.instructions}</div>
          </Col>
        </Row>
        <div className="game-info">{moveHistory}</div>
      </div>
    );
  }
}

function MedicationRule(props) {
  // Rule for how the medication is to be taken.
  const timeOpts = props.organizerMode.rows.map((row, i) => {
    return (
      <Form.Check
        type="checkbox"
        label={row.name}
        name={row.name}
        onChange={(e) =>
          props.handleMedRuleChange(e, props.medIdx, props.ruleIdx)
        }
        key={i}
        id={`med-rule-${props.medIdx}-${props.ruleIdx}-${i}`}
      />
    );
  });

  return (
    <div className="medication-rule">
      <Row>
        <Col sm={4} xs={6}>
          <Form.Group className="mb-2">
            <Form.Label>Take</Form.Label>
            <Form.Control
              value={props.take}
              type="number"
              name="take"
              min={1}
              max={100}
              onChange={(e) =>
                props.handleMedRuleChange(e, props.medIdx, props.ruleIdx)
              }
              required
            />
          </Form.Group>
        </Col>
        <Col sm={4} xs={6}>
          <Form.Check type="checkbox" label="Daily" checked={true} disabled />
        </Col>
        <Col sm={3} xs={6}>
          at
          {timeOpts}
        </Col>
        <Col sm={1} xs={6}>
          <Button
            variant="outline-danger"
            className="delete"
            onClick={(e) =>
              props.handleMedRuleDelete(e, props.medIdx, props.ruleIdx)
            }
          >
            <FontAwesomeIcon icon="fa-solid fa-trash" />
          </Button>
        </Col>
      </Row>
    </div>
  );
}

function Medication(props) {
  let deleteBtn = "";
  if (props.medIdx !== 0) {
    // at least one medication is needed
    deleteBtn = (
      <Button
        variant="outline-danger"
        className="delete"
        onClick={(e) => props.handleMedDelete(e, props.medIdx)}
      >
        <FontAwesomeIcon icon="fa-solid fa-trash" />
      </Button>
    );
  }
  const rules = props.med.rules.map((rule, i) => {
    return (
      <MedicationRule
        take={rule.take}
        key={`${props.medIdx}-${i}`}
        ruleIdx={i}
        medIdx={props.medIdx}
        organizerMode={props.organizerMode}
        handleMedRuleChange={(e, mk, rk) =>
          props.handleMedRuleChange(e, mk, rk)
        }
        handleMedRuleDelete={(e, mk, rk) =>
          props.handleMedRuleDelete(e, mk, rk)
        }
      />
    );
  });
  return (
    <div className="medication-form">
      <Row>
        <Col xs={10}>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              maxLength="50"
              onChange={(e) => props.handleMedChange(e, props.medIdx)}
              required
              value={props.med.name}
            />
          </Form.Group>
        </Col>
        <Col xs={2}>{deleteBtn}</Col>
      </Row>
      <Form.Group className="mb-2">
        <Form.Label>Instructions</Form.Label>
        <Form.Control
          as="textarea"
          name="instructions"
          onChange={(e) => props.handleMedChange(e, props.medIdx)}
          value={props.med.instructions}
        />
      </Form.Group>
      <div>{rules}</div>
      <Button
        variant="secondary"
        onClick={(e) => props.clickAddMedRule(e, props.medIdx)}
      >
        Add Rule
      </Button>
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
          med={med}
          organizerMode={this.props.organizerMode}
          handleMedChange={(e, i) => this.props.handleMedChange(e, i)}
          handleMedDelete={(e, i) => this.props.handleMedDelete(e, i)}
          handleMedRuleChange={(e, mk, rk) =>
            this.props.handleMedRuleChange(e, mk, rk)
          }
          clickAddMedRule={(e, mk) => this.props.clickAddMedRule(e, mk)}
          handleMedRuleDelete={(e, mk, rk) =>
            this.props.handleMedRuleDelete(e, mk, rk)
          }
        />
      );
    });
    const organizerOpts = organizerModes.map((opt, i) => {
      return (
        <Form.Check
          type="radio"
          name="organizer"
          label={opt.name}
          key={i}
          value={i}
          id={`org-opt-${i}`}
          onChange={(e) => this.props.onOrgModeChange(e)}
          checked={opt.name === this.props.organizerMode.name}
        />
      );
    });
    return (
      <div>
        <Form onSubmit={(e) => this.props.onSubmit(e)}>
          <h2>Session Configuration</h2>
          <h3>Organizer type</h3>
          <div>{organizerOpts}</div>
          <h3>Medications</h3>
          <div>{medications}</div>
          <Button
            className="mb-2"
            onClick={() => this.props.clickAddMedication()}
            type="Button"
            variant="secondary"
          >
            Add Medication
            <FontAwesomeIcon icon="fa-solid fa-pills" />
          </Button>
          <Button className="mb-2" type="Submit" variant="primary">
            Save
          </Button>
        </Form>
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
    this.newRule = { take: 1 };
    this.newMedication = {
      name: "",
      instructions: "",
      rules: [Object.create(this.newRule)],
    };
    this.state = {
      organizerMode: organizerModes[2],
      medications: [cloneDeep(this.newMedication)],
      sessionKey: 0,
      showSessionConfig: true,
    };
  }

  incrementSessionKey() {
    this.setState((prevState) => {
      return { sessionKey: prevState.sessionKey + 1 };
    });
  }

  setOrganizerMode(e) {
    this.setState({
      organizerMode: organizerModes[parseInt(e.target.value)],
    });
    this.incrementSessionKey();
  }

  clickAddMedication() {
    const meds = cloneDeep(this.state.medications);
    this.setState({
      medications: meds.concat([cloneDeep(this.newMedication)]),
    });
    this.incrementSessionKey();
  }

  clickAddMedRule(e, medIdx) {
    const meds = cloneDeep(this.state.medications);
    meds[medIdx].rules.push(Object.create(this.newRule));
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  handleMedRuleDelete(e, medIdx, ruleIdx) {
    const meds = cloneDeep(this.state.medications);
    meds[medIdx].rules.splice(ruleIdx, 1);
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  handleMedChange(event, medKey) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    const meds = cloneDeep(this.state.medications);
    // use they key to edit the right medication
    meds[medKey][name] = value;
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  handleMedRuleChange(event, medKey, ruleKey) {
    const target = event.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    if (target.type === "number") {
      value = parseInt(value);
    }
    const name = target.name;
    const meds = cloneDeep(this.state.medications);
    meds[medKey].rules[ruleKey][name] = value;
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  handleMedDelete(event, medKey) {
    const meds = cloneDeep(this.state.medications);
    meds.splice(medKey, 1);
    this.setState({
      medications: meds,
    });
    this.incrementSessionKey();
  }

  handleSessionConfigSubmit(event) {
    this.setState({
      showSessionConfig: false,
    });
    event.preventDefault();
  }

  render() {
    let sessionConfig = null;
    if (this.state.showSessionConfig) {
      sessionConfig = (
        <SessionConfig
          onSubmit={(e) => this.handleSessionConfigSubmit(e)}
          onRowChange={(i) => this.setRows(i)}
          onOrgModeChange={(e) => this.setOrganizerMode(e)}
          clickAddMedication={(i) => this.clickAddMedication(i)}
          medications={this.state.medications}
          organizerMode={this.state.organizerMode}
          handleMedChange={(e, k) => this.handleMedChange(e, k)}
          handleMedDelete={(e, k) => this.handleMedDelete(e, k)}
          handleMedRuleChange={(e, mk, rk) =>
            this.handleMedRuleChange(e, mk, rk)
          }
          clickAddMedRule={(e, mk) => this.clickAddMedRule(e, mk)}
          handleMedRuleDelete={(e, mk, rk) =>
            this.handleMedRuleDelete(e, mk, rk)
          }
        />
      );
    }
    let editSession = null;
    if (!this.state.showSessionConfig) {
      editSession = (
        <Button
          className="mb-2"
          onClick={() => this.setState({ showSessionConfig: true })}
          type="Button"
          variant="secondary"
        >
          Edit Session Configuration
        </Button>
      );
    }
    return (
      <div className="container">
        <div>
          <h1>Pill Master 3000</h1>
        </div>
        <Session
          organizerMode={this.state.organizerMode}
          key={this.state.sessionKey}
          medications={this.state.medications}
        />
        {editSession}
        {sessionConfig}
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

/** Vectorized array addition.
 */
function addVector(a, b) {
  return a.map((e, i) => e + b[i]);
}

function arraySum(ary) {
  return ary.reduce((partialSum, a) => partialSum + a, 0);
}

/** Determine Organizer rule compliance.
 *
 * Returns: object indicating med exceeded (failure), under (in progress),
 * or rules met (success)
 */
function determineCompliance(squares, medications) {
  const compliance = { met: true, exceeded: false };
  // Combine the take amount for each row based on each Med's rule.
  // Then, compare that to the Organizer Squares
  medications.forEach((med, i) => {
    const combinedRules = {};
    for (const rowName in squares) {
      combinedRules[rowName] = new Array(days.length).fill(0);
    }
    med.rules.forEach((rule) => {
      for (const rowName in squares) {
        let dailyTake;
        if (rule[rowName]) {
          // compare the amounts in the squares row for the med to the rule.take
          dailyTake = rule.take;
        } else {
          dailyTake = 0;
        }
        const ruleAmt = new Array(days.length).fill(dailyTake);
        combinedRules[rowName] = addVector(combinedRules[rowName], ruleAmt);
      }
    });
    // Use the combined rule amounts to check for rule compliance
    for (const rowName in squares) {
      compliance.met =
        compliance.met &&
        isEqual(squares[rowName][med.name], combinedRules[rowName]);
      // Check for any cell above the daily take amount for that med & row.
      combinedRules[rowName].forEach((ruleAmt, j) => {
        if (squares[rowName][med.name][j] > ruleAmt) {
          compliance.exceeded = true;
        }
      });
    }
  });
  return compliance;
}
