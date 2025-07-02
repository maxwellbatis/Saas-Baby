import React, { useState, useEffect } from 'react';

export const AdminCourseEditor: React.FC<{ courseId?: string }> = ({ courseId }) => {
  const [course, setCourse] = useState<any>(null);
  const [isNew, setIsNew] = useState(!courseId);
  const [form, setForm] = useState<any>({ title: '', description: '', category: '', author: '', thumbnail: '' });
  const [modules, setModules] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      fetch(`/api/admin/courses/${courseId}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data.course);
          setForm({
            title: data.course.title,
            description: data.course.description,
            category: data.course.category,
            author: data.course.author,
            thumbnail: data.course.thumbnail
          });
          setModules(data.course.modules || []);
          setMaterials(data.course.materials || []);
          // Log thumbnails das aulas
          (data.course.modules || []).forEach((mod: any) => {
            (mod.lessons || []).forEach((les: any) => {
              console.log('Aula carregada:', les.title, 'thumbnail:', les.thumbnail);
            });
          });
        });
    }
  }, [courseId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, cb?: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await fetch('/api/admin/courses/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (type === 'image' && !cb) setForm((f: any) => ({ ...f, thumbnail: data.url }));
    if (cb) cb(data.url);
  };

  const handleSave = async () => {
    // Validar se todas as aulas têm vídeo
    const lessonsWithoutVideo = modules.flatMap((mod, modIdx) => 
      mod.lessons?.filter((les, lesIdx) => !les.videoUrl).map(les => ({
        module: mod.title,
        lesson: les.title
      })) || []
    );

    if (lessonsWithoutVideo.length > 0) {
      alert(`⚠️ As seguintes aulas não têm vídeo:\n${lessonsWithoutVideo.map(l => `- ${l.module}: ${l.lesson}`).join('\n')}\n\nPor favor, adicione vídeos para todas as aulas antes de salvar.`);
      return;
    }

    // Montar payload completo
    const payload = {
      ...form,
      modules: modules.map((mod, modIdx) => ({
        ...mod,
        lessons: mod.lessons?.map((les, lesIdx) => ({
          ...les,
          // garantir que thumbnail e videoUrl estejam presentes
          thumbnail: les.thumbnail || '',
          videoUrl: les.videoUrl || '',
          order: les.order || (lesIdx + 1),
          duration: les.duration || 0,
          materials: les.materials || []
        })) || [],
        order: mod.order || (modIdx + 1)
      })),
      materials: materials || []
    };

    console.log('Payload enviado para o backend:', payload);

    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/courses' : `/api/admin/courses/${courseId}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (isNew) window.location.href = `/admin/courses/${data.course.id}/edit`;
  };

  // CRUD de módulos
  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: '', order: modules.length + 1, lessons: [] }]);
  };
  const removeModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
  };
  const updateModuleTitle = (idx: number, title: string) => {
    setModules(modules.map((m, i) => i === idx ? { ...m, title } : m));
  };
  // Drag-and-drop módulos
  const moveModule = (from: number, to: number) => {
    const arr = [...modules];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    setModules(arr.map((mod, i) => ({ ...mod, order: i + 1 })));
  };

  // CRUD de aulas
  const addLesson = (modIdx: number) => {
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: [...(m.lessons || []), { id: Date.now().toString(), title: '', videoUrl: '', order: (m.lessons?.length || 0) + 1, materials: [] }] } : m));
  };
  const removeLesson = (modIdx: number, lesIdx: number) => {
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.filter((_: any, j: number) => j !== lesIdx) } : m));
  };
  const updateLessonTitle = (modIdx: number, lesIdx: number, title: string) => {
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, title } : l) } : m));
  };
  // Drag-and-drop aulas
  const moveLesson = (modIdx: number, from: number, to: number) => {
    setModules(modules.map((m, i) => {
      if (i !== modIdx) return m;
      const arr = [...m.lessons];
      const [l] = arr.splice(from, 1);
      arr.splice(to, 0, l);
      return { ...m, lessons: arr.map((les, idx) => ({ ...les, order: idx + 1 })) };
    }));
  };
  // Upload vídeo para aula
  const uploadLessonVideo = (modIdx: number, lesIdx: number, file: File) => {
    handleUpload({ target: { files: [file] } } as any, 'video', (url) => {
      setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, videoUrl: url } : l) } : m));
    });
  };

  // CRUD de materiais de apoio
  const addMaterial = (modIdx: number, lesIdx: number, type: string, title: string, url: string) => {
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, materials: [...(l.materials || []), { id: Date.now().toString(), type, title, url }] } : l) } : m));
  };
  const removeMaterial = (modIdx: number, lesIdx: number, matIdx: number) => {
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, materials: l.materials.filter((_: any, k: number) => k !== matIdx) } : l) } : m));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Novo Curso' : 'Editar Curso'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block mb-2 font-medium">Título</label>
          <input className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent mb-4" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <label className="block mb-2 font-medium">Descrição</label>
          <textarea className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent mb-4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label className="block mb-2 font-medium">Categoria</label>
          <input className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent mb-4" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <label className="block mb-2 font-medium">Autor</label>
          <input className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent mb-4" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
          <label className="block mb-2 font-medium">Banner/Thumbnail</label>
          <input type="file" accept="image/*" onChange={e => handleUpload(e, 'image')} className="mb-4 p-2 border border-border rounded-lg bg-card text-foreground" />
          {form.thumbnail && <img src={form.thumbnail} alt="thumb" className="w-48 h-32 object-cover rounded-lg mb-4 border border-border" />}
          <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-colors">Salvar Curso</button>
          {uploading && <span className="ml-4 text-yellow-500">Enviando arquivo...</span>}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Módulos e Aulas</h2>
          <button onClick={addModule} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg mb-4 transition-colors">+ Adicionar Módulo</button>
          <div className="space-y-6">
            {modules.map((mod, modIdx) => (
              <div key={mod.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <input className="flex-1 bg-background p-2 rounded-lg border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent" value={mod.title} onChange={e => updateModuleTitle(modIdx, e.target.value)} placeholder="Título do módulo" />
                  <button onClick={() => removeModule(modIdx)} className="text-destructive hover:text-destructive/80 ml-2 px-2 py-1 rounded transition-colors">Excluir</button>
                  {modIdx > 0 && <button onClick={() => moveModule(modIdx, modIdx - 1)} className="ml-2 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors">↑</button>}
                  {modIdx < modules.length - 1 && <button onClick={() => moveModule(modIdx, modIdx + 1)} className="ml-2 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors">↓</button>}
                </div>
                <button onClick={() => addLesson(modIdx)} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg mb-2 transition-colors">+ Aula</button>
                <div className="space-y-2">
                  {mod.lessons?.map((les: any, lesIdx: number) => (
                    <div key={les.id} className="bg-background rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <input className="flex-1 bg-card p-2 rounded-lg border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent" value={les.title} onChange={e => updateLessonTitle(modIdx, lesIdx, e.target.value)} placeholder="Título da aula" />
                        <button onClick={() => removeLesson(modIdx, lesIdx)} className="text-destructive hover:text-destructive/80 ml-2 px-2 py-1 rounded transition-colors">Excluir</button>
                        {lesIdx > 0 && <button onClick={() => moveLesson(modIdx, lesIdx, lesIdx - 1)} className="ml-2 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors">↑</button>}
                        {lesIdx < mod.lessons.length - 1 && <button onClick={() => moveLesson(modIdx, lesIdx, lesIdx + 1)} className="ml-2 px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors">↓</button>}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium">Vídeo:</label>
                        <input type="file" accept="video/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) uploadLessonVideo(modIdx, lesIdx, file);
                        }} className="p-1 border border-border rounded bg-card text-foreground" />
                        {les.videoUrl && <a href={les.videoUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary ml-2">Ver vídeo</a>}
                        {!les.videoUrl && <span className="text-red-500 text-xs ml-2">⚠️ Vídeo obrigatório</span>}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium">Thumbnail:</label>
                        <input type="file" accept="image/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload({ target: { files: [file] } } as any, 'image', (url) => {
                            setModules(modules => modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => {
                              if (j === lesIdx) {
                                const updated = { ...l, thumbnail: url };
                                console.log('Thumbnail da aula após upload:', updated.thumbnail);
                                return updated;
                              }
                              return l;
                            }) } : m));
                          });
                        }} className="p-1 border border-border rounded bg-card text-foreground" />
                        {les.thumbnail && (
                          <div className="flex items-center gap-2">
                            <img src={les.thumbnail} alt="thumb" className="w-16 h-12 object-cover rounded border border-border" />
                            <a href={les.thumbnail} target="_blank" rel="noopener noreferrer" className="underline text-primary">Ver</a>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium">Materiais de Apoio:</label>
                        <button onClick={() => addMaterial(modIdx, lesIdx, 'pdf', 'Novo PDF', '')} className="ml-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded transition-colors">+ PDF</button>
                        <div className="space-y-1 mt-1">
                          {les.materials?.map((mat: any, matIdx: number) => (
                            <div key={mat.id} className="flex items-center gap-2">
                              <input className="bg-card p-1 rounded border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent flex-1" value={mat.title} onChange={e => {
                                setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, materials: l.materials.map((mm: any, k: number) => k === matIdx ? { ...mm, title: e.target.value } : mm) } : l) } : m));
                              }} placeholder="Título do material" />
                              <input type="file" accept=".pdf,.doc,.docx,image/*,video/*" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload({ target: { files: [file] } } as any, mat.type, (url) => {
                                  setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: m.lessons.map((l: any, j: number) => j === lesIdx ? { ...l, materials: l.materials.map((mm: any, k: number) => k === matIdx ? { ...mm, url } : mm) } : l) } : m));
                                });
                              }} className="p-1 border border-border rounded bg-card text-foreground" />
                              {mat.url && <a href={mat.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">Ver</a>}
                              <button onClick={() => removeMaterial(modIdx, lesIdx, matIdx)} className="text-destructive hover:text-destructive/80 px-2 py-1 rounded transition-colors">Excluir</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 