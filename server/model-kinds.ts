// A model that draws pictures is never a small text model: its name can carry a quick-looking word
// (`gemini-nano-banana-2.1` has "nano"), so both the quick-turn and the background selectors skip it.
const IMAGE_MODEL = /(?:^|[-_/. ])(?:image|images|imagegen|text-to-image|nano-banana\w*|dall-e\w*|dalle\w*|flux\w*|stable-diffusion\w*|sdxl\w*|imagen\w*|ideogram\w*|recraft\w*|seedream\w*|midjourney\w*)(?=$|[-_/. :])/i;

/** True for an image-generation model id or label, in any provider's spelling. */
export function isImageModel(name: string): boolean {
  return IMAGE_MODEL.test(name);
}
