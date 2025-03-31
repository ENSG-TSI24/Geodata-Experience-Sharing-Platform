import { FiLock } from "react-icons/fi"

function RolePermissionBanner() {
  return (
    <div className="panel">
      <div className="permission-banner">
        <FiLock className="permission-icon" />
        <div className="permission-content">
          <h3>Accès restreint</h3>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette section.</p>
          <p>Veuillez contacter un administrateur si vous avez besoin d'accéder à ce contenu.</p>
        </div>
      </div>
    </div>
  )
}

export default RolePermissionBanner

