import './RoleSelector.css';

export function RoleSelector({ onSelectUser, onSelectAdmin, onBack }) {
  return (
    <div className="role-page">
      {/* Background circles */}
      <div className="role-bg">
        <div className="role-circle c1" />
        <div className="role-circle c2" />
        <div className="role-circle c3" />
      </div>

      <button className="role-back-btn" onClick={onBack} type="button">
        ← Back
      </button>

      <div className="role-card">
        <div className="role-card-strip" />

        <div className="role-header">
          <div className="role-logo">🎤</div>
          <h1>HAGERE VOICE</h1>
          <p>Who are you signing in as?</p>
        </div>

        <div className="role-options">
          {/* User option */}
          <button
            type="button"
            className="role-option role-option-user"
            onClick={onSelectUser}
          >
            <div className="role-option-icon">👤</div>
            <div className="role-option-body">
              <strong>Business Owner</strong>
              <span>Manage your shop, inventory and sales</span>
            </div>
            <div className="role-option-arrow">→</div>
          </button>

          {/* Admin option */}
          <button
            type="button"
            className="role-option role-option-admin"
            onClick={onSelectAdmin}
          >
            <div className="role-option-icon">🛡️</div>
            <div className="role-option-body">
              <strong>Platform Admin</strong>
              <span>Manage users and platform analytics</span>
            </div>
            <div className="role-option-arrow">→</div>
          </button>
        </div>

        <p className="role-footer-note">
          🇪🇹 Built for Ethiopian women entrepreneurs
        </p>
      </div>
    </div>
  );
}
