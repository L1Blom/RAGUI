import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { SettingsContext } from "./SettingsContext";

function Navbar() {
  const { settings } = useContext(SettingsContext);
  const [hasXPosts, setHasXPosts] = useState(false);

  const apiBase = settings.PROD_API?.value;
  const project = settings.Project?.value;

  useEffect(() => {
    if (!apiBase || !project) { setHasXPosts(false); return; }
    fetch(`${apiBase}/prompt/${project}/xposts`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setHasXPosts(Array.isArray(data) && data.length > 0))
      .catch(() => setHasXPosts(false));
  }, [apiBase, project]);

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          RAGUI
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/directory">
                Context
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/settings">
                Settings
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/configuration">
                Configurations
              </Link>
            </li>
            {hasXPosts && (
              <li className="nav-item">
                <Link className="nav-link" to="/xposts">
                  X Posts
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
