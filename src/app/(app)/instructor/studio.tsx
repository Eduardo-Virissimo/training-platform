'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Track {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  trackId: string;
  position: number;
  createdAt: string;
}

interface Training {
  id: string;
  title: string;
  description?: string;
  content?: string;
  moduleId: string;
  createdAt: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  createdAt: string;
}

export default function InstructorStudio() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'track' | 'module' | 'training' | 'quiz' | null>(
    null
  );
  const [parentIds, setParentIds] = useState({ trackId: '', moduleId: '' });
  const [formData, setFormData] = useState({ title: '', description: '', content: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tracksRes, modulesRes, trainingsRes, quizzesRes] = await Promise.all([
        fetch('/api/track'),
        fetch('/api/module'),
        fetch('/api/training'),
        fetch('/api/quiz'),
      ]);

      if (tracksRes.ok) setTracks((await tracksRes.json()).data || []);
      if (modulesRes.ok) setModules((await modulesRes.json()).data || []);
      if (trainingsRes.ok) setTrainings((await trainingsRes.json()).data || []);
      if (quizzesRes.ok) setQuizzes((await quizzesRes.json()).data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  const openDialog = (
    type: 'track' | 'module' | 'training' | 'quiz',
    trackId = '',
    moduleId = ''
  ) => {
    setDialogType(type);
    setParentIds({ trackId, moduleId });
    setFormData({ title: '', description: '', content: '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let url = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
      title: formData.title,
      description: formData.description || undefined,
    };

    switch (dialogType) {
      case 'track':
        url = '/api/track';
        break;
      case 'module':
        url = '/api/module';
        body.trackId = parentIds.trackId;
        body.position = 0;
        break;
      case 'training':
        url = '/api/training';
        body.moduleId = parentIds.moduleId;
        body.content = formData.content || undefined;
        break;
      case 'quiz':
        url = '/api/quiz';
        body.moduleId = parentIds.moduleId;
        body.position = 0;
        break;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setDialogOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    try {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getModulesByTrack = (trackId: string) =>
    modules.filter((m) => m.trackId === trackId).sort((a, b) => a.position - b.position);

  const getTrainingsByModule = (moduleId: string) =>
    trainings.filter((t) => t.moduleId === moduleId);
  const getQuizzesByModule = (moduleId: string) => quizzes.filter((q) => q.moduleId === moduleId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <Button onClick={loadData} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Painel do Instrutor</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog('track')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Trilha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogType === 'track' && 'Nova Trilha'}
                  {dialogType === 'module' && 'Novo Módulo'}
                  {dialogType === 'training' && 'Nova Aula'}
                  {dialogType === 'quiz' && 'Novo Quiz'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                {dialogType === 'training' && (
                  <div>
                    <label className="text-sm font-medium">Conteúdo</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={5}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">
                  Criar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleTrack(track.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedTracks.has(track.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <div>
                    <p className="font-medium">{track.title}</p>
                    {track.description && (
                      <p className="text-xs text-muted-foreground">{track.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDialog('module', track.id);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete('track', track.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {expandedTracks.has(track.id) && (
                <div className="border-t border-border">
                  {getModulesByTrack(track.id).map((module) => (
                    <div key={module.id} className="border-b border-border last:border-b-0">
                      <div
                        className="flex items-center justify-between p-4 pl-12 hover:bg-muted/30 cursor-pointer"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{module.title}</p>
                            {module.description && (
                              <p className="text-xs text-muted-foreground">{module.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDialog('training', track.id, module.id);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Aula
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDialog('quiz', track.id, module.id);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Quiz
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete('module', module.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedModules.has(module.id) && (
                        <div className="p-4 pl-20 space-y-2 bg-muted/20">
                          {getTrainingsByModule(module.id).map((training) => (
                            <div
                              key={training.id}
                              className="flex items-center justify-between p-2 bg-background rounded border border-border"
                            >
                              <div>
                                <p className="text-sm font-medium">{training.title}</p>
                                {training.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {training.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete('training', training.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          {getQuizzesByModule(module.id).map((quiz) => (
                            <div
                              key={quiz.id}
                              className="flex items-center justify-between p-2 bg-background rounded border border-border"
                            >
                              <div>
                                <p className="text-sm font-medium">{quiz.title}</p>
                                {quiz.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {quiz.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete('quiz', quiz.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          {getTrainingsByModule(module.id).length === 0 &&
                            getQuizzesByModule(module.id).length === 0 && (
                              <p className="text-xs text-muted-foreground">Nenhum conteúdo</p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}

                  {getModulesByTrack(track.id).length === 0 && (
                    <div className="p-4 pl-12 text-sm text-muted-foreground">
                      Nenhum módulo. Clique em + para adicionar.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {tracks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma trilha criada.</p>
              <p className="text-sm mt-2">Clique em Nova Trilha para começar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
