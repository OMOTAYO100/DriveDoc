import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import StatsGrid from "../components/StatsGrid";
import DocumentsList from "../components/DocumentsList";
import AddDocumentModal from "../components/AddDocumentModal";
import RenewalGuideModal from "../components/RenewalGuideModal";
import { CATEGORIES } from "../utils/categoryMapping";
import { api } from "../services/api";
import { useAuth } from "../context/auth";
import { useToast } from "../context/toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  // Present when arriving from a notification deep link: /documents/:documentId
  const { documentId } = useParams();

  const [documents, setDocuments] = useState([]);
  const [documentsError, setDocumentsError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await api.getDocuments();
      if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        setDocumentsError("");
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      // Keep whatever is already on screen. Clearing here is what made a
      // transient error look like the user's documents had been deleted.
      setDocumentsError(error.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await api.getDocuments().catch((error) => {
        console.error("Failed to fetch documents:", error);
        return { error };
      });
      if (cancelled) return;
      if (data.error) setDocumentsError(data.error.message);
      else if (data.success && Array.isArray(data.documents)) {
        setDocuments(data.documents);
        setDocumentsError("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh on focus rather than polling. The old 10-second poll sent 90
  // requests per 15-minute window and tripped the rate limiter by itself.
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") fetchDocuments();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchDocuments]);

  const renewalDocument = documentId ? documents.find((d) => d._id === documentId) : null;

  const handleSave = async (docData) => {
    // Throws on failure so the modal keeps the user's input on screen.
    if (editing) {
      const res = await api.updateDocument(editing._id, docData);
      setDocuments((prev) => prev.map((d) => (d._id === res.document._id ? res.document : d)));
      notify("Document updated.", "success");
    } else {
      const res = await api.addDocument(docData);
      setDocuments((prev) => [res.document, ...prev]);
      notify("Document added.", "success");
    }
    setIsAddOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    const doc = documents.find((d) => d._id === id);
    if (!window.confirm(`Delete your ${doc?.type || "document"}? This can't be undone.`)) return;
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      notify("Document deleted.", "success");
    } catch (error) {
      notify(`Couldn't delete that document: ${error.message}`, "error");
    }
  };

  return (
    <>
      {user?.profileComplete === false && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            Add your phone number and country so we can reach you about reminders.
          </p>
          <Link
            to="/account"
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Finish profile
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {user?.fullName ? `Welcome back, ${user.fullName.split(" ")[0]}!` : "Dashboard"}
        </h2>
        <p className="mt-2 text-gray-600">
          Here's an overview of your driving documents.
        </p>
      </div>

      {documentsError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800">Couldn't refresh your documents: {documentsError}</p>
          <button
            onClick={fetchDocuments}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      <StatsGrid documents={documents} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DocumentsList
            documents={documents}
            onDelete={handleDelete}
            onEdit={(doc) => {
              setEditing(doc);
              setIsAddOpen(true);
            }}
            onShowRenewal={(doc) => navigate(`/documents/${doc._id}`)}
            onAddDocument={() => {
              setEditing(null);
              setIsAddOpen(true);
            }}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Practice Theory Test</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a category to start practicing for your driving theory test.
            </p>
            <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto pr-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/practice?category=${encodeURIComponent(cat.label)}`}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:bg-gray-50"
                  >
                    <div className="rounded-md bg-blue-50 p-2 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-700">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/practice"
              className="mt-4 block w-full rounded-lg bg-indigo-600 py-2 text-center font-medium text-white transition hover:bg-indigo-700"
            >
              Start Full Practice Test
            </Link>
          </div>
        </div>
      </div>

      {isAddOpen && (
        <AddDocumentModal
          isOpen={isAddOpen}
          document={editing}
          onClose={() => {
            setIsAddOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Deep-linkable: a reminder notification opens /documents/:id straight
          onto the renewal guidance for the document that is expiring. */}
      {renewalDocument && (
        <RenewalGuideModal document={renewalDocument} onClose={() => navigate("/")} />
      )}
    </>
  );
}
