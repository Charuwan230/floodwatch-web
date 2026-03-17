import { useEffect, useState } from "react"
import { getAllDistricts } from "./services/api"

export default function App() {
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllDistricts().then((data) => {
      console.log("DATA:", data)
      setDistricts(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <h2>Loading...</h2>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🌊 FloodWatch Dashboard</h1>

      {districts.length === 0 ? (
        <p>❌ No data</p>
      ) : (
        <ul>
          {districts.map((d, i) => (
            <li key={i}>
              {d.name || d.district_name || "Unknown"} - {d.risk || d.status || "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}