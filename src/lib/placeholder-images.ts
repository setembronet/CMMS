export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

const placeholderData = {
  "placeholderImages": [
    {
      "id": "user-avatar",
      "description": "A placeholder avatar for a user profile.",
      "imageUrl": "https://picsum.photos/seed/100/100/100",
      "imageHint": "person portrait"
    }
  ]
};

export const PlaceHolderImages: ImagePlaceholder[] = placeholderData.placeholderImages;
