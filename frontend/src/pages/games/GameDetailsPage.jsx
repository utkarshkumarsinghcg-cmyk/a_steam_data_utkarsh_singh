import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useGames from '../../hooks/useGames';
import useAuth from '../../hooks/useAuth';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import DeleteModal from '../../components/DeleteModal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import { addSystemLog } from '../../store/uiSlice';
import toast from 'react-hot-toast';

export const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const {
    selectedGame,
    updates,
    loading,
    error,
    loadGameById,
    removeGame,
    archiveGameEntry,
    restoreGameEntry,
    loadGameUpdates,
    unloadSelectedGame,
    clearErrors
  } = useGames();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadGameById(id);
    loadGameUpdates(id);
    dispatch(addSystemLog(`Inspecting game details appid: ${id}`));
    
    return () => {
      unloadSelectedGame();
    };
  }, [id, dispatch]);

  const handleDeleteConfirm = async () => {
    setDeleteModalOpen(false);
    toast.loading('DELETING ENTRY...', { id: 'delete-loading' });
    const success = await removeGame(id);
    toast.dismiss('delete-loading');
    if (success) {
      toast.success('GAME PURGED FROM SYSTEM ARCHIVE.');
      dispatch(addSystemLog(`Purged game: ${selectedGame?.title || id}`));
      navigate('/dashboard/registry');
    } else {
      toast.error('DELETE FAILED: LEVEL 5 PRIVILEGES ENFORCED');
    }
  };

  const handleArchiveToggle = async () => {
    if (selectedGame.isArchived) {
      toast.loading('RESTORING GAME...', { id: 'archive-loading' });
      const success = await restoreGameEntry(id);
      toast.dismiss('archive-loading');
      if (success) {
        toast.success('ENTRY STATUS RESTORED TO ACTIVE.');
        dispatch(addSystemLog(`Restored game from archive: ${selectedGame.title}`));
      }
    } else {
      toast.loading('ARCHIVING GAME...', { id: 'archive-loading' });
      const success = await archiveGameEntry(id);
      toast.dismiss('archive-loading');
      if (success) {
        toast.success('ENTRY SECURED IN INACTIVE ARCHIVE.');
        dispatch(addSystemLog(`Archived game registry entry: ${selectedGame.title}`));
      }
    }
  };

  if (loading && !selectedGame) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={() => { clearErrors(); loadGameById(id); loadGameUpdates(id); }}
      />
    );
  }

  if (!selectedGame) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold uppercase mb-4">// REGISTRY ENTRY NOT RECORDED</h3>
        <BrutalistButton onClick={() => navigate('/dashboard/registry')}>
          RETURN TO DIRECTORY
        </BrutalistButton>
      </div>
    );
  }

  // Format date
  const releaseDate = selectedGame.releaseDate
    ? new Date(selectedGame.releaseDate).toISOString().slice(0, 10).replace(/-/g, '.')
    : 'UNKNOWN';

  return (
    <div className="flex flex-col select-none text-black dark:text-white">
      {/* Header section */}
      <div className="mb-8 border-b-4 border-black dark:border-white pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest block mb-2">
            REGISTRY // APPID #{selectedGame.appid}
            {selectedGame.isArchived && " // STATUS: ARCHIVED"}
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
            {selectedGame.title}
          </h1>
        </div>
        
        {/* Admin Action Buttons */}
        {user && user.role === 'admin' && (
          <div className="flex flex-wrap gap-2 self-stretch md:self-auto w-full md:w-auto">
            <BrutalistButton
              variant="secondary"
              onClick={() => navigate(`/dashboard/game/${selectedGame.appid}/edit`)}
              className="flex-1 md:flex-none text-xs"
            >
              EDIT
            </BrutalistButton>
            <BrutalistButton
              variant="ghost"
              onClick={handleArchiveToggle}
              className="flex-grow md:flex-none text-xs border"
            >
              {selectedGame.isArchived ? 'RESTORE' : 'ARCHIVE'}
            </BrutalistButton>
            <BrutalistButton
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              className="flex-1 md:flex-none text-xs"
            >
              DELETE
            </BrutalistButton>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters, screenshots, trailers (span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <BrutalistCard hoverable={false} className="p-4" header="GENRE">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-xs font-bold font-mono">
                {Array.isArray(selectedGame.genres) ? selectedGame.genres.join(', ') : selectedGame.genres || 'N/A'}
              </span>
            </BrutalistCard>
            <BrutalistCard hoverable={false} className="p-4" header="PRICE">
              <span className="text-xl font-headline font-black">
                {selectedGame.isFreeToPlay ? 'FREE TO PLAY' : `$${(selectedGame.price || 0).toFixed(2)}`}
              </span>
            </BrutalistCard>
            <BrutalistCard hoverable={false} className="p-4" header="RATING">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-lg">{selectedGame.rating ? `${Math.round(selectedGame.rating * 10)}/100` : 'N/A'}</span>
              </div>
            </BrutalistCard>
          </div>

          {/* Details Description */}
          <BrutalistCard hoverable={false} header="MANIFESTO BRIEFING">
            <p className="font-body text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {selectedGame.description || 'No descriptive parameters registered for this index file.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-black/10 dark:border-white/20 pt-4 font-mono text-xs uppercase">
              <div>
                <span className="opacity-50 block">DEVELOPER:</span>
                <span className="font-bold">{selectedGame.developer || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="opacity-50 block">PUBLISHER:</span>
                <span className="font-bold">{selectedGame.publisher || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="opacity-50 block">RELEASE DATE:</span>
                <span className="font-bold">{releaseDate}</span>
              </div>
              <div>
                <span className="opacity-50 block">DOWNLOADS (YIELD):</span>
                <span className="font-bold">{(selectedGame.downloads || 0).toLocaleString()} DLS</span>
              </div>
            </div>
          </BrutalistCard>

          {/* Screenshots Grid */}
          {selectedGame.screenshots && selectedGame.screenshots.length > 0 && (
            <BrutalistCard hoverable={false} header="VISUAL FOOTAGE FEED">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                {selectedGame.screenshots.map((src, idx) => (
                  <div key={idx} className="border-2 border-black dark:border-white aspect-video bg-black overflow-hidden relative group">
                    <img 
                      src={src} 
                      alt={`Visual stream ${idx}`} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all cursor-crosshair"
                    />
                    <div className="absolute top-2 left-2 bg-black text-white px-1.5 py-0.5 font-mono text-[8px]">
                      STREAM_0{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </BrutalistCard>
          )}
        </div>

        {/* Right Side: Sys Req & Update log feeds (span 4) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* System Requirements */}
          <BrutalistCard hoverable={false} header="HARDWARE CONSTRAINTS">
            <div className="font-mono text-[11px] uppercase space-y-3">
              <div>
                <span className="opacity-50 block">OS PLATFORMS:</span>
                <span className="font-bold">
                  {selectedGame.platforms
                    ? Object.keys(selectedGame.platforms)
                        .filter(k => selectedGame.platforms[k])
                        .join(' // ')
                    : 'N/A'}
                </span>
              </div>
              
              {selectedGame.systemRequirements && (
                <>
                  <div className="border-t border-black/10 dark:border-white/20 my-2 pt-2" />
                  <div>
                    <span className="opacity-50 block">MINIMUM MEMORY:</span>
                    <span className="font-bold">{selectedGame.systemRequirements.ram || '8 GB'}</span>
                  </div>
                  <div>
                    <span className="opacity-50 block">PROCESSOR:</span>
                    <span className="font-bold">{selectedGame.systemRequirements.cpu || 'INTEL CORE I5'}</span>
                  </div>
                  <div>
                    <span className="opacity-50 block">GRAPHICS CORE:</span>
                    <span className="font-bold">{selectedGame.systemRequirements.gpu || 'NVIDIA GTX 1060'}</span>
                  </div>
                  <div>
                    <span className="opacity-50 block">STORAGE CAP:</span>
                    <span className="font-bold">{selectedGame.systemRequirements.storage || '50 GB AVAILABLE'}</span>
                  </div>
                </>
              )}
            </div>
          </BrutalistCard>

          {/* Registry Update log feed */}
          <BrutalistCard hoverable={false} header="ARCHIVE UPDATE LOGSTREAM">
            <div className="font-mono text-[10px] space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {updates && updates.length > 0 ? (
                updates.map((up, idx) => (
                  <div key={idx} className="border-b border-black/10 dark:border-white/20 pb-2 last:border-0 leading-normal">
                    <span className="text-primary font-bold">[{new Date(up.timestamp || Date.now()).toLocaleTimeString()}]</span>
                    <p className="font-bold uppercase text-[9px] mt-0.5">{up.message || up.title}</p>
                    {up.description && <p className="opacity-60 text-[8px] leading-tight mt-0.5">{up.description}</p>}
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 uppercase">
                  // NO CENTRAL MODIFICATIONS RECORDED FOR THIS INDEX.
                </div>
              )}
            </div>
          </BrutalistCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedGame.title}
      />
    </div>
  );
};

export default GameDetailsPage;
