import type { MemoryKey, TemplateId } from "./types";

export type NavigationModel =
  | "film-roll"
  | "physical-canvas"
  | "editorial-spreads"
  | "scene-progression"
  | "desktop-world"
  | "gallery-rooms"
  | "flash-scenes"
  | "quiet-reading"
  | "spatial-wall"
  | "portal-journey"
  | "camera-street"
  | "physical-book";

export type CameraModel =
  | "film-advance"
  | "static-canvas"
  | "page-fold"
  | "dolly-through-scenes"
  | "window-depth"
  | "room-pan"
  | "flash-freeze"
  | "window-light"
  | "free-pan"
  | "refractive-depth"
  | "street-translation"
  | "page-turn";

export interface SoundProfileDefinition {
  options: string[];
  defaultVolume: number;
  entryPrompt: string;
  enterWithSound: string;
  enterQuietly: string;
  controlLabel: string;
}

export interface TemplateExperienceDefinition {
  id: TemplateId;
  navigationModel: NavigationModel;
  spatialModel: string;
  cameraModel: CameraModel;
  interactionProfile: string;
  primaryEffect: string;
  secondaryEffects: readonly [string, string];
  transitionLanguage: string;
  contentFlow: readonly MemoryKey[];
  soundProfile: SoundProfileDefinition;
  capabilities: {
    supportsSound: boolean;
    supportsVideo: boolean;
    supports3D: boolean;
    supportsDrag: boolean;
    supportsSpatialNavigation: boolean;
  };
  finale: string;
  mobileInterpretation: string;
  bestWith: string;
}

const sound = (
  options: string[],
  entryPrompt: string,
  enterWithSound: string,
  enterQuietly: string,
  controlLabel: string,
  defaultVolume = 0.5,
): SoundProfileDefinition => ({ options, entryPrompt, enterWithSound, enterQuietly, controlLabel, defaultVolume });

/**
 * The experience registry is the structural contract for all twelve worlds.
 * Signature effects are deliberately unique; templates may share only small
 * primitives such as media rendering, focus handling, and reduced-motion CSS.
 */
export const EXPERIENCE_REGISTRY: Record<TemplateId, TemplateExperienceDefinition> = {
  "contact-sheet": {
    id: "contact-sheet", navigationModel: "film-roll", spatialModel: "darkroom film bench", cameraModel: "film-advance",
    interactionProfile: "develop · scrub · inspect", primaryEffect: "Darkroom developing plane", secondaryEffects: ["Film scrub", "Photographer loupe"],
    transitionLanguage: "film advance", contentFlow: ["one-sentence", "favorite-place", "three-words", "favorite-song", "known-for", "inside-joke", "always-says", "favorite-movie", "things-they-love", "current-obsession", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Darkroom", "Film Reel"], "THIS ROLL HAS SOUND", "ENTER THE DARKROOM", "DEVELOP QUIETLY", "ROOM TONE", 0.34),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: false },
    finale: "Final frame develops with END OF ROLL", mobileInterpretation: "Vertical film roll", bestWith: "12–36 photos",
  },
  "cut-and-paste": {
    id: "cut-and-paste", navigationModel: "physical-canvas", spatialModel: "layered scrapbook page", cameraModel: "static-canvas",
    interactionProfile: "assemble · tear · peel", primaryEffect: "Physical paper construction", secondaryEffects: ["Tear reveal", "Peel note"],
    transitionLanguage: "paper movement", contentFlow: ["three-words", "things-they-love", "current-obsession", "always-says", "inside-joke", "one-sentence", "favorite-movie", "favorite-song", "favorite-place", "known-for", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Paper Studio", "Cassette & Pencil"], "HEAR THE SCRAPBOOK?", "TURN IT UP", "KEEP CUTTING QUIETLY", "CASSETTE", 0.4),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: false },
    finale: "Collage parts aside to uncover a handwritten note", mobileInterpretation: "Layered scrapbook stack", bestWith: "8–25 photos",
  },
  "cover-star": {
    id: "cover-star", navigationModel: "editorial-spreads", spatialModel: "oversized magazine issue", cameraModel: "page-fold",
    interactionProfile: "fold · mask · read", primaryEffect: "Folding editorial pages", secondaryEffects: ["Portrait inside typography", "Editorial layer depth"],
    transitionLanguage: "page fold", contentFlow: ["known-for", "one-sentence", "three-words", "favorite-song", "favorite-movie", "current-obsession", "things-they-love", "favorite-place", "always-says", "inside-joke", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Fashion Film Ambient"], "THIS ISSUE HAS A SCORE", "READ WITH SOUND", "READ QUIETLY", "ISSUE AUDIO", 0.32),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: false, supportsSpatialNavigation: false },
    finale: "A restrained back cover marked TO BE CONTINUED", mobileInterpretation: "Vertical editorial issue", bestWith: "6–18 photos",
  },
  cinema: {
    id: "cinema", navigationModel: "scene-progression", spatialModel: "connected film sets", cameraModel: "dolly-through-scenes",
    interactionProfile: "enter · dolly · scrub", primaryEffect: "Cinematic camera dolly", secondaryEffects: ["Scrubbed filmstrip timeline", "Projector light"],
    transitionLanguage: "film cut and projector wipe", contentFlow: ["one-sentence", "known-for", "favorite-song", "favorite-movie", "three-words", "current-obsession", "inside-joke", "always-says", "favorite-place", "things-they-love", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Cinematic Warm", "Nostalgic Film", "Dreamlike Score", "Custom"], "THIS FILM HAS A SOUNDTRACK", "ENTER WITH SOUND", "ENTER QUIETLY", "SOUND", 0.58),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: true },
    finale: "Credits roll before a post-credit photograph", mobileInterpretation: "Vertical cinematic scenes", bestWith: "8–25 photos",
  },
  "internet-person": {
    id: "internet-person", navigationModel: "desktop-world", spatialModel: "interactive personal operating system", cameraModel: "window-depth",
    interactionProfile: "open · arrange · execute", primaryEffect: "Desktop window depth", secondaryEffects: ["File explosion", "birthday.exe terminal surprise"],
    transitionLanguage: "window open", contentFlow: ["three-words", "known-for", "current-obsession", "favorite-song", "favorite-movie", "things-they-love", "favorite-place", "inside-joke", "always-says", "one-sentence", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Soft System", "Dial-up Dream"], "START WITH SYSTEM AUDIO?", "BOOT WITH SOUND", "SILENT BOOT", "MEDIA", 0.38),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: true },
    finale: "birthday.exe reports UPDATE COMPLETE", mobileInterpretation: "Mobile operating system", bestWith: "6–40 photos",
  },
  archive: {
    id: "archive", navigationModel: "gallery-rooms", spatialModel: "museum rooms and collection drawers", cameraModel: "room-pan",
    interactionProfile: "tour · open · catalogue", primaryEffect: "Museum gallery pan", secondaryEffects: ["Artifact drawer", "Timeline lens"],
    transitionLanguage: "drawer and catalogue transition", contentFlow: ["known-for", "one-sentence", "favorite-place", "three-words", "things-they-love", "current-obsession", "favorite-song", "favorite-movie", "always-says", "inside-joke", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Archive Room", "Paper & Drawers"], "ENTER THE LISTENING ROOM?", "OPEN WITH AMBIENCE", "QUIET VISIT", "ROOM", 0.28),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: true },
    finale: "Final archive card stamped COLLECTION REMAINS OPEN", mobileInterpretation: "Vertical museum catalogue", bestWith: "12–60 photos",
  },
  "after-dark": {
    id: "after-dark", navigationModel: "flash-scenes", spatialModel: "night photographs at staggered depths", cameraModel: "flash-freeze",
    interactionProfile: "flash · trail · pulse", primaryEffect: "Flash freeze", secondaryEffects: ["Pointer light trails", "Audio-reactive typography"],
    transitionLanguage: "flash cut", contentFlow: ["known-for", "three-words", "favorite-song", "current-obsession", "things-they-love", "inside-joke", "always-says", "favorite-movie", "favorite-place", "one-sentence", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Midnight Pulse", "Late Drive", "Neon Dream", "Custom"], "TURN THE NIGHT ON?", "YES", "NOT NOW", "PULSE", 0.5),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: false, supportsSpatialNavigation: false },
    finale: "The room blacks out after one small final frame", mobileInterpretation: "Grouped vertical flash scenes", bestWith: "10–30 photos",
  },
  "sunday-morning": {
    id: "sunday-morning", navigationModel: "quiet-reading", spatialModel: "sunlit room and letter", cameraModel: "window-light",
    interactionProfile: "pause · breathe · unfold", primaryEffect: "Window light memory", secondaryEffects: ["Photo breathing", "Folded letter"],
    transitionLanguage: "soft light shift", contentFlow: ["one-sentence", "always-says", "things-they-love", "favorite-place", "favorite-song", "favorite-movie", "three-words", "known-for", "current-obsession", "inside-joke", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Morning Room", "Warm Vinyl", "Quiet Acoustic Atmosphere", "Custom"], "A LITTLE SOUND?", "PLAY", "KEEP IT QUIET", "ROOM TONE", 0.26),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: false, supportsDrag: false, supportsSpatialNavigation: false },
    finale: "The birthday message unfolds as a letter", mobileInterpretation: "Quiet vertical diary", bestWith: "5–20 photos",
  },
  "polaroid-wall": {
    id: "polaroid-wall", navigationModel: "spatial-wall", spatialModel: "oversized memory installation", cameraModel: "free-pan",
    interactionProfile: "pan · pull · connect", primaryEffect: "Infinite memory wall", secondaryEffects: ["Pull photo forward", "Memory constellation"],
    transitionLanguage: "camera pan", contentFlow: ["three-words", "one-sentence", "favorite-place", "things-they-love", "inside-joke", "always-says", "favorite-song", "favorite-movie", "current-obsession", "known-for", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Instant Film"], "LET THE WALL MAKE A LITTLE SOUND?", "YES", "NO THANKS", "PHOTO", 0.3),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: true },
    finale: "Camera pulls back to an archive wall only for 21+ uploads", mobileInterpretation: "Vertical spatial clusters", bestWith: "8–40 photos",
  },
  dreamscape: {
    id: "dreamscape", navigationModel: "portal-journey", spatialModel: "floating memory islands", cameraModel: "refractive-depth",
    interactionProfile: "approach · refract · drift", primaryEffect: "Refractive memory portals", secondaryEffects: ["Floating memory islands", "Liquid image distortion"],
    transitionLanguage: "refractive portal", contentFlow: ["unforgettable-memory", "one-sentence", "three-words", "favorite-place", "favorite-song", "favorite-movie", "current-obsession", "things-they-love", "known-for", "always-says", "inside-joke", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Dream", "Floating", "Memory", "Custom"], "LET THE DREAM HAVE SOUND?", "DRIFT IN", "DREAM QUIETLY", "ORB", 0.4),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: false, supportsSpatialNavigation: true },
    finale: "The last portal closes into a tiny glowing photograph", mobileInterpretation: "Reduced-depth portal journey", bestWith: "8–24 photos",
  },
  "poster-city": {
    id: "poster-city", navigationModel: "camera-street", spatialModel: "typographic streets and billboards", cameraModel: "street-translation",
    interactionProfile: "travel · paste · turn", primaryEffect: "Typographic city", secondaryEffects: ["Layered poster walls", "Turning billboard"],
    transitionLanguage: "billboard turn", contentFlow: ["known-for", "one-sentence", "things-they-love", "current-obsession", "favorite-song", "favorite-movie", "three-words", "always-says", "inside-joke", "favorite-place", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Soft City", "Paste-up Studio"], "HEAR THE CITY?", "WALK WITH SOUND", "QUIET STREETS", "CITY", 0.34),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: false, supportsSpatialNavigation: true },
    finale: "The aerial view resolves into the birthday number", mobileInterpretation: "Vertical poster street", bestWith: "6–30 photos",
  },
  yearbook: {
    id: "yearbook", navigationModel: "physical-book", spatialModel: "bound spreads with pockets", cameraModel: "page-turn",
    interactionProfile: "turn · sign · pull", primaryEffect: "Physical page turning", secondaryEffects: ["Expandable signed notes", "Photo pocket pull"],
    transitionLanguage: "page flip", contentFlow: ["three-words", "known-for", "one-sentence", "things-they-love", "always-says", "inside-joke", "favorite-song", "favorite-movie", "favorite-place", "current-obsession", "unforgettable-memory", "birthday-message", "ending-line"],
    soundProfile: sound(["Silent", "Paper & Pencil", "Quiet Room"], "OPEN WITH PAGE SOUNDS?", "YES, OPEN IT", "READ QUIETLY", "PAGE", 0.3),
    capabilities: { supportsSound: true, supportsVideo: true, supports3D: true, supportsDrag: true, supportsSpatialNavigation: false },
    finale: "The back cover carries a handwritten signature", mobileInterpretation: "Swipeable book spreads", bestWith: "10–40 photos",
  },
};

export const experienceFor = (id: TemplateId) => EXPERIENCE_REGISTRY[id];

export function assertUniqueSignatureEffects() {
  const effects = Object.values(EXPERIENCE_REGISTRY).map((experience) => experience.primaryEffect);
  return new Set(effects).size === effects.length;
}
