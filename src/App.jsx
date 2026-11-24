import React, { useEffect, useMemo, useRef, useState } from 'react';
import Jersey3D from './components/Jersey3D.jsx';
import { Upload, FileText, Ruler, Layers3, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertCircle, ChevronRight, ImagePlus, Shirt, Eye, Download, Menu } from 'lucide-react';

const PANEL_META = [
  { id: 'front-bodice', label: 'Badan depan', subtitle: 'Front bodice', color: '#67a7ff' },
  { id: 'back-bodice', label: 'Badan belakang', subtitle: 'Back bodice', color: '#9b8cff' },
  { id: 'sleeve-a', label: 'Lengan A', subtitle: 'Sleeve A', color: '#54c6a5' },
  { id: 'sleeve-b', label: 'Lengan B', subtitle: 'Sleeve B', color: '#54c6a5' },
  { id: 'collar', label: 'Kerah', subtitle: 'Collar', color: '#e2aa61' },
];

function PanelSvg({ panel, selected, fill }) {
  return <svg viewBox={panel.viewBox} className="pattern-svg" role="img" aria-label={panel.name}>
    <path d={panel.path} fill={fill} fillOpacity=".12" stroke={selected ? '#70b4ff' : '#d5dce8'} strokeWidth={selected ? 9 : 6} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export default function App() {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState('front-bodice');
  const [zoom, setZoom] = useState(1);
  const [unit, setUnit] = useState('cm');
  const [calibration, setCalibration] = useState('confirmed');
  const [fileName, setFileName] = useState('hd.pdf');
  const [uploadedPdf, setUploadedPdf] = useState('/samples/hd-preview.png');
  const [pdfMessage, setPdfMessage] = useState('Pola vektor contoh berhasil diekstrak dari PDF CorelDRAW.');
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [motifUrl, setMotifUrl] = useState(null);
  const [motifName, setMotifName] = useState('');
  const [activeTab, setActiveTab] = useState('pattern');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [jerseyColor, setJerseyColor] = useState('#f4f5f7');
  const [jerseyView, setJerseyView] = useState('front');
  const [autoRotate, setAutoRotate] = useState(true);
  const pdfInput = useRef(null); const logoInput = useRef(null); const motifInput = useRef(null);

  useEffect(() => { fetch('/samples/hd-patterns.json').then(r => r.json()).then(setData).catch(() => setPdfMessage('Gagal memuat data pola contoh. Jalankan aplikasi melalui npm run dev.')); }, []);
  const selected = useMemo(() => data?.panels?.find(p => p.id === selectedId), [data, selectedId]);

  const handlePdf = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setPdfMessage('File harus berupa PDF.'); return; }
    setFileName(file.name); setUploadedPdf(URL.createObjectURL(file));
    setPdfMessage('PDF baru berhasil dipilih. Pratinjau PDF tersedia, tetapi ekstraksi panel vektor otomatis untuk file baru belum diaktifkan pada prototipe ini. Data 5 panel contoh tetap berasal dari hd.pdf.');
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.25 });
      const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const preview = canvas.toDataURL('image/png');
      setUploadedPdf(preview);
    } catch (e) { setPdfMessage('PDF dipilih, tetapi pratinjau gagal dirender. Coba file PDF lain.'); }
  };
  const handleImage = (file, type) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'logo') { setLogoUrl(url); setLogoName(file.name); }
    else { setMotifUrl(url); setMotifName(file.name); }
  };
  const dims = selected ? `${selected.widthCm.toFixed(2)} × ${selected.heightCm.toFixed(2)} cm` : '—';

  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu"><Menu size={19}/></button>
      <div className="brand-mark"><Shirt size={20}/></div>
      <div className="brand"><strong>JERSEY<span>3D</span> STUDIO</strong><small>Pattern workspace</small></div>
      <div className="topbar-spacer" />
      <div className="project-chip"><span className="status-dot"/> Proyek: <b>HD Sample</b></div>
      <button className="save-btn" onClick={() => window.print()}><Download size={15}/> Ekspor ringkasan</button>
    </header>

    <div className="workspace">
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="side-section-label">WORKSPACE</div>
        <button className={`nav-item ${activeTab === 'pattern' ? 'active' : ''}`} onClick={() => setActiveTab('pattern')}><Layers3 size={17}/> Editor pola 2D</button>
        <button className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}><ImagePlus size={17}/> Aset desain <span className="soon">BETA</span></button>
        <button className={`nav-item ${activeTab === 'preview3d' ? 'active' : ''}`} onClick={() => { setActiveTab('preview3d'); setMobileMenu(false); }}><Eye size={17}/> Preview 3D <span className="soon">BETA</span></button>
        <div className="side-divider"/>
        <div className="side-section-label">SUMBER POLA</div>
        <div className="source-card">
          <div className="pdf-icon"><FileText size={19}/></div>
          <div className="source-info"><b>{fileName}</b><small>{uploadedPdf ? 'PDF • pratinjau tersedia' : 'PDF contoh • 1 halaman'}</small></div>
          {uploadedPdf && <img className="pdf-thumb" src={uploadedPdf} alt="Pratinjau halaman PDF"/>}<CheckCircle2 size={15} className="check-icon"/>
        </div>
        <button className="outline-upload" onClick={() => pdfInput.current?.click()}><Upload size={15}/> Unggah PDF lain</button>
        <input ref={pdfInput} type="file" accept="application/pdf,.pdf" hidden onChange={e => handlePdf(e.target.files?.[0])}/>
        <div className="side-divider"/>
        <div className="side-section-label">PANEL POLA <span>05</span></div>
        <div className="panel-list">
          {data?.panels?.map((p, i) => {
            const meta = PANEL_META[i];
            return <button key={p.id} className={`panel-item ${selectedId === p.id ? 'selected' : ''}`} onClick={() => { setSelectedId(p.id); setMobileMenu(false); }}>
              <span className="panel-swatch" style={{ background: meta.color }}/>
              <span className="panel-copy"><b>{meta.label}</b><small>{meta.subtitle}</small></span>
              <ChevronRight size={15}/>
            </button>;
          })}
        </div>
        <div className="sidebar-bottom"><div className="mini-check"><CheckCircle2 size={15}/> 5 panel teridentifikasi</div><small>Ekstraksi vektor dari hd.pdf</small></div>
      </aside>

      <main className="main-area">
        <div className="page-heading">
          <div><div className="eyebrow">PATTERN READER / STEP 01</div><h1>Editor Pola 2D</h1><p>Periksa geometri panel sebelum proses konstruksi jersey 3D.</p></div>
          <div className="heading-actions"><span className="unit-pill"><Ruler size={14}/> Satuan <b>{unit}</b></span><button className="secondary-btn" onClick={() => setZoom(1)}><RotateCcw size={14}/> Reset tampilan</button></div>
        </div>

        <div className="notice"><CheckCircle2 size={17}/><div><b>File contoh berhasil dianalisis</b><span>{pdfMessage}</span></div></div>

        {activeTab === 'pattern' ? <div className="content-grid">
          <section className="viewer-card">
            <div className="card-toolbar"><div><b>2D Pattern Canvas</b><small>Geometri vektor • skala tampilan menyesuaikan layar</small></div><div className="zoom-tools"><button onClick={() => setZoom(z => Math.max(.55, +(z-.1).toFixed(2)))}><ZoomOut size={16}/></button><span>{Math.round(zoom*100)}%</span><button onClick={() => setZoom(z => Math.min(1.8, +(z+.1).toFixed(2)))}><ZoomIn size={16}/></button></div></div>
            <div className="canvas-area">
              {selected && <div className="pattern-stage" style={{ transform: `scale(${zoom})` }}><PanelSvg panel={selected} selected fill={PANEL_META.find(x=>x.id===selected.id)?.color || '#67a7ff'}/><div className="canvas-label">{PANEL_META.find(x=>x.id===selected.id)?.label}</div></div>}
              {!selected && <div className="empty-state">Memuat geometri pola...</div>}
              <div className="canvas-scale">Tampilan proporsional • bukan ukuran cetak</div>
            </div>
            <div className="viewer-footer"><span><i className="legend-line"/> Garis potong terdeteksi</span><span><i className="legend-fill"/> Panel terpilih</span><span>Koordinat sumber: PDF vector paths</span></div>
          </section>
          <aside className="properties-card">
            <div className="properties-head"><div><div className="eyebrow">PROPERTIES</div><h2>Detail panel</h2></div><span className="verified-pill"><CheckCircle2 size={13}/> Vector</span></div>
            {selected && <>
              <div className="property-name"><span className="large-swatch" style={{background:PANEL_META.find(x=>x.id===selected.id)?.color}}/><div><b>{PANEL_META.find(x=>x.id===selected.id)?.label}</b><small>{selected.name}</small></div></div>
              <div className="dimension-box"><div className="dimension-title">BOUNDING BOX</div><div className="dimension-values"><div><small>Lebar</small><strong>{selected.widthCm.toFixed(2)} <em>cm</em></strong></div><div><small>Tinggi</small><strong>{selected.heightCm.toFixed(2)} <em>cm</em></strong></div></div></div>
              <div className="property-row"><span>Jenis geometri</span><b>Vector outline</b></div>
              <div className="property-row"><span>File sumber</span><b>hd.pdf</b></div>
              <div className="property-row"><span>Unit dokumen</span><b>Centimeter</b></div>
              <div className="property-row"><span>Garis jahit</span><b className="muted-value">Belum ditandai</b></div>
              <div className="property-row"><span>Seam allowance</span><b className="muted-value">Belum ditentukan</b></div>
              <div className="scale-note"><AlertCircle size={15}/><span>Ukuran di atas adalah dimensi kotak pembatas (bounding box), bukan panjang garis jahit. Verifikasi skala cetak tetap diperlukan sebelum produksi.</span></div>
            </>}
          </aside>
        </div> : activeTab === 'assets' ? <div className="assets-grid">
          <div className="asset-card"><div className="asset-icon"><ImagePlus/></div><h3>Logo & Sponsor</h3><p>Unggah logo klub, apparel, atau sponsor. Format yang disarankan PNG transparan atau SVG.</p><button className="primary-btn" onClick={() => logoInput.current?.click()}><Upload size={15}/> Unggah logo</button><input ref={logoInput} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={e=>handleImage(e.target.files?.[0],'logo')}/>{logoUrl && <div className="asset-preview"><img src={logoUrl}/><span>{logoName}</span></div>}</div>
          <div className="asset-card"><div className="asset-icon purple"><Layers3/></div><h3>Motif kain</h3><p>Unggah motif sublimasi atau tekstur kain untuk diterapkan pada preview 3D.</p><button className="primary-btn" onClick={() => motifInput.current?.click()}><Upload size={15}/> Unggah motif</button><input ref={motifInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>handleImage(e.target.files?.[0],'motif')}/>{motifUrl && <div className="asset-preview"><img src={motifUrl}/><span>{motifName}</span></div>}</div>
          <div className="asset-footnote"><AlertCircle size={15}/> Aset akan dipetakan sebagai tekstur preview. Periksa hasilnya pada mode 3D.</div>
        </div> : <div className="preview-layout">
          <section className="viewer-card three-viewer-card">
            <div className="card-toolbar"><div><b>Jersey 3D Preview</b><small>Model jersey generik • tekstur logo dan motif</small></div><div className="zoom-tools"><button onClick={()=>setAutoRotate(v=>!v)} title="Putar otomatis"><RotateCcw size={15}/></button><span>{autoRotate?'AUTO':'MANUAL'}</span></div></div>
            <Jersey3D logoUrl={logoUrl} motifUrl={motifUrl} jerseyColor={jerseyColor} autoRotate={autoRotate} view={jerseyView}/>
            <div className="three-toolbar">
              <button className={jerseyView==='front'?'active':''} onClick={()=>setJerseyView('front')}>Depan</button>
              <button className={jerseyView==='back'?'active':''} onClick={()=>setJerseyView('back')}>Belakang</button>
              <button className={jerseyView==='side'?'active':''} onClick={()=>setJerseyView('side')}>Samping</button>
              <button onClick={()=>setJerseyView('reset')}>Reset</button>
            </div>
          </section>
          <aside className="properties-card design-controls">
            <div className="properties-head"><div><div className="eyebrow">CUSTOM DESIGN</div><h2>Pengaturan jersey</h2></div><span className="verified-pill"><CheckCircle2 size={13}/> Live</span></div>
            <label className="control-label">Warna dasar jersey</label>
            <div className="color-swatches">
              {['#f4f5f7','#17283c','#d52b36','#126b50','#e6bd35','#513b86'].map(c=><button key={c} aria-label={c} className={jerseyColor===c?'chosen':''} style={{background:c}} onClick={()=>setJerseyColor(c)}/>)}
            </div>
            <label className="control-label" htmlFor="jersey-color">Warna kustom</label>
            <input id="jersey-color" className="color-input" type="color" value={jerseyColor} onChange={e=>setJerseyColor(e.target.value)}/>
            <div className="property-row"><span>Logo</span><b>{logoName || 'Logo contoh'}</b></div>
            <div className="property-row"><span>Motif</span><b>{motifName || 'Tekstur default'}</b></div>
            <div className="property-row"><span>Kontrol kamera</span><b>Drag / scroll</b></div>
            <button className="primary-btn full-btn" onClick={()=>setActiveTab('assets')}><ImagePlus size={15}/> Kelola logo & motif</button>
            <div className="scale-note"><AlertCircle size={15}/><span>Model ini adalah preview visual 3D generik. Belum dibangun dari jahitan aktual panel PDF dan belum menjadi simulasi fisika kain atau bukti ukuran produksi.</span></div>
          </aside>
        </div>}

        <section className="next-step-card"><div className="next-icon"><Layers3 size={19}/></div><div><b>Tahap berikutnya: konstruksi berdasarkan pola dan garis jahit</b><p>Preview 3D saat ini menggunakan bentuk jersey generik. Tahap selanjutnya adalah memetakan garis jahit dari lima panel PDF agar bentuk 3D mengikuti pola produksi.</p></div><button onClick={() => setPdfMessage('Tahap penandaan garis jahit akan menjadi modul berikutnya. Pastikan ukuran panel sudah diverifikasi sebelum membuat pasangan jahit.')}>Lihat rencana <ChevronRight size={15}/></button></section>
        <footer>Jersey 3D Studio <span>•</span> Prototype V2.0 • 3D Preview Beta <span>•</span> Pemrosesan contoh pola dilakukan dari file hd.pdf</footer>
      </main>
    </div>
  </div>;
}
