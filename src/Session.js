import React from "react";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Alert,
  Button,
  ButtonGroup,
  ToggleButton,
  Row,
  Col,
  Accordion,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
import { useDrag, useDrop } from "react-dnd";

import { Tablet, Pill } from "./MedTypes";

export const days = [
  { name: "Sunday", abbr: "Sun" },
  { name: "Monday", abbr: "Mon" },
  { name: "Tuesday", abbr: "Tue" },
  { name: "Wednesday", abbr: "Wed" },
  { name: "Thursday", abbr: "Thu" },
  { name: "Friday", abbr: "Fri" },
  { name: "Saturday", abbr: "Sat" },
];

function CellPill(props) {
  const MedTypeComponent =
    props.selectedMed.medType === "tablet" ? Tablet : Pill;
  return <MedTypeComponent color={props.selectedMed.color} style={{}} />;
}

/** The pills in an Organizer Cell */
function CellPills(props) {
  if (props.selectedCount > 9) {
    return <h3 className="cell-count">{props.selectedCount}</h3>;
  }
  const pills = [];
  for (let pillIdx = 0; pillIdx < props.selectedCount; pillIdx++) {
    const pill = (
      <div className="pill-col" xs="4" key={pillIdx}>
        <CellPill
          key={pillIdx}
          selectedMed={props.selectedMed}
          colIdx={props.colIdx}
          orgRow={props.orgRow}
        />
      </div>
    );
    pills.push(pill);
  }
  return <div className="pill-row">{pills}</div>;
}

function Square(props) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "pill-bottle",
    drop: () => props.addCellMedication(props.colIdx, props.orgRow.name),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "pill",
    item: {
      colIdx: props.colIdx,
      orgRow: props.orgRow,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Popover
  const display = [];
  let selectedCount;
  for (const name in props.medCounts) {
    const medCount = props.medCounts[name][props.colIdx];
    if (props.medCounts[name][props.colIdx]) {
      display.push(`${name}: ${medCount}`);
    }
    if (name === props.selectedMed.name && medCount) {
      selectedCount = medCount;
    }
  }
  // display count of each medication in row
  let rows = display.map((txt, i) => {
    return <div key={i}>{txt}</div>;
  });
  if (!rows.length) {
    rows = "Empty";
  }
  const popover = (
    <Popover>
      <Popover.Header as="h3">Med Counts</Popover.Header>
      <Popover.Body>{rows}</Popover.Body>
    </Popover>
  );

  return (
    <div className="square-container">
      <div className="square" ref={(node) => drag(drop(node))}>
        <OverlayTrigger
          trigger={["hover", "focus"]}
          placement="bottom-end"
          overlay={popover}
        >
          <button
            style={{
              borderWidth: isOver ? "6px" : "3px",
              cursor: isOver || isDragging ? "move" : "default",
              opacity: isDragging ? 0.5 : 1,
            }}
          >
            <CellPills
              selectedMed={props.selectedMed}
              selectedCount={selectedCount}
              colIdx={props.colIdx}
              orgRow={props.orgRow}
            ></CellPills>
          </button>
        </OverlayTrigger>
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
        addCellMedication={(e, n, o) => props.addCellMedication(e, n, o)}
        orgRow={props.orgRow}
        selectedMed={props.selectedMed}
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
        addCellMedication={(e, n, o) => props.addCellMedication(e, n, o)}
        orgRow={orgRow}
        key={orgRow.name}
        selectedMed={props.selectedMed}
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
      if (step.increment >= 0) {
        desc = `${step.increment} ${step.selectedMed.name} added to ${day} ${step.selectedRow}`;
      } else {
        desc = `${step.increment * -1} ${
          step.selectedMed.name
        } removed from ${day} ${step.selectedRow}`;
      }
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
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>History</Accordion.Header>
        <Accordion.Body className="history-accordion-body">
          <div className="d-grid gap-1">{moves}</div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

const PillBottle = (props) => {
  const medIcon = (props.selectedMed.medType === "tablet") ? 'fa-tablets' : "fa-capsules";
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "pill-bottle",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "pill",
    drop: (item, monitor) => {
      props.addCellMedication(item.colIdx, item.orgRow.name, {
        increment: -1,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  return (
    <React.Fragment>
      <div
        ref={(node) => drag(drop(node))}
        className="pill-bottle"
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "move" : "grab",
          backgroundColor: isOver ? "lightgray" : "white",
        }}
      >
        <FontAwesomeIcon
          icon={medIcon}
          size="3x"
          style={{
            color: props.selectedMed.color,
          }}
        />
      </div>
    </React.Fragment>
  );
};

export class Session extends React.Component {
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
          compliance: {
            met: false,
            exceeded: false,
          },
        },
      ],
      stepNumber: 0,
      medOptions: this.props.medications,
      selectedMed: this.props.medications[0],
      showComplianceMsg: false,
    };
  }

  /** Organizer cell click/drag handler.
   *
   * i: cell column index
   * rowName: name of Organizer row
   */
  addCellMedication(i, rowName, opts = {}) {
    const increment = opts.increment || 1;
    // Square click handler (adds a pill to the Square)
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const medCounts = cloneDeep(current.medCounts);
    medCounts[rowName][this.state.selectedMed.name][i] += increment;
    const compliance = determineCompliance(medCounts, this.props.medications);
    this.setState({
      history: history.concat([
        {
          medCounts: medCounts,
          selectedMed: this.state.selectedMed,
          compliance: compliance,
          selectedRow: rowName,
          selectedCol: i,
          increment: increment,
        },
      ]),
      stepNumber: history.length,
      showComplianceMsg: false,
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

  setComplianceMsg() {
    this.setState({
      showComplianceMsg: true,
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
    let instructions = this.state.selectedMed.instructions;
    if (instructions.length === 0) {
      const instructionList = this.state.selectedMed.rules.map((rule, i) => {
        const timeOpts = this.props.organizerMode.rows.map((row, j) => {
          if (rule[row.name]) {
            return (
              <li key={`${i}-${j}`}>
                Take {rule.take} at {row.name} Daily
              </li>
            );
          }
          return null;
        });
        return timeOpts;
      });
      instructions = <ul>{instructionList}</ul>;
    }
    let complianceMsg = "";
    if (this.state.showComplianceMsg) {
      const compliance = this.state.history[this.state.stepNumber].compliance;
      let complianceTxt = "";
      let complianceVariant;
      if (compliance.met) {
        complianceTxt = "🎉 Medications successfully organized 🎉";
        complianceVariant = "success";
      } else if (compliance.exceeded) {
        complianceTxt = "Too many medications added";
        complianceVariant = "danger";
      } else {
        complianceTxt = "Some medications are missing";
        complianceVariant = "warning";
      }
      complianceMsg = (
        <Alert variant={complianceVariant}>{complianceTxt}</Alert>
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
            addCellMedication={(e, n, o) => this.addCellMedication(e, n, o)}
            organizerMode={this.props.organizerMode}
            selectedMed={this.state.selectedMed}
          />
        </div>
        <Row className="mb-1 mt-1">
          <Col md sm={6}>
            <div className="med-selection no-select">
              <h5>Select Medication</h5>
              <ButtonGroup vertical>{medOptions}</ButtonGroup>
            </div>
          </Col>
          <Col md sm={6}>
            <PillBottle
              selectedMed={this.state.selectedMed}
              addCellMedication={(e, n, o) => this.addCellMedication(e, n, o)}
            />
          </Col>
          <Col md className="no-select">
            <h3>{this.state.selectedMed.name}</h3>
            <h4>Instructions</h4>
            <div>{instructions}</div>
          </Col>
        </Row>
        <div className="game-info">
          <Row>
            <Col md={6}>
              <div className="d-grid gap-2 mb-2">
                <Button
                  className="mb-2"
                  variant="outline-primary"
                  type="button"
                  onClick={() => this.setComplianceMsg()}
                >
                  check accuracy
                </Button>
              </div>
              {complianceMsg}
            </Col>
            <Col md={6}>{moveHistory}</Col>
          </Row>
        </div>
      </div>
    );
  }
}

/** Vectorized array addition.
 */
function addVector(a, b) {
  return a.map((e, i) => e + b[i]);
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
