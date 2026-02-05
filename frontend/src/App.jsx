import { Link, Route, Routes, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from './lib/firebase';
import StatusBadge from './components/StatusBadge';
import Pill from './components/Pill';

function DashboardPage() {
  const [prs, setPrs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPrs() {
      try {
        const q = query(collection(db, 'prs'), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        setPrs(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) {
        setError(err.message);
      }
    }

    loadPrs();
  }, []);

  return (
    <main className="container">
      <header className="header">
        <h1>PR Reviewer Dashboard</h1>
        <p>Live status for automated pull request quality checks.</p>
      </header>

      {error && <div className="error">Failed to load PRs: {error}</div>}

      <section className="card">
        <h2>Pull Requests</h2>
        <table>
          <thead>
            <tr>
              <th>PR</th>
              <th>Repository</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {prs.length === 0 ? (
              <tr>
                <td colSpan={4}>No PR reviews available yet.</td>
              </tr>
            ) : (
              prs.map((pr) => (
                <tr key={pr.prId}>
                  <td>
                    <Link to={`/pr/${pr.prId}`}>#{pr.prId}</Link>
                  </td>
                  <td>{pr.repository}</td>
                  <td>
                    <StatusBadge status={pr.status} />
                  </td>
                  <td>{Math.round((pr.confidence || 0) * 100)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function PrDetailPage() {
  const { prId } = useParams();
  const [pr, setPr] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPr() {
      try {
        const prRef = doc(db, 'prs', prId);
        const prSnapshot = await getDoc(prRef);
        if (!prSnapshot.exists()) {
          setError('PR not found');
          return;
        }
        setPr({ id: prSnapshot.id, ...prSnapshot.data() });
      } catch (err) {
        setError(err.message);
      }
    }

    loadPr();
  }, [prId]);

  const confidenceValue = useMemo(() => {
    if (!pr) return '0%';
    return `${Math.round((pr.confidence || 0) * 100)}%`;
  }, [pr]);

  return (
    <main className="container">
      <Link to="/" className="back-link">
        ← Back to dashboard
      </Link>

      {error && <div className="error">{error}</div>}

      {pr && (
        <section className="card">
          <h1>
            PR #{pr.prId}: {pr.title}
          </h1>
          <p className="muted">Repository: {pr.repository}</p>
          <StatusBadge status={pr.status} />

          <div className="pill-row">
            <Pill label="Confidence" value={confidenceValue} />
            <Pill label="Decision" value={pr.status} />
            <Pill label="Author" value={pr.author} />
          </div>

          <h3>Reviewer Notes</h3>
          <ul>
            {(pr.notes || []).map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/pr/:prId" element={<PrDetailPage />} />
    </Routes>
  );
}
