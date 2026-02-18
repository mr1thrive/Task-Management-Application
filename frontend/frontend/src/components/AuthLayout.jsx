export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="container">
      <div className="card section authWrap">
        <div className="brand authHeader">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
