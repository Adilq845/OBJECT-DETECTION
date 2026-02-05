export default function Pill({ label, value }) {
  return (
    <div className="pill">
      <span className="pill-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
