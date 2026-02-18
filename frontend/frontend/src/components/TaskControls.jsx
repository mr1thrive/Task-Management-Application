export default function TaskControls({
  status,
  setStatus,
  q,
  setQ,
  sortBy,
  setSortBy,
  order,
  setOrder,
  onApply,
  onReset,
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        maxWidth: 700,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 10,
      }}
    >
      <h3 style={{ margin: 0 }}>Filter & Sort</h3>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">all</option>
            <option value="pending">pending</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Search (title)</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. meeting, homework..."
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">created date</option>
            <option value="deadline">deadline</option>
            <option value="title">title</option>
            <option value="status">status</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Order</label>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onApply}>
          Apply
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
