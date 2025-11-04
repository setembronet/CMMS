export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [
    {
      "id": "user-avatar",
      "description": "A placeholder avatar for a user profile.",
      "imageUrl": "https://picsum.photos/seed/100/100/100",
      "imageHint": "person portrait"
    }
];
