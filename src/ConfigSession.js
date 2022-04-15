import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Row, Col, Form } from "react-bootstrap";

const orgRow = {
  morning: { name: "Morning", icon: "fa-mug-saucer", className: "morning" },
  day: { name: "Noon", icon: "fa-sun", className: "noon" },
  night: { name: "Night", icon: "fa-moon", className: "night" },
  bed: { name: "Bed", icon: "fa-bed", className: "bed" },
};
export const organizerModes = [
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
export const defaultMedColors = [
  "#ef2929",
  "#fcaf3e",
  "#fce94f",
  "#8ae234",
  "#729fcf",
  "#ad7fa8",
  "#eeeeec",
];

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
        checked={props.rule[row.name] === true}
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
              value={props.rule.take}
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
        rule={rule}
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
            <Form.Label htmlFor={`med-name-${props.medIdx}`}>Name</Form.Label>
            <Form.Control
              id={`med-name-${props.medIdx}`}
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
      <Row>
        <Col xs={2}>
          <Form.Label htmlFor={`medColorInput-${props.medIdx}`}>
            Color
          </Form.Label>
          <Form.Control
            type="color"
            id={`medColorInput-${props.medIdx}`}
            name="color"
            defaultValue={props.med.color}
            onChange={(e) => props.handleMedChange(e, props.medIdx)}
            title="Choose medication color"
          />
        </Col>
      </Row>
      <Form.Group className="mb-2">
        <Form.Label htmlFor={`med-instructions-${props.medIdx}`}>
          Instructions
        </Form.Label>
        <Form.Control
          id={`med-instructions-${props.medIdx}`}
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

export class SessionConfig extends React.Component {
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
          <div className="d-grid gap-2 mb-2">
            <Button
              onClick={() => this.props.clickAddMedication()}
              type="Button"
              variant="secondary"
            >
              Add Medication
              <FontAwesomeIcon icon="fa-solid fa-pills" />
            </Button>
            <Button type="Submit" variant="primary">
              Save & Start Session
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}
