import React, { useState, useEffect, useContext, useCallback } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";

/* ── helpers ──────────────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function truncate(text, max = 160) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

/* tokenize a line into text spans and linkified @mentions / #hashtags */
function tokenizeLine(line, key) {
  const parts = [];
  const regex = /(@\w+)|(#\w+)|(https?:\/\/\S+)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    if (m[1]) {
      const handle = m[1].slice(1);
      parts.push(
        <a key={`${key}-m${i}`} href={`https://x.com/${handle}`} target="_blank" rel="noreferrer noopener"
           style={{ color: "#0d6efd", fontWeight: 500 }}>{m[1]}</a>
      );
    } else if (m[2]) {
      const tag = m[2].slice(1);
      parts.push(
        <a key={`${key}-h${i}`} href={`https://x.com/hashtag/${tag}`} target="_blank" rel="noreferrer noopener"
           style={{ color: "#0d6efd" }}>{m[2]}</a>
      );
    } else if (m[3]) {
      // t.co or other URL — show shortened display text
      let display = m[3].replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
      if (display.length > 30) display = display.slice(0, 30) + "…";
      parts.push(
        <a key={`${key}-u${i}`} href={m[3]} target="_blank" rel="noreferrer noopener"
           style={{ color: "#6c757d", fontSize: 11 }}>{display}</a>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, li) => (
        <span key={li}>
          {tokenizeLine(line, li)}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

/* ── thumbnail with hover-expand ─────────────────────────────────────── */

function Thumbnail({ src, alt }) {
  const [expanded, setExpanded] = useState(false);

  const handleEnter = useCallback(() => setExpanded(true), []);
  const handleLeave = useCallback(() => setExpanded(false), []);

  return (
    <span style={{ display: "inline-block", position: "relative" }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 56,
          height: 56,
          objectFit: "cover",
          borderRadius: 4,
          border: "1px solid #dee2e6",
          cursor: "zoom-in",
          display: "block",
        }}
      />
      {expanded && (
        <img
          src={src}
          alt={alt}
          style={{
            position: "fixed",
            top: "5vh",
            left: "5vw",
            width: "90vw",
            height: "90vh",
            objectFit: "contain",
            background: "rgba(0,0,0,0.92)",
            borderRadius: 8,
            boxShadow: "0 8px 60px rgba(0,0,0,0.9)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
    </span>
  );
}

/* ── X link icon ──────────────────────────────────────────────────────── */

function XLink({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title="Open on X"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 4,
        background: "#000",
        color: "#fff",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "serif",
        flexShrink: 0,
      }}
    >
      𝕏
    </a>
  );
}

/* ── video thumbnail ────────────────────────────────────────────────── */

function VideoThumb({ src }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Play video"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 56,
        borderRadius: 4,
        border: `2px solid ${hovered ? "#0d6efd" : "#495057"}`,
        background: hovered ? "#0d6efd" : "#212529",
        color: "#fff",
        fontSize: 20,
        cursor: "pointer",
        flexShrink: 0,
        textDecoration: "none",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      ▶
    </a>
  );
}

/* ── main page ────────────────────────────────────────────────────────── */

function XPosts() {
  const { settings } = useContext(SettingsContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedText, setExpandedText] = useState({});

  const apiBase = settings.PROD_API.value;
  const project = settings.Project.value;

  useEffect(() => {
    if (!apiBase || !project) return;
    setLoading(true);
    setError(null);
    fetch(`${apiBase}/prompt/${project}/xposts`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at) : new Date(0);
          const db = b.created_at ? new Date(b.created_at) : new Date(0);
          return db - da;
        });
        setPosts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiBase, project]);

  const toggleText = (id) =>
    setExpandedText((prev) => ({ ...prev, [id]: !prev[id] }));

  const mediaUrl = (path) =>
    `${apiBase}/prompt/${project}/file?file=${encodeURIComponent(path)}`;

  return (
    <div>
      <Navbar />

      <div className="small bg-light" style={{ padding: "4px 8px" }}>
        Project: <b>{project}</b>
      </div>

      <div style={{ padding: "8px 12px" }}>
        <h5 style={{ margin: "8px 0" }}>
          X Posts{" "}
          {!loading && (
            <span className="badge bg-secondary" style={{ fontSize: 13 }}>
              {posts.length}
            </span>
          )}
        </h5>

        {loading && <p className="text-muted">Loading…</p>}
        {error && <p className="text-danger">Error: {error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-muted">No X posts indexed for this project.</p>
        )}

        {!loading && posts.length > 0 && (
          <table
            border={1}
            width="100%"
            style={{ borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr className="settings_row">
                <th style={{ width: 32, textAlign: "center" }}>#</th>
                <th style={{ width: 130 }}>Author</th>
                <th>Post</th>
                <th style={{ width: 90 }}>Date</th>
                <th style={{ width: 36, textAlign: "center" }}>Link</th>
                <th style={{ width: 220 }}>Media</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, idx) => {
                const isExpanded = !!expandedText[post.tweet_id];
                const text = post.text || "";
                const needsTruncate = text.length > 160;
                const author = post.author || {};

                return (
                  <tr
                    key={post.tweet_id || idx}
                    className="settings_row"
                    onClick={needsTruncate ? () => toggleText(post.tweet_id) : undefined}
                    style={needsTruncate ? { cursor: "pointer" } : undefined}
                  >
                    {/* # */}
                    <td style={{ textAlign: "center", color: "#6c757d", whiteSpace: "nowrap" }}>
                      {needsTruncate ? (
                        <span style={{ fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                      ) : (
                        idx + 1
                      )}
                    </td>

                    {/* Author */}
                    <td style={{ verticalAlign: "top", padding: "6px 8px" }}>
                      {author.username && (
                        <a
                          href={`https://x.com/${author.username}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ fontWeight: 600, color: "#0d6efd" }}
                        >
                          @{author.username}
                        </a>
                      )}
                      {author.name && (
                        <div style={{ color: "#6c757d", fontSize: 11 }}>
                          {author.name}
                        </div>
                      )}
                    </td>

                    {/* Post text */}
                    <td style={{ verticalAlign: "top", padding: "6px 8px" }}>
                      {!post.has_snapshot && (
                        <span className="badge bg-warning text-dark" style={{ marginBottom: 4 }}>
                          not indexed
                        </span>
                      )}
                      <span>
                        {isExpanded || !needsTruncate
                          ? <FormattedText text={text} />
                          : <FormattedText text={truncate(text)} />}
                      </span>
                    </td>

                    {/* Date */}
                    <td
                      style={{
                        verticalAlign: "top",
                        padding: "6px 8px",
                        whiteSpace: "nowrap",
                        color: "#6c757d",
                        fontSize: 12,
                      }}
                    >
                      {formatDate(post.created_at)}
                    </td>

                    {/* X link */}
                    <td style={{ textAlign: "center", verticalAlign: "top", padding: "6px 4px" }}>
                      <XLink href={post.post_url} />
                    </td>

                    {/* Media */}
                    <td style={{ verticalAlign: "top", padding: "6px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          alignItems: "center",
                          overflow: "visible",
                        }}
                      >
                        {(post.images || []).map((imgPath, i) => (
                          <Thumbnail
                            key={`img-${i}`}
                            src={mediaUrl(imgPath)}
                            alt={`image ${i + 1}`}
                          />
                        ))}
                        {(post.videos || []).map((vidPath, i) => (
                          <VideoThumb
                            key={`vid-${i}`}
                            src={mediaUrl(vidPath)}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default XPosts;
