export default function ComparisonTable() {
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px" }}>
      <h2 style={{ textAlign: "center" }}>HEED Comparison Table</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cell}>Feature</th>
            <th style={cell}>Existing Apps</th>
            <th style={cell}>HEED</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={cell}>Daily Check-ins</td>
            <td style={cell}>Basic reminders</td>
            <td style={cell}>Human-like AI conversation</td>
          </tr>
          <tr>
            <td style={cell}>Emotional Support</td>
            <td style={cell}>Mostly not available</td>
            <td style={cell}>Supportive responses</td>
          </tr>
          <tr>
            <td style={cell}>Personalization</td>
            <td style={cell}>Limited</td>
            <td style={cell}>Based on user replies</td>
          </tr>
          <tr>
            <td style={cell}>Behavior Tracking</td>
            <td style={cell}>Simple task tracking</td>
            <td style={cell}>Detects routine changes</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const cell = {
  border: "1px solid #ccc",
  padding: "12px",
  textAlign: "center" as const,
};