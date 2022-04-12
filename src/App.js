import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button } from "react-bootstrap";
import { Session } from "./Session";
import {
  SessionConfig,
  organizerModes,
  defaultMedColors,
} from "./ConfigSession";

export class App extends React.Component {
  // Handle modifications to game config here
  // - (e.g., row/rule changes)
  constructor(props) {
    super(props);
    this.newRule = { take: 1 };
    this.newMedication = {
      name: "",
      instructions: "",
      rules: [Object.create(this.newRule)],
      color: defaultMedColors[0],
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
    const newMed = cloneDeep(this.newMedication);
    // suggest a unique color
    newMed.color = defaultMedColors[meds.length % defaultMedColors.length];
    this.setState({
      medications: meds.concat([newMed]),
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
    return (
      <div className="container">
        <div>
          <h1>Pill Master 3000</h1>
        </div>
        {!this.state.showSessionConfig && (
          <React.Fragment>
            <Session
              organizerMode={this.state.organizerMode}
              key={this.state.sessionKey}
              medications={this.state.medications}
            />
            <Button
              className="mb-2 mt-5"
              onClick={() => this.setState({ showSessionConfig: true })}
              type="Button"
              variant="outline-secondary"
            >
              Edit Session Configuration
            </Button>
          </React.Fragment>
        )}
        {sessionConfig}
      </div>
    );
  }
}
