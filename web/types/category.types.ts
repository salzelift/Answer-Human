export type Category = {
    id: string;
    parentCategoryId: string | null;
    name: string;
    description: string;
    imageUrl: string;
    slug: string;
    subCategories: Category[];
    createdAt: Date;
    updatedAt: Date;
};
  