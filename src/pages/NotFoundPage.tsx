import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

export default function NotFoundPage() {
  return (
    <PageShell>
      <section className="empty-state brutal-block">
        <h3>404 - Route not found.</h3>
        <p>This page does not exist in the storefront navigation graph.</p>
        <Link to="/" className="btn btn-dark">
          Return Home
        </Link>
      </section>
    </PageShell>
  );
}
