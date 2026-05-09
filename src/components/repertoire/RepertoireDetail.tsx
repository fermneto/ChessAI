'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  Save,
  X,
  Crown,
  CircleDot,
  Calendar,
  Tag,
  Globe,
  Lock,
  MoreHorizontal,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import StudyBoard from './StudyBoard';

type Repertoire = Database['public']['Tables']['repertoires']['Row'];

interface Props {
  repertoire: Repertoire;
}

export default function RepertoireDetail({ repertoire: initial }: Props) {
  const [repertoire, setRepertoire] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState(repertoire.name);
  const [editDescription, setEditDescription] = useState(repertoire.description ?? '');
  const [editOpeningName, setEditOpeningName] = useState(repertoire.opening_name ?? '');
  const [editColor, setEditColor] = useState(repertoire.color);

  const router = useRouter();
  const supabase = createClient();

  const startEditing = () => {
    setEditName(repertoire.name);
    setEditDescription(repertoire.description ?? '');
    setEditOpeningName(repertoire.opening_name ?? '');
    setEditColor(repertoire.color);
    setEditing(true);
    setShowMenu(false);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    setError(null);

    const { data, error: updateError } = await (supabase
      .from('repertoires') as any)
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
        opening_name: editOpeningName.trim() || null,
        color: editColor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', repertoire.id)
      .select()
      .single();

    const updatedData = data as Repertoire | null;

    if (updateError) {
      setError(updateError.message);
    } else if (updatedData) {
      setRepertoire(updatedData);
      setEditing(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error: deleteError } = await (supabase
      .from('repertoires') as any)
      .delete()
      .eq('id', repertoire.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container-app py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="card-surface p-6">
              {editing ? (
                /* ─── Edit Mode ─── */
                <div className="space-y-5">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                      Nome
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-opening" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                      Abertura principal
                    </label>
                    <input
                      id="edit-opening"
                      type="text"
                      value={editOpeningName}
                      onChange={(e) => setEditOpeningName(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Defesa Siciliana"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
                      Cor
                    </label>
                    <div className="flex gap-3">
                      {(['white', 'black'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium
                            ${editColor === c
                              ? 'border-neutral-900 ring-4 ring-neutral-900/10 text-neutral-900'
                              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                            }
                          `}
                        >
                          {c === 'white' ? <Crown size={16} /> : <CircleDot size={16} />}
                          {c === 'white' ? 'Brancas' : 'Pretas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-desc" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                      Descrição
                    </label>
                    <textarea
                      id="edit-desc"
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input-field resize-none"
                      placeholder="Notas sobre o repertório..."
                      maxLength={500}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={loading || !editName.trim()}
                      className="btn btn-primary btn-md gap-1.5"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={15} />
                          Salvar
                        </>
                      )}
                    </button>
                    <button onClick={cancelEditing} className="btn btn-ghost btn-md gap-1.5">
                      <X size={15} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── View Mode ─── */
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${repertoire.color === 'white'
                          ? 'bg-gradient-to-br from-slate-50 to-white border border-neutral-200'
                          : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
                        }
                      `}>
                        {repertoire.color === 'white'
                          ? <Crown size={22} className="text-neutral-700" />
                          : <CircleDot size={22} className="text-white" />
                        }
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-neutral-900 mb-1">
                          {repertoire.name}
                        </h1>
                        {repertoire.opening_name && (
                          <p className="text-sm text-neutral-500 font-medium">
                            {repertoire.opening_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700"
                        aria-label="Opções"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <AnimatePresence>
                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenu(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-neutral-200 rounded-xl shadow-large overflow-hidden"
                            >
                              <button
                                onClick={startEditing}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Pencil size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(true);
                                  setShowMenu(false);
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {repertoire.description && (
                    <p className="text-body text-sm mt-4 pt-4 border-t border-neutral-100">
                      {repertoire.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Study Board */}
            <div className="card-surface p-6">
              <h2 className="font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Tabuleiro de Estudo
              </h2>
              <StudyBoard 
                repertoire={repertoire} 
                onUpdate={(updated) => setRepertoire(updated)} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="card-surface p-5">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Informações</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-sm">
                  {repertoire.color === 'white'
                    ? <Crown size={15} className="text-neutral-400 flex-shrink-0" />
                    : <CircleDot size={15} className="text-neutral-400 flex-shrink-0" />
                  }
                  <span className="text-neutral-500">Cor:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {repertoire.color === 'white' ? 'Brancas' : 'Pretas'}
                  </span>
                </div>

                {repertoire.eco_code && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag size={15} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-500">ECO:</span>
                    <span className="text-neutral-800 font-medium ml-auto font-mono">
                      {repertoire.eco_code}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  {repertoire.is_public
                    ? <Globe size={15} className="text-neutral-400 flex-shrink-0" />
                    : <Lock size={15} className="text-neutral-400 flex-shrink-0" />
                  }
                  <span className="text-neutral-500">Visibilidade:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {repertoire.is_public ? 'Público' : 'Privado'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={15} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-neutral-500">Criado:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {formatDate(repertoire.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={15} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-neutral-500">Atualizado:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {formatDate(repertoire.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {repertoire.tags && repertoire.tags.length > 0 && (
              <div className="card-surface p-5">
                <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {repertoire.tags.map((tag) => (
                    <span key={tag} className="badge badge-neutral text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card-surface p-5">
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Ações</h3>
              <div className="space-y-1.5">
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <Pencil size={14} />
                  Editar detalhes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Excluir repertório
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 text-center mb-2">
                Excluir repertório?
              </h3>
              <p className="text-sm text-neutral-500 text-center mb-6">
                <strong className="text-neutral-700">{repertoire.name}</strong> será excluído
                permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-ghost btn-md flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="btn btn-md flex-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Excluir'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
