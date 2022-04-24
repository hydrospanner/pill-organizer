import React, { useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button, Tabs, Tab } from "react-bootstrap";
import { Session } from "./Session";
import {
  SessionConfig,
  organizerModes,
  defaultMedColors,
} from "./ConfigSession";
import { About } from "./About";

export function App() {
  return (
    <div className="container">
      <div>
        <h1>Pill Master 3000</h1>
      </div>
      <TabController />
    </div>
  );
}

function TabController() {
  const [key, setKey] = useState("config");

  const organizer = (
    <OrganizerController
      showSessionConfig={key === "config"}
      setTab={(k) => setKey(k)}
    />
  );
  return (
    <React.Fragment>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="config" title="Setup"></Tab>
        <Tab eventKey="session" title="Session"></Tab>
        <Tab eventKey="about" title="About">
          <About />
        </Tab>
      </Tabs>
      {(key == "session" || key === "config") && organizer}
    </React.Fragment>
  );
}

class OrganizerController extends React.Component {
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
      medType: "tablet",
    };
    this.state = {
      organizerMode: organizerModes[2],
      medications: [cloneDeep(this.newMedication)],
      sessionKey: 0,
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
    let name = target.name;
    // hack: the radio input names are the same for each medication, but all
    // meds are on the same form.
    // Try breaking up the forms.
    if (name.startsWith("medType")) {
      name = "medType";
    }
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
    this.props.setTab("session");
    event.preventDefault();
  }

  render() {
    let sessionConfig = null;
    if (this.props.showSessionConfig) {
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
      <React.Fragment>
        {!this.props.showSessionConfig && (
          <React.Fragment>
            <Session
              organizerMode={this.state.organizerMode}
              key={this.state.sessionKey}
              medications={this.state.medications}
            />
            <Button
              className="mb-2 mt-5"
              onClick={() => this.props.setTab("config")}
              type="Button"
              variant="outline-secondary"
            >
              Edit Session Configuration
            </Button>
          </React.Fragment>
        )}
        {sessionConfig}
      </React.Fragment>
    );
  }
}
