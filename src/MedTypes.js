export function Tablet(props) {
  return (
    <div
      className="medication-tablet"
      style={{ backgroundColor: props.color }}
    />
  );
}

export function Pill(props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="medication-pill"
        style={{ backgroundColor: props.color }}
      />
    </div>
  );
}
