import { Toaster } from 'react-hot-toast';
import EpisodeForm from './components/EpisodeForm';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-dark text-textMain p-8">
      <Toaster position="top-center" />
      <EpisodeForm />
    </div>
  );
}
