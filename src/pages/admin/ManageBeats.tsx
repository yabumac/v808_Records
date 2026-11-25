import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import type { Beat } from '../../types'

const GENRES = ['TRAP', 'DRILL', 'BOOM BAP', 'AFROBEAT', 'CYBERPUNK']

const empty: FieldValues = {
  title: 'NEW TRACK',
  genre: 'TRAP',
  bpm: '140',
  key_root: 'C Minor',
  price: '29.99',
  cover_url: '/covers/fallen-city.jpg',
  audio_url: '',
  stems_url: '',
  midi_url: '',
  description: '',
  tags: '',
  has_stems: false,
  has_midi: false,
  is_published: true,
}

export default function ManageBeats() {
  const { beats, addBeat, updateBeat, deleteBeat } = useCatalog()
  const { user } = useAuth()
  const [editing, setEditing] = useState<Beat | 'new' | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const patch = {
      title: String(data.get('title') || '').toUpperCase(),
      genre: String(data.get('genre') || 'TRAP'),
      bpm: Number(data.get('bpm') || 120),
      key_root: String(data.get('key_root') || ''),
      price: Number(data.get('price') || 29.99),
      cover_url: String(data.get('cover_url') || ''),
      audio_url: String(data.get('audio_url') || ''),
      stems_url: String(data.get('stems_url') || '') || undefined,
      midi_url: String(data.get('midi_url') || '') || undefined,
      description: String(data.get('description') || ''),
      has_stems: data.get('has_stems') === 'on',
      has_midi: data.get('has_midi') === 'on',
      is_published: data.get('is_published') === 'on',
      tags: String(data.get('tags') || '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    }

    if (editing === 'new') {
      await addBeat({ ...patch, owner_id: user?.id ?? null })
      form.reset()
    } else if (editing) {
      await updateBeat(editing.id, patch)
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">
          {beats.length} tracks in the vault
        </p>
        <button onClick={() => setEditing('new')} className="btn-primary px-5 py-2.5 text-xs">
          <Plus className="w-4 h-4" /> New beat
        </button>
      </div>

      {beats.length === 0 ? (
        <p className="text-center py-16 text-muted font-mono text-sm">Vault is empty.</p>
      ) : (
        <div className="space-y-3">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className="flex items-center gap-4 bg-card rounded-2xl border border-line p-4"
            >
              <img
                src={beat.cover_url}
                alt={beat.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm truncate">{beat.title}</h4>
                  {!beat.is_published && (
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded font-bold uppercase">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted font-mono truncate">
                  {beat.genre} • {beat.bpm} BPM • {beat.key_root} • ${beat.price}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateBeat(beat.id, { is_published: !beat.is_published })}
                  className="p-2 rounded-lg bg-card hover:bg-line border border-line"
                  title={beat.is_published ? 'Unpublish' : 'Publish'}
                >
                  {beat.is_published ? (
                    <Eye className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted" />
                  )}
                </button>
                <button
                  onClick={() => setEditing(beat)}
                  className="p-2 rounded-lg bg-card hover:bg-line border border-line"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${beat.title}"?`)) deleteBeat(beat.id)
                  }}
                  className="p-2 rounded-lg bg-card hover:bg-brand hover:text-white border border-line"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Publish new beat' : 'Edit beat'}>
        {editing !== null && (
          <form key={editing === 'new' ? 'new' : editing.id} onSubmit={handleSubmit} className="space-y-4">
            <BeatFormFields
              initial={
                    editing === 'new'
                      ? empty
                      : {
                          title: editing.title,
                          genre: editing.genre,
                          bpm: String(editing.bpm),
                          key_root: editing.key_root,
                          price: String(editing.price),
                          cover_url: editing.cover_url,
                          audio_url: editing.audio_url,
                          stems_url: editing.stems_url ?? '',
                          midi_url: editing.midi_url ?? '',
                          description: editing.description ?? '',
                          tags: (editing.tags ?? []).join(', '),
                          has_stems: Boolean(editing.has_stems),
                          has_midi: Boolean(editing.has_midi),
                          is_published: editing.is_published,
                        }
              }
            />
            <button type="submit" className="btn-primary w-full py-3 text-xs uppercase tracking-wider">
              {editing === 'new' ? 'Publish to store' : 'Save changes'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}

interface FieldValues {
  title: string
  genre: string
  bpm: string
  key_root: string
  price: string
  cover_url: string
  audio_url: string
  stems_url: string
  midi_url: string
  description: string
  tags: string
  has_stems: boolean
  has_midi: boolean
  is_published: boolean
}

function BeatFormFields({ initial }: { initial: FieldValues }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Track title</label>
          <input name="title" required className="input" defaultValue={initial.title} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Genre</label>
          <select name="genre" className="input [&>option]:bg-card [&>option]:text-ink" defaultValue={initial.genre}>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">BPM</label>
          <input name="bpm" type="number" required className="input" defaultValue={initial.bpm} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Key</label>
          <input name="key_root" required className="input" defaultValue={initial.key_root} placeholder="e.g. F Minor" />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Price ($)</label>
          <input name="price" type="number" step="0.01" required className="input" defaultValue={initial.price} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Cover art URL or path</label>
          <input name="cover_url" type="text" required className="input" defaultValue={initial.cover_url} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Audio sample URL or path</label>
          <input name="audio_url" type="text" className="input" defaultValue={initial.audio_url} />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Stems archive URL (optional)</label>
          <input name="stems_url" type="text" className="input" defaultValue={initial.stems_url} placeholder="Private bucket path or URL" />
        </div>
        <div>
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">MIDI archive URL (optional)</label>
          <input name="midi_url" type="text" className="input" defaultValue={initial.midi_url} placeholder="Private bucket path or URL" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Tags (comma separated)</label>
          <input name="tags" className="input" defaultValue={initial.tags} placeholder="melodic, dark" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Description</label>
          <textarea name="description" rows={3} className="input resize-none" defaultValue={initial.description} />
        </div>
        <div className="col-span-2 flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="has_stems" type="checkbox" defaultChecked={initial.has_stems} className="accent-brand" />
            Includes Stems (unlocks Premium)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="has_midi" type="checkbox" defaultChecked={initial.has_midi} className="accent-brand" />
            Includes MIDI (unlocks Exclusive)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="is_published" type="checkbox" defaultChecked={initial.is_published} className="accent-brand" />
            Publish immediately
          </label>
        </div>
      </div>
    </>
  )
}