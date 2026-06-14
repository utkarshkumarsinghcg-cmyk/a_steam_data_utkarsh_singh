import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useGames from '../../hooks/useGames';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import BrutalistInput from '../../components/BrutalistInput';
import { addSystemLog } from '../../store/uiSlice';
import toast from 'react-hot-toast';

export const CreateGamePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addNewGame } = useGames();

  const formik = useFormik({
    initialValues: {
      appid: '',
      title: '',
      genres: '',
      price: 0,
      isFreeToPlay: false,
      rating: 8.0,
      downloads: 1000,
      developer: '',
      publisher: '',
      releaseDate: new Date().toISOString().slice(0, 10),
      description: '',
      windows: true,
      mac: false,
      linux: false,
      ram: '8 GB',
      cpu: 'Intel Core i5',
      gpu: 'NVIDIA GTX 1060',
      storage: '50 GB Available'
    },
    validationSchema: Yup.object({
      appid: Yup.number()
        .typeError('AppID must be a numeric sequence')
        .integer('AppID must be an integer')
        .positive('AppID must be positive')
        .required('Unique AppID required'),
      title: Yup.string()
        .required('Game title is required'),
      genres: Yup.string()
        .required('At least one genre is required'),
      price: Yup.number()
        .min(0, 'Price cannot be negative')
        .typeError('Price must be a number'),
      rating: Yup.number()
        .min(0, 'Rating cannot be less than 0')
        .max(10, 'Rating cannot exceed 10')
        .typeError('Rating coefficient must be a number'),
      downloads: Yup.number()
        .min(0, 'Downloads cannot be negative')
        .integer()
        .typeError('Downloads count must be an integer'),
      developer: Yup.string().required('Developer info required'),
      publisher: Yup.string().required('Publisher info required'),
      releaseDate: Yup.date().required('Release date required'),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      // Re-structure fields to match backend expectations
      const payload = {
        appid: Number(values.appid),
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
        // Put a default sample image for screenshots
        screenshots: [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDV-93ifWZJgxJ4ySPjb7Efwjb9x9y3Jv2CPBOYjdljBRVSRDdsqYBRQEI6rPVjQ9F3kvlhYleigqqxjpfAMr7RiR8MreIoBoq9FOJjnmVU0c7LyWOITvpoGpHznymu11S7PzOLrxjYoD7YGUIzTDbdT_5lRfVdUKqBjW7mdHwiXoSydD7XzqTJllQNu2G4dfMrr9TPkdA0y_inSfRSlqYHGvCXaMWExXMgVRIoWA7bvZ9HyDe8xik2Siq-jPdb3_yuHvoTTBIpNWQ"
        ]
      };

      toast.loading('CREATING RECORD...', { id: 'create-loading' });
      const result = await addNewGame(payload);
      toast.dismiss('create-loading');
      
      if (result) {
        toast.success('NEW RECORD COMMITTED TO INDEX.');
        dispatch(addSystemLog(`Created game record: ${values.title}`));
        navigate(`/dashboard/game/${values.appid}`);
      } else {
        toast.error('COMMIT FAILED. APPID MAY ALREADY EXIST.');
      }
    },
  });

  return (
    <div className="flex flex-col select-none text-black dark:text-white">
      {/* Header section */}
      <div className="mb-8 border-b-4 border-black dark:border-white pb-6">
        <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest block mb-2">
          OPERATOR ACTION // CENTRAL ARCHIVE WRITE
        </span>
        <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter leading-none">
          CREATE GAME REGISTRY FILE
        </h1>
      </div>

      {/* Main form card */}
      <BrutalistCard hoverable={false} className="max-w-4xl mx-auto w-full bg-white dark:bg-neutral-900">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <h3 className="font-headline text-2xl font-black border-b-2 border-black dark:border-white pb-2 mb-4">
            [1] IDENTIFICATION PARAMETERS
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrutalistInput
              label="[01] UNIQUE APPID"
              name="appid"
              placeholder="e.g. 104200"
              required={true}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.appid}
              error={formik.errors.appid}
              touched={formik.touched.appid}
            />
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
                  className="rounded-none border-2 border-black focus:ring-0 focus:outline-none cursor-crosshair"
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
              placeholder="e.g. FromSoftware"
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
              placeholder="e.g. Bandai Namco"
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
              label="INITIAL DOWNLOADS COEFFICIENT"
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
              placeholder="ENTER INDEX DESCRIPTION PARAMETERS..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white px-4 py-2 font-mono text-sm focus:ring-0 focus:outline-none w-full cursor-crosshair rounded-none"
            />
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t-2 border-black dark:border-white">
            <BrutalistButton 
              variant="ghost" 
              onClick={() => navigate('/dashboard/registry')}
              className="border"
            >
              ABORT PROTOCOL
            </BrutalistButton>
            <BrutalistButton 
              variant="primary" 
              type="submit"
            >
              COMMIT GAME DATA
            </BrutalistButton>
          </div>
        </form>
      </BrutalistCard>
    </div>
  );
};

export default CreateGamePage;
