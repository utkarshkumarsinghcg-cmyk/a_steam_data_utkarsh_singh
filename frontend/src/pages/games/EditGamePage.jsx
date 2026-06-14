import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useGames from '../../hooks/useGames';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import BrutalistInput from '../../components/BrutalistInput';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import { addSystemLog } from '../../store/uiSlice';
import toast from 'react-hot-toast';

export const EditGamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedGame, loading, error, loadGameById, editGame, clearErrors } = useGames();

  useEffect(() => {
    loadGameById(id);
    dispatch(addSystemLog(`Modifying game record appid: ${id}`));
  }, [id, dispatch]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: selectedGame?.title || '',
      genres: selectedGame?.genres ? (Array.isArray(selectedGame.genres) ? selectedGame.genres.join(', ') : selectedGame.genres) : '',
      price: selectedGame?.price || 0,
      isFreeToPlay: selectedGame?.isFreeToPlay || false,
      rating: selectedGame?.rating || 8.0,
      downloads: selectedGame?.downloads || 0,
      developer: selectedGame?.developer || '',
      publisher: selectedGame?.publisher || '',
      releaseDate: selectedGame?.releaseDate ? new Date(selectedGame.releaseDate).toISOString().slice(0, 10) : '',
      description: selectedGame?.description || '',
      windows: selectedGame?.platforms?.windows || false,
      mac: selectedGame?.platforms?.mac || false,
      linux: selectedGame?.platforms?.linux || false,
      ram: selectedGame?.systemRequirements?.ram || '8 GB',
      cpu: selectedGame?.systemRequirements?.cpu || 'Intel Core i5',
      gpu: selectedGame?.systemRequirements?.gpu || 'NVIDIA GTX 1060',
      storage: selectedGame?.systemRequirements?.storage || '50 GB Available'
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Game title is required'),
      genres: Yup.string().required('At least one genre is required'),
      price: Yup.number().min(0, 'Price cannot be negative').typeError('Price must be a number'),
      rating: Yup.number().min(0).max(10).typeError('Rating must be a number'),
      downloads: Yup.number().min(0).integer().typeError('Downloads must be an integer'),
      developer: Yup.string().required('Developer info required'),
      publisher: Yup.string().required('Publisher info required'),
      releaseDate: Yup.date().required('Release date required'),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      const payload = {
        title: values.title,
        description: values.description,
        genres: values.genres.split(',').map((g) => g.trim().toUpperCase()),
        price: values.isFreeToPlay ? 0 : Number(values.price),
        isFreeToPlay: values.isFreeToPlay,
        rating: Number(values.rating),
        downloads: Number(values.downloads),
        developer: values.developer,
        publisher: values.publisher,
        releaseDate: new Date(values.releaseDate).toISOString(),
        platforms: {
          windows: values.windows,
          mac: values.mac,
          linux: values.linux,
        },
        systemRequirements: {
          ram: values.ram,
          cpu: values.cpu,
          gpu: values.gpu,
          storage: values.storage,
        },
      };

      toast.loading('UPDATING RECORD...', { id: 'update-loading' });
      const result = await editGame(id, payload);
      toast.dismiss('update-loading');
      
      if (result) {
        toast.success('RECORD UPDATE COMMITTED TO INDEX.');
        dispatch(addSystemLog(`Modified game record: ${values.title}`));
        navigate(`/dashboard/game/${id}`);
      } else {
        toast.error('COMMIT FAILED. VALIDATION PROTOCOLS REJECTED DATA.');
      }
    },
  });

  if (loading && !selectedGame) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={() => { clearErrors(); loadGameById(id); }}
      />
    );
  }

  return (
    <div className="flex flex-col select-none text-black dark:text-white">
      {/* Header section */}
      <div className="mb-8 border-b-4 border-black dark:border-white pb-6">
        <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest block mb-2">
          OPERATOR ACTION // CENTRAL ARCHIVE MUTATION
        </span>
        <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
          EDIT GAME RECORD: #{id}
        </h1>
      </div>

      {/* Main form card */}
      <BrutalistCard hoverable={false} className="max-w-4xl mx-auto w-full bg-white dark:bg-neutral-900">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <h3 className="font-headline text-2xl font-black border-b-2 border-black dark:border-white pb-2 mb-4">
            [1] IDENTIFICATION PARAMETERS
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col mb-4 w-full">
              <label className="font-mono text-xs font-bold uppercase mb-1.5 opacity-50">
                [01] UNIQUE APPID (READ ONLY)
              </label>
              <input
                disabled={true}
                value={`#${id}`}
                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-2 border-black dark:border-white px-4 py-2 font-mono text-sm focus:outline-none w-full"
              />
            </div>
            
            <BrutalistInput
              label="[02] GAME TITLE"
              name="title"
              placeholder="e.g. ELDEN RING"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              error={formik.errors.title}
              touched={formik.touched.title}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BrutalistInput
              label="[03] GENRE(S) (COMMA SEPARATED)"
              name="genres"
              placeholder="RPG, ACTION, ADVENTURE"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.genres}
              error={formik.errors.genres}
              touched={formik.touched.genres}
            />
            
            <div className="flex flex-col">
              <BrutalistInput
                label="[04] PRICE VALUE ($)"
                name="price"
                type="number"
                disabled={formik.values.isFreeToPlay}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.isFreeToPlay ? 0 : formik.values.price}
                error={formik.errors.price}
                touched={formik.touched.price}
              />
              <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-neutral-600 dark:text-neutral-300 -mt-2.5 cursor-crosshair">
                <input
                  name="isFreeToPlay"
                  type="checkbox"
                  checked={formik.values.isFreeToPlay}
                  onChange={formik.handleChange}
                  className="rounded-none border-2 border-black focus:ring-0 cursor-crosshair"
                />
                Is Free to Play
              </label>
            </div>

            <BrutalistInput
              label="[05] RATING COEFFICIENT (0.0 - 10.0)"
              name="rating"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rating}
              error={formik.errors.rating}
              touched={formik.touched.rating}
            />
          </div>

          <h3 className="font-headline text-2xl font-black border-b-2 border-black dark:border-white pb-2 pt-4 mb-4">
            [2] METADATA &amp; DISTRIBUTION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BrutalistInput
              label="DEVELOPER LOG"
              name="developer"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.developer}
              error={formik.errors.developer}
              touched={formik.touched.developer}
            />
            <BrutalistInput
              label="PUBLISHER LOG"
              name="publisher"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.publisher}
              error={formik.errors.publisher}
              touched={formik.touched.publisher}
            />
            <BrutalistInput
              label="RELEASE CYCLE DATE"
              name="releaseDate"
              type="date"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.releaseDate}
              error={formik.errors.releaseDate}
              touched={formik.touched.releaseDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrutalistInput
              label="DOWNLOADS COEFFICIENT"
              name="downloads"
              type="number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.downloads}
              error={formik.errors.downloads}
              touched={formik.touched.downloads}
            />
            
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold uppercase mb-2">TARGET OPERATIONAL SYSTEMS</span>
              <div className="flex gap-4 font-mono text-xs uppercase font-bold mt-2">
                <label className="flex items-center gap-1.5 cursor-crosshair">
                  <input
                    name="windows"
                    type="checkbox"
                    checked={formik.values.windows}
                    onChange={formik.handleChange}
                    className="rounded-none border-2 border-black focus:ring-0 cursor-crosshair"
                  />
                  Windows
                </label>
                <label className="flex items-center gap-1.5 cursor-crosshair">
                  <input
                    name="mac"
                    type="checkbox"
                    checked={formik.values.mac}
                    onChange={formik.handleChange}
                    className="rounded-none border-2 border-black focus:ring-0 cursor-crosshair"
                  />
                  Mac / OS X
                </label>
                <label className="flex items-center gap-1.5 cursor-crosshair">
                  <input
                    name="linux"
                    type="checkbox"
                    checked={formik.values.linux}
                    onChange={formik.handleChange}
                    className="rounded-none border-2 border-black focus:ring-0 cursor-crosshair"
                  />
                  Linux / SteamOS
                </label>
              </div>
            </div>
          </div>

          <h3 className="font-headline text-2xl font-black border-b-2 border-black dark:border-white pb-2 pt-4 mb-4">
            [3] HARDWARE CONSTRAINT MAPPING (SYSTEM REQUIREMENTS)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <BrutalistInput
              label="MINIMUM RAM"
              name="ram"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.ram}
            />
            <BrutalistInput
              label="PROCESSOR SPEED"
              name="cpu"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.cpu}
            />
            <BrutalistInput
              label="GRAPHICS ENGINE"
              name="gpu"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.gpu}
            />
            <BrutalistInput
              label="REQUIRED STORAGE"
              name="storage"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.storage}
            />
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold uppercase mb-2">MANIFESTO DESCRIPTION</span>
            <textarea
              name="description"
              rows="4"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-4 py-2 font-mono text-sm focus:ring-0 focus:outline-none w-full cursor-crosshair rounded-none"
            />
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t-2 border-black dark:border-white">
            <BrutalistButton 
              variant="ghost" 
              onClick={() => navigate(`/dashboard/game/${id}`)}
              className="border"
            >
              ABORT PROTOCOL
            </BrutalistButton>
            <BrutalistButton 
              variant="primary" 
              type="submit"
            >
              COMMIT CHANGES
            </BrutalistButton>
          </div>
        </form>
      </BrutalistCard>
    </div>
  );
};

export default EditGamePage;
