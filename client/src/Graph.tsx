import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Existing Apps",
    interaction: 60,
  },
  {
    name: "HEED",
    interaction: 95,
  },
];

export default function Graph() {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        HEED vs Existing Systems
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="interaction" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}