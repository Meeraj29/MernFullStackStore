import { useState, useRef } from "react";
import api from "../api/axios";
import {
    Upload, FileJson, CheckCircle, AlertCircle, Trash2, Plus,
    Download, FileSpreadsheet, X, Package, Users, Tag
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Entity Configurations ───────────────────────────────────────────────────
const ENTITIES = {
    products: {
        label: "Products",
        icon: Package,
        color: "indigo",
        apiEndpoint: "products/bulk-upload",
        payloadKey: "products",
        templateRows: [
            {
                title: "Example Product", price: 1200, stock: 50,
                category: "Electronics", description: "Short description here",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                warranty: "1 Year", ram: "8GB", storage: "256GB SSD"
            }
        ],
        templateFilename: "Nexus_Products_Template.xlsx",
        parseRow: (item) => {
            const title = item.title || item.Title || item.name || item.Name || item["Product Name"] || "";
            return {
                title: String(title).trim(),
                price: Number(item.price || item.Price || 0),
                stock: Number(item.stock || item.Stock || item.Qty || 0),
                category: String(item.category || item.Category || "General").trim(),
                description: item.description || item.Description || "",
                image: item.image || item.Image || "",
                warranty: item.warranty || item.Warranty || "No warranty",
                ram: item.ram || item.RAM || "",
                storage: item.storage || item.Storage || "",
                battery: item.battery || item.Battery || "",
                camera: item.camera || item.Camera || "",
                processor: item.processor || item.Processor || "",
                graphics: item.graphics || item.Graphics || "",
            };
        },
        validate: (item) => !!item.title,
        missingField: "title",
        renderPreview: (item, i) => (
            <div key={i} className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all ${!item.title ? "bg-rose-50 border-rose-100" : "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-lg"}`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover rounded-xl" alt="" /> : <Package size={16} className="text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-black truncate uppercase tracking-tight ${!item.title ? "text-rose-600" : "text-gray-900"}`}>
                        {item.title || "MISSING TITLE ERROR"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-600">₹{Number(item.price).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• Stock: {item.stock} • {item.category}</span>
                    </div>
                </div>
            </div>
        ),
        jsonPlaceholder: '[{ "title": "iPhone 15", "price": 79999, "stock": 10, "category": "Mobiles" }]',
        validationRules: [
            { label: "Required: title (or name / Product Name)", detail: "Must have a title column. Price and Stock default to 0 if missing." },
            { label: "Optional specs", detail: "ram, storage, battery, camera, processor, graphics — all optional." },
        ]
    },

    users: {
        label: "Users",
        icon: Users,
        color: "violet",
        apiEndpoint: "auth/users/bulk-upload",
        payloadKey: "users",
        templateRows: [
            { name: "John Doe", email: "john@example.com", phone: "9876543210", role: "user" },
            { name: "Jane Admin", email: "jane@example.com", phone: "9123456789", role: "admin" },
        ],
        templateFilename: "Nexus_Users_Template.xlsx",
        parseRow: (item) => ({
            name: String(item.name || item.Name || item["Full Name"] || "").trim(),
            email: String(item.email || item.Email || "").trim().toLowerCase(),
            phone: String(item.phone || item.Phone || item.Mobile || "").trim(),
            role: ["admin", "user"].includes(String(item.role || "user").toLowerCase())
                ? String(item.role).toLowerCase() : "user",
        }),
        validate: (item) => !!item.name && !!item.email,
        missingField: "name / email",
        renderPreview: (item, i) => (
            <div key={i} className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all ${(!item.name || !item.email) ? "bg-rose-50 border-rose-100" : "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-lg"}`}>
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-violet-600 font-black text-sm">{(item.name || "?").charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-black truncate uppercase tracking-tight ${(!item.name || !item.email) ? "text-rose-600" : "text-gray-900"}`}>
                        {item.name || "MISSING NAME"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-violet-600">{item.email || "no email"}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {item.role || "user"} • {item.phone || "—"}</span>
                    </div>
                </div>
            </div>
        ),
        jsonPlaceholder: '[{ "name": "Alice", "email": "alice@mail.com", "phone": "9999999999", "role": "user" }]',
        validationRules: [
            { label: "Required: name & email", detail: "Rows missing name or email are automatically skipped." },
            { label: "Default password", detail: "All bulk-created users get the default password: Nexus@123 — they should change it on first login." },
            { label: "Role", detail: "Set role to \"user\" or \"admin\". Anything else defaults to \"user\"." },
            { label: "Duplicate check", detail: "Existing users (same email or name) are skipped, not duplicated." },
        ]
    },

    categories: {
        label: "Categories",
        icon: Tag,
        color: "emerald",
        apiEndpoint: "categories/bulk-upload",
        payloadKey: "categories",
        templateRows: [
            { name: "Electronics", description: "Phones, laptops, and accessories", image: "" }
        ],
        templateFilename: "Nexus_Categories_Template.xlsx",
        parseRow: (item) => ({
            name: String(item.name || item.Name || item.Category || item.category || "").trim(),
            description: String(item.description || item.Description || "").trim(),
            image: item.image || item.Image || "",
        }),
        validate: (item) => !!item.name,
        missingField: "name",
        renderPreview: (item, i) => (
            <div key={i} className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all ${!item.name ? "bg-rose-50 border-rose-100" : "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-lg"}`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-black truncate uppercase tracking-tight ${!item.name ? "text-rose-600" : "text-gray-900"}`}>
                        {item.name || "MISSING NAME"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 truncate mt-1">{item.description || "No description"}</p>
                </div>
            </div>
        ),
        jsonPlaceholder: '[{ "name": "Electronics", "description": "Phones and laptops" }]',
        validationRules: [
            { label: "Required: name", detail: "Each row must have a 'name' column. Duplicate category names are skipped." },
            { label: "Optional: description, image", detail: "Slug is auto-generated from the name on the server." },
        ]
    },
};

// ─── Color Helpers ────────────────────────────────────────────────────────────
const colorMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200", active: "bg-indigo-600 text-white", badge: "bg-indigo-100 text-indigo-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700 shadow-violet-200", active: "bg-violet-600 text-white", badge: "bg-violet-100 text-violet-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200", active: "bg-emerald-600 text-white", badge: "bg-emerald-100 text-emerald-700" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function BulkUpload() {
    const [activeEntity, setActiveEntity] = useState("products");
    const [jsonInput, setJsonInput] = useState("");
    const [parsedItems, setParsedItems] = useState([]);
    const [status, setStatus] = useState({ message: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("file");
    const fileInputRef = useRef(null);

    const entity = ENTITIES[activeEntity];
    const colors = colorMap[entity.color];
    const EntityIcon = entity.icon;

    // Reset state when switching tabs
    const switchEntity = (key) => {
        setActiveEntity(key);
        setParsedItems([]);
        setJsonInput("");
        setStatus({ message: "", type: "" });
        setViewMode("file");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleParseJSON = () => {
        try {
            const data = JSON.parse(jsonInput);
            if (!Array.isArray(data)) throw new Error("Data must be an array of objects");
            const validated = data.map(entity.parseRow);
            setParsedItems(validated);
            setStatus({ message: `Parsed ${validated.length} items. Review below.`, type: "success" });
        } catch (error) {
            setStatus({ message: "Invalid JSON: " + error.message, type: "error" });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: "binary" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(ws);

                if (rawData.length === 0) throw new Error("The file contains no data.");

                const formatted = rawData.map(entity.parseRow).filter(entity.validate);
                if (formatted.length === 0) throw new Error("No valid rows found. Check the template columns.");

                setParsedItems(formatted);
                setStatus({ message: `Loaded ${formatted.length} ${entity.label.toLowerCase()} from file.`, type: "success" });
            } catch (error) {
                setStatus({ message: error.message, type: "error" });
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet(entity.templateRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, entity.label);
        XLSX.writeFile(wb, entity.templateFilename);
    };

    const handleUpload = async () => {
        if (parsedItems.length === 0) return;

        const invalid = parsedItems.filter(item => !entity.validate(item));
        if (invalid.length > 0) {
            setStatus({ message: `${invalid.length} items are missing required fields (${entity.missingField}). Fix them first.`, type: "error" });
            return;
        }

        setLoading(true);
        setStatus({ message: `Committing ${entity.label} to Nexus Core...`, type: "info" });

        try {
            const payload = { [entity.payloadKey]: parsedItems };
            const response = await api.post(entity.apiEndpoint, payload);
            setStatus({ message: response.data.message, type: "success" });
            setParsedItems([]);
            setJsonInput("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            setStatus({ message: error.response?.data?.message || "Critical upload failure.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (index) => {
        setParsedItems(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
                        Bulk <span className={colors.text}>Import</span>
                    </h1>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-3 bg-white border-2 border-gray-100 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:border-gray-200 hover:shadow-xl transition-all active:scale-95 group"
                >
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    Download {entity.label} Template
                </button>
            </div>

            {/* Entity Tabs */}
            <div className="flex gap-3 p-2 bg-gray-100/60 rounded-[2rem] w-fit">
                {Object.entries(ENTITIES).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const c = colorMap[cfg.color];
                    const isActive = activeEntity === key;
                    return (
                        <button
                            key={key}
                            onClick={() => switchEntity(key)}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? `${c.active} shadow-lg` : "text-gray-400 hover:text-gray-700"}`}
                        >
                            <Icon size={15} />
                            {cfg.label}
                        </button>
                    );
                })}
            </div>

            {/* Status Banner */}
            {status.message && (
                <div className={`p-6 rounded-[2rem] flex items-center gap-5 border shadow-lg ${
                    status.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    status.type === "error" ? "bg-rose-50 text-rose-700 border-rose-100" :
                    "bg-indigo-50 text-indigo-700 border-indigo-100"
                }`}>
                    <div className={`p-3 rounded-2xl ${
                        status.type === "success" ? "bg-emerald-500/10" :
                        status.type === "error" ? "bg-rose-500/10" : "bg-indigo-500/10"
                    }`}>
                        {status.type === "success" ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest flex-1">{status.message}</span>
                    <button onClick={() => setStatus({ message: "", type: "" })} className="opacity-40 hover:opacity-100 transition-opacity">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Input Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
                        {/* Input Source Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 ${colors.bg} rounded-2xl ${colors.text}`}>
                                    {viewMode === "file" ? <FileSpreadsheet size={24} /> : <FileJson size={24} />}
                                </div>
                                <div>
                                    <h2 className="font-black uppercase tracking-widest text-sm text-gray-900">Input Source</h2>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${colors.text}`}>{entity.label}</p>
                                </div>
                            </div>
                            <div className="flex bg-gray-100/50 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => setViewMode("file")}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === "file" ? "bg-white text-gray-900 shadow-md" : "text-gray-400"}`}
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={() => setViewMode("json")}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === "json" ? "bg-white text-gray-900 shadow-md" : "text-gray-400"}`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="min-h-[300px]">
                            {viewMode === "file" ? (
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className={`w-full h-[300px] border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-gray-200 transition-all cursor-pointer group`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".xlsx, .csv"
                                        className="hidden"
                                    />
                                    <div className={`p-8 bg-white rounded-3xl shadow-xl shadow-gray-100 group-hover:scale-110 transition-transform duration-500`}>
                                        <EntityIcon size={32} className={colors.text} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-gray-900">Drop {entity.label} File</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supports .XLSX and .CSV</p>
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder={entity.jsonPlaceholder}
                                    className="w-full h-[300px] p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 outline-none focus:border-gray-300 font-mono text-[11px] transition-all resize-none"
                                />
                            )}
                        </div>

                        <button
                            onClick={viewMode === "json" ? handleParseJSON : () => fileInputRef.current.click()}
                            className={`w-full text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${colors.btn}`}
                        >
                            {viewMode === "json" ? <Plus size={18} /> : <Upload size={18} />}
                            {viewMode === "json" ? "Validate Dataset" : "Load File"}
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col flex-1 min-h-[480px]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h2 className="font-black uppercase tracking-widest text-sm text-gray-900">
                                        Ingestion Buffer ({parsedItems.length})
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{entity.label}</p>
                                </div>
                            </div>
                            {parsedItems.length > 0 && (
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className={`text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl disabled:opacity-50 active:scale-95 ${colors.btn}`}
                                >
                                    {loading ? "Processing..." : `Commit ${entity.label}`}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-2">
                            {parsedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-10 border-4 border-dashed border-gray-100 rounded-[3rem]">
                                    <EntityIcon size={56} className="mb-4" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em]">Buffer empty</p>
                                </div>
                            ) : (
                                parsedItems.map((item, i) => (
                                    <div key={i} className="relative group">
                                        {entity.renderPreview(item, i)}
                                        <button
                                            onClick={() => removeItem(i)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
