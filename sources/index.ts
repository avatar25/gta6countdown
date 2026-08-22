import netflixPremiere from './netflix-premiere';
import playstationStore from './playstation-store';
import pressCoverage from './press-coverage';
import rockstarSite from './rockstar-site';
import rockstarYoutube from './rockstar-youtube';
import xboxStore from './xbox-store';
import type { Source } from './types';

/**
 * The registry. Adding a source means adding a file here — nothing downstream
 * knows what any of them are watching.
 *
 * Deliberately absent: any scraper pointed at leak communities. Unverified
 * material stays hand-curated, and nothing here links to where it is hosted.
 */
const sources: Source[] = [
  xboxStore,
  playstationStore,
  rockstarYoutube,
  rockstarSite,
  netflixPremiere,
  pressCoverage,
];

export default sources;

export function sourceById(id: string): Source | undefined {
  return sources.find((source) => source.id === id);
}
