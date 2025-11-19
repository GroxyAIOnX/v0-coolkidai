'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Share2, Edit2, X, Upload } from 'lucide-react';

export interface Character {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  tagline: string;
  avatar: string;
  banner?: string;
  interactions: number;
  rating: number;
  tags: string[];
}

interface CharacterProfileModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onChat?: () => void;
}

export default function CharacterProfileModal({
  character,
  isOpen,
  onClose,
  onEdit,
  onChat,
}: CharacterProfileModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Character>>(character || {});

  if (!isOpen || !character) return null;

  const handleSaveEdit = () => {
    // Here you would typically call an API to save changes
    setIsEditMode(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto z-50 animate-in slide-in-from-bottom">
        {/* Header with close button */}
        <div className="sticky top-0 flex justify-between items-center p-4 border-b border-neutral-800 bg-black/95">
          <h2 className="text-xl font-bold text-white">
            {isEditMode ? 'Edit Profile' : character.name}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isEditMode ? (
            <>
              {/* Banner */}
              <div className="relative h-40 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
                {character.banner && (
                  <img
                    src={character.banner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Avatar and Basic Info */}
              <div className="flex gap-4">
                <div className="relative -mt-16 z-10">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-32 h-32 rounded-full border-4 border-black object-cover"
                  />
                </div>

                <div className="flex-1 pt-4">
                  <h3 className="text-2xl font-bold text-white">{character.name}</h3>
                  <p className="text-neutral-400 text-sm">By {character.creatorName}</p>
                  <p className="text-neutral-300 mt-2 italic">"{character.tagline}"</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">About</h4>
                <p className="text-neutral-300 leading-relaxed">{character.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-neutral-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {character.interactions.toLocaleString()}
                  </p>
                  <p className="text-neutral-400 text-sm">Interactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">★ {character.rating}</p>
                  <p className="text-neutral-400 text-sm">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {character.tags.length}
                  </p>
                  <p className="text-neutral-400 text-sm">Tags</p>
                </div>
              </div>

              {/* Tags */}
              {character.tags.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {character.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onChat}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <MessageSquare className="mr-2" size={20} />
                  Message
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-neutral-600 text-white hover:bg-neutral-800"
                  size="lg"
                >
                  <Heart className="mr-2" size={20} />
                  Follow
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-neutral-600 text-white hover:bg-neutral-800"
                  size="lg"
                >
                  <Share2 size={20} />
                </Button>
                {onEdit && (
                  <Button
                    onClick={() => setIsEditMode(true)}
                    variant="outline"
                    className="border-neutral-600 text-white hover:bg-neutral-800"
                    size="lg"
                  >
                    <Edit2 size={20} />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="space-y-4">
                <div>
                  <label className="text-white font-medium">Name</label>
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-medium">Tagline</label>
                  <Input
                    value={editData.tagline || ''}
                    onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-medium">Description</label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white min-h-32"
                  />
                </div>

                <div>
                  <label className="text-white font-medium">Banner</label>
                  <div className="border-2 border-dashed border-neutral-600 rounded-lg p-4 text-center cursor-pointer hover:border-neutral-500 transition-colors">
                    <Upload size={24} className="mx-auto text-neutral-400 mb-2" />
                    <p className="text-neutral-400">Click to upload banner</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditMode(false)}
                    variant="outline"
                    className="flex-1 border-neutral-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
