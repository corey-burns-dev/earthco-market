import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useStore } from "../context/StoreContext";
import { formatCurrency, formatDate } from "../utils/format";

export default function AccountPage() {
  const { currentUser, orders, logout } = useStore();

  if (!currentUser) {
    return (
      <PageShell>
        <section className="empty-state brutal-block">
          <h3>You are currently signed out.</h3>
          <p>Sign in to access your orders, profile, and checkout history.</p>
          <Link to="/auth" className="btn btn-dark">
            Login/Register
          </Link>
        </section>
      </PageShell>
    );
  }

  const userOrders = orders.filter((order) => order.userId === currentUser.id);

  return (
    <PageShell>
      <section className="section-head brutal-block">
        <div>
          <h2>Account</h2>
          <p>{currentUser.email}</p>
        </div>
        <button
          type="button"
          className="btn btn-light"
          onClick={() => {
            void logout();
          }}
        >
          Sign Out
        </button>
      </section>

      <section className="account-grid">
        <article className="account-card brutal-block">
          <h3>Profile</h3>
          <p>Name: {currentUser.name}</p>
          <p>Email: {currentUser.email}</p>
          <p>Status: {currentUser.isAdmin ? "Administrator" : "Customer"}</p>
          <Link className="btn btn-dark" to="/shop">
            Continue Shopping
          </Link>
        </article>

        <article className="account-card brutal-block">
          <h3>Order History</h3>
          {userOrders.length === 0 ? (
            <p>No orders yet. Place your first order from checkout.</p>
          ) : (
            <div className="order-list">
              {userOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <strong>{order.orderCode ?? order.id}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{order.status ?? "PLACED"}</span>
                  <span>{order.lines.length} items</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </PageShell>
  );
}
